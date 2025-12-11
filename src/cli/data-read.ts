#!/usr/bin/env node
/**
 * Data Reader CLI
 *
 * Read and analyze data files (Excel, CSV, JSON)
 * Supports large files (>100MB) via automatic streaming
 *
 * Usage:
 *   npx tsx src/cli/data-read.ts --file <path> [options]
 *
 * Options:
 *   --file <path>       Path to the data file (required)
 *   --info              Show file information
 *   --schema            Detect and display schema
 *   --preview           Preview first rows
 *   --rows <n>          Number of rows to preview (default: 10)
 *   --quality           Generate quality report
 *   --sheets            List sheets (Excel only)
 *   --sheet <name>      Sheet name for Excel files
 *   --delimiter <char>  Delimiter for CSV files
 *   --encoding <enc>    File encoding (default: utf-8)
 *   --output <path>     Output file for results (JSON)
 *   --format <fmt>      Output format: json, markdown, table (default: auto)
 *   --stats             Get file statistics only (fast, no data loading)
 *   --sample <rate>     Sample rate (0-1) for large files (e.g., 0.1 = 10%)
 *   --max-rows <n>      Maximum rows to read (for large files)
 *   --streaming         Force streaming mode (auto-enabled for files >100MB)
 *   --verbose           Verbose output
 *   --debug             Debug mode
 *   --quiet             Minimal output
 */

import { parseArgs } from 'node:util';
import { statSync, existsSync, writeFileSync } from 'node:fs';
import { extname, basename } from 'node:path';
import { DataReaderService } from '../lib/data/DataReaderService.js';
import type { ReadOptions } from '../types/data.js';
import {
  Logger,
  Progress,
  OutputFormatter,
  CliError,
  handleError,
  formatBytes,
  formatDuration,
  getVerbosity,
  getOutputFormat,
  COMMON_CLI_OPTIONS,
  type OutputFormat,
  type CommonArgs,
} from './utils/index.js';

interface CliArgs extends CommonArgs {
  file?: string;
  info?: boolean;
  schema?: boolean;
  preview?: boolean;
  rows?: number;
  quality?: boolean;
  sheets?: boolean;
  sheet?: string;
  delimiter?: string;
  encoding?: string;
  stats?: boolean;
  sample?: number;
  'max-rows'?: number;
  streaming?: boolean;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      file: { type: 'string', short: 'f' },
      info: { type: 'boolean', short: 'i' },
      schema: { type: 'boolean', short: 's' },
      preview: { type: 'boolean', short: 'p' },
      rows: { type: 'string', short: 'r' },
      quality: { type: 'boolean', short: 'q' },
      sheets: { type: 'boolean' },
      sheet: { type: 'string' },
      delimiter: { type: 'string', short: 'd' },
      encoding: { type: 'string', short: 'e' },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
      stats: { type: 'boolean' },
      sample: { type: 'string' },
      'max-rows': { type: 'string' },
      streaming: { type: 'boolean' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    rows: values.rows ? parseInt(values.rows, 10) : 10,
    sample: values.sample ? parseFloat(values.sample) : undefined,
    'max-rows': values['max-rows'] ? parseInt(values['max-rows'], 10) : undefined,
    format: values.format as OutputFormat | undefined,
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Data Reader CLI - Read and analyze data files
Supports large files (>100MB) via automatic streaming

Usage:
  npx tsx src/cli/data-read.ts --file <path> [options]

Options:
  -f, --file <path>       Path to the data file (required)
  -i, --info              Show file information
  -s, --schema            Detect and display schema
  -p, --preview           Preview first rows
  -r, --rows <n>          Number of rows to preview (default: 10)
  -q, --quality           Generate quality report
      --sheets            List sheets (Excel only)
      --sheet <name>      Sheet name for Excel files
  -d, --delimiter <char>  Delimiter for CSV files
  -e, --encoding <enc>    File encoding (default: utf-8)
  -o, --output <path>     Output file for results (JSON)
  -F, --format <fmt>      Output format: json, markdown, table (default: auto)
  -v, --verbose           Verbose output
      --debug             Debug mode with timing
      --quiet             Minimal output
  -h, --help              Show this help message

Large File Options:
      --stats             Get file statistics only (fast, no full data loading)
      --sample <rate>     Sample rate 0-1 for large files (e.g., 0.1 = 10%)
      --max-rows <n>      Maximum rows to read
      --streaming         Force streaming mode (auto-enabled for files >100MB)

Examples:
  npx tsx src/cli/data-read.ts --file data.xlsx --info
  npx tsx src/cli/data-read.ts --file data.csv --schema --preview
  npx tsx src/cli/data-read.ts --file data.xlsx --sheet "Sheet1" --quality
  npx tsx src/cli/data-read.ts --file data.xlsx --sheets
  npx tsx src/cli/data-read.ts --file data.csv --format json --output results.json

  # Large files (>100MB):
  npx tsx src/cli/data-read.ts --file large.csv --stats          # Quick stats
  npx tsx src/cli/data-read.ts --file large.csv --max-rows 10000 # First 10K rows
  npx tsx src/cli/data-read.ts --file large.csv --sample 0.01    # 1% sample
`);
}

function getFormatName(ext: string): string {
  const formats: Record<string, string> = {
    '.xlsx': 'Excel (xlsx)',
    '.xls': 'Excel (xls)',
    '.csv': 'CSV',
    '.tsv': 'TSV',
    '.json': 'JSON',
  };
  return formats[ext] || 'Unknown';
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const args = parseArguments();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const logger = new Logger(getVerbosity(args));
  const formatter = new OutputFormatter(getOutputFormat(args), logger);

  try {
    if (!args.file) {
      throw new CliError('--file is required. Use --help for usage information.');
    }

    if (!existsSync(args.file)) {
      throw new CliError(`File not found: ${args.file}`);
    }

    const reader = new DataReaderService();
    const output: Record<string, unknown> = {};
    const fileStats = statSync(args.file);
    const isLargeFile = fileStats.size > 100 * 1024 * 1024; // >100MB

    // Default to info if no action specified
    if (!args.info && !args.schema && !args.preview && !args.quality && !args.sheets && !args.stats) {
      args.info = true;
    }

    logger.debug(`Processing file: ${args.file}`);

    // Warn about large files
    if (isLargeFile && !args.stats && !args['max-rows'] && !args.sample) {
      logger.warn(`Large file detected (${formatBytes(fileStats.size)}). Consider using --stats, --max-rows, or --sample.`);
    }

    // File info
    if (args.info) {
      const ext = extname(args.file).toLowerCase();
      const name = basename(args.file);

      const fileInfo: Record<string, string | number> = {
        File: name,
        Path: args.file,
        Size: formatBytes(fileStats.size),
        Format: getFormatName(ext),
        Modified: fileStats.mtime.toISOString().split('T')[0],
      };

      // Add large file indicator
      if (isLargeFile) {
        fileInfo['Mode'] = 'Streaming (auto-enabled for large files)';
      }

      formatter.keyValue(fileInfo, 'File Information');
      output.fileInfo = fileInfo;
      logger.blank();
    }

    // Quick stats for large files (no data loading)
    if (args.stats) {
      const progress = new Progress('Getting file statistics', !args.quiet);
      progress.start();

      try {
        const stats = await reader.getFileStatistics(args.file, {
          sheet: args.sheet,
          delimiter: args.delimiter,
          encoding: args.encoding as BufferEncoding,
        });
        progress.succeed(`Found ${stats.rowCount.toLocaleString()} rows, ${stats.columnCount} columns`);

        const statsInfo = {
          'Total Rows': stats.rowCount.toLocaleString(),
          'Columns': stats.columnCount,
          'File Size': formatBytes(stats.fileSize),
          'Format': stats.format.toUpperCase(),
          'Est. Memory': formatBytes(stats.estimatedMemory),
        };

        formatter.keyValue(statsInfo, 'File Statistics');
        logger.blank();

        if (stats.columns.length > 0) {
          logger.section('Columns');
          logger.info(stats.columns.join(', '));
          logger.blank();
        }

        if (stats.sampleSchema) {
          logger.section('Schema (from sample)');
          formatter.table(
            ['Name', 'Type', 'Nullable'],
            stats.sampleSchema.columns.map((col) => [col.name, col.type, col.nullable ? 'Yes' : 'No']),
          );
          logger.blank();
        }

        output.statistics = stats;
      } catch (e) {
        progress.fail('Failed to get statistics');
        throw new CliError(`Error getting statistics: ${(e as Error).message}`);
      }
    }

    // List sheets for Excel files
    if (args.sheets) {
      const ext = extname(args.file).toLowerCase();
      if (ext === '.xlsx' || ext === '.xls') {
        const progress = new Progress('Listing sheets', !args.quiet);
        progress.start();

        try {
          const sheets = await reader.listSheets(args.file);
          progress.succeed(`Found ${sheets.length} sheets`);

          output.sheets = sheets;
          formatter.table(
            ['#', 'Name', 'Rows', 'Columns'],
            sheets.map((sheet, i) => [i + 1, sheet.name, sheet.rowCount, sheet.columnCount]),
            'Excel Sheets'
          );
          logger.blank();
        } catch (e) {
          progress.fail('Failed to list sheets');
          throw new CliError(`Error listing sheets: ${(e as Error).message}`);
        }
      } else {
        logger.warn('--sheets option is only available for Excel files');
      }
    }

    // Read the file for schema/preview/quality
    if (args.schema || args.preview || args.quality) {
      const options: ReadOptions = {};
      if (args.sheet) options.sheet = args.sheet;
      if (args.delimiter) options.delimiter = args.delimiter;
      if (args.encoding) options.encoding = args.encoding as BufferEncoding;
      if (args.streaming) options.streaming = args.streaming;
      if (args.sample) options.sampleRate = args.sample;

      // Determine max rows: explicit --max-rows or --rows for preview
      if (args['max-rows']) {
        options.maxRows = args['max-rows'];
      } else if (args.preview && args.rows) {
        options.maxRows = args.rows;
      }

      const modeInfo = args.sample ? ` (${(args.sample * 100).toFixed(0)}% sample)` :
                       options.maxRows ? ` (max ${options.maxRows.toLocaleString()} rows)` : '';
      const progress = new Progress(`Reading file${modeInfo}`, !args.quiet);
      progress.start();

      logger.debug(`Read options: ${JSON.stringify(options)}`);

      try {
        const result = await reader.read(args.file, options);
        const sampledInfo = args.sample ? ' (sampled)' : '';
        progress.succeed(`Read ${result.dataFrame.rowCount.toLocaleString()} rows, ${result.schema.columns.length} columns${sampledInfo}`);

        logger.debug(`Read completed in ${formatDuration(Date.now() - startTime)}`);

        if (args.schema) {
          logger.section('Schema Detection');
          logger.info(`**Rows**: ${result.schema.rowCount}`);
          logger.info(`**Columns**: ${result.schema.columns.length}`);
          logger.info(`**Format**: ${result.schema.format}`);
          logger.blank();

          formatter.table(
            ['Name', 'Type', 'Nullable', 'Unique', 'Nulls', 'Examples'],
            result.schema.columns.map((col) => [
              col.name,
              col.type,
              col.nullable ? 'Yes' : 'No',
              col.unique,
              col.nullCount,
              col.examples.slice(0, 2).map(String).join(', '),
            ]),
            'Columns'
          );
          output.schema = result.schema;
          logger.blank();
        }

        if (args.preview) {
          const preview = reader.getPreview(result.dataFrame, args.rows);
          logger.section('Data Preview');
          logger.info(`Showing ${preview.previewRows} of ${preview.totalRows} rows`);
          logger.blank();

          formatter.table(preview.headers, preview.rows);
          output.preview = preview;
          logger.blank();
        }

        if (args.quality) {
          logger.section('Quality Report');
          const q = result.quality;

          const qualityMetrics = {
            Completeness: `${(q.completeness * 100).toFixed(1)}%`,
            Uniqueness: `${(q.uniqueness * 100).toFixed(1)}%`,
            Validity: `${(q.validity * 100).toFixed(1)}%`,
            Consistency: `${(q.consistency * 100).toFixed(1)}%`,
          };
          formatter.keyValue(qualityMetrics);
          logger.blank();

          if (q.issues.length > 0) {
            logger.info('### Issues Found\n');
            q.issues.forEach((issue) => {
              const icon = issue.severity === 'error' ? '✗' : '⚠';
              logger.info(`${icon} **${issue.column}**: ${issue.message}`);
            });
          } else {
            logger.success('No quality issues detected');
          }
          output.quality = result.quality;
          logger.blank();
        }
      } catch (e) {
        progress.fail('Failed to read file');
        throw new CliError(`Error reading file: ${(e as Error).message}`);
      }
    }

    // Write output if requested
    if (args.output && Object.keys(output).length > 0) {
      writeFileSync(args.output, JSON.stringify(output, null, 2));
      logger.success(`Results saved to ${args.output}`);
    }

    logger.debug(`Total execution time: ${formatDuration(Date.now() - startTime)}`);
  } catch (error) {
    handleError(error, logger);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
