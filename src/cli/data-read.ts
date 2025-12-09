#!/usr/bin/env node
/**
 * Data Reader CLI
 *
 * Read and analyze data files (Excel, CSV, JSON)
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
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    rows: values.rows ? parseInt(values.rows, 10) : 10,
    format: values.format as OutputFormat | undefined,
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Data Reader CLI - Read and analyze data files

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

Examples:
  npx tsx src/cli/data-read.ts --file data.xlsx --info
  npx tsx src/cli/data-read.ts --file data.csv --schema --preview
  npx tsx src/cli/data-read.ts --file data.xlsx --sheet "Sheet1" --quality
  npx tsx src/cli/data-read.ts --file data.xlsx --sheets
  npx tsx src/cli/data-read.ts --file data.csv --format json --output results.json
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

    // Default to info if no action specified
    if (!args.info && !args.schema && !args.preview && !args.quality && !args.sheets) {
      args.info = true;
    }

    logger.debug(`Processing file: ${args.file}`);

    // File info
    if (args.info) {
      const stats = statSync(args.file);
      const ext = extname(args.file).toLowerCase();
      const name = basename(args.file);

      const fileInfo = {
        File: name,
        Path: args.file,
        Size: formatBytes(stats.size),
        Format: getFormatName(ext),
        Modified: stats.mtime.toISOString().split('T')[0],
      };

      formatter.keyValue(fileInfo, 'File Information');
      output.fileInfo = fileInfo;
      logger.blank();
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
      if (args.rows) options.maxRows = args.preview ? args.rows : undefined;

      const progress = new Progress('Reading file', !args.quiet);
      progress.start();

      logger.debug(`Read options: ${JSON.stringify(options)}`);

      try {
        const result = await reader.read(args.file, options);
        progress.succeed(`Read ${result.dataFrame.rowCount} rows, ${result.schema.columns.length} columns`);

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
