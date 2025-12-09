#!/usr/bin/env node
/**
 * PDF Reader CLI
 *
 * Read and extract content from PDF files
 *
 * Usage:
 *   npx tsx src/cli/pdf-read.ts --file <path> [options]
 *
 * Options:
 *   --file <path>          Path to PDF file (required)
 *   --metadata             Show metadata only
 *   --summary              Show summary statistics
 *   --pages <range>        Extract specific pages (e.g., "1-5" or "3")
 *   --search <term>        Search for text in PDF
 *   --tables               Extract tables
 *   --format <fmt>         Output format: json, markdown, table (default: markdown)
 *   --verbose              Verbose output
 *   --debug                Debug mode
 *   --quiet                Minimal output
 */

import { parseArgs } from 'node:util';
import {
  Logger,
  Progress,
  CliError,
  handleError,
  formatDuration,
  formatBytes,
  getVerbosity,
  getOutputFormat,
  OutputFormatter,
  COMMON_CLI_OPTIONS,
  type CommonArgs,
  type OutputFormat,
} from './utils/index.js';
import { PdfReaderService } from '../lib/data/PdfReaderService.js';

interface CliArgs extends CommonArgs {
  file?: string;
  metadata?: boolean;
  summary?: boolean;
  pages?: string;
  search?: string;
  tables?: boolean;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      file: { type: 'string', short: 'f' },
      metadata: { type: 'boolean', short: 'm' },
      summary: { type: 'boolean', short: 's' },
      pages: { type: 'string', short: 'p' },
      search: { type: 'string' },
      tables: { type: 'boolean', short: 't' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return values as CliArgs;
}

function showHelp(): void {
  console.log(`
PDF Reader CLI - Extract content from PDF files

Usage:
  npx tsx src/cli/pdf-read.ts --file <path> [options]

Options:
  -f, --file <path>        Path to PDF file (required)
  -m, --metadata           Show metadata only (fast)
  -s, --summary            Show summary statistics
  -p, --pages <range>      Extract specific pages (e.g., "1-5", "3", "2,4,6")
      --search <term>      Search for text in PDF
  -t, --tables             Attempt to extract tables
  -F, --format <fmt>       Output format: json, markdown, table (default: markdown)
  -v, --verbose            Verbose output
      --debug              Debug mode with timing
      --quiet              Minimal output
  -h, --help               Show this help message

Examples:
  # Show PDF metadata
  npx tsx src/cli/pdf-read.ts --file report.pdf --metadata

  # Show summary statistics
  npx tsx src/cli/pdf-read.ts --file report.pdf --summary

  # Extract specific pages
  npx tsx src/cli/pdf-read.ts --file report.pdf --pages 1-5

  # Search for text
  npx tsx src/cli/pdf-read.ts --file report.pdf --search "revenue"

  # Extract tables
  npx tsx src/cli/pdf-read.ts --file report.pdf --tables --format json
`);
}

function parsePageRange(rangeStr: string): { start: number; end: number } {
  if (rangeStr.includes('-')) {
    const [start, end] = rangeStr.split('-').map((n) => parseInt(n.trim()));
    return { start: start || 1, end: end || Infinity };
  }
  const page = parseInt(rangeStr);
  return { start: page, end: page };
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const args = parseArguments();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const logger = new Logger(getVerbosity(args));
  const format = getOutputFormat(args);
  const formatter = new OutputFormatter(format, logger);

  try {
    if (!args.file) {
      throw new CliError('--file is required. Use --help for usage information.');
    }

    logger.debug(`Starting PDF processing at ${new Date().toISOString()}`);

    const pdfService = new PdfReaderService();
    const progress = new Progress('Reading PDF', !args.quiet);

    // Metadata only (fast)
    if (args.metadata) {
      progress.start();
      const metadata = await pdfService.getMetadata(args.file);
      progress.succeed('Metadata loaded');

      logger.section('PDF Metadata');

      if (format === 'json') {
        formatter.json(metadata);
      } else {
        formatter.keyValue({
          Title: metadata.title || 'N/A',
          Author: metadata.author || 'N/A',
          Subject: metadata.subject || 'N/A',
          Keywords: metadata.keywords || 'N/A',
          Creator: metadata.creator || 'N/A',
          Producer: metadata.producer || 'N/A',
          'Creation Date': metadata.creationDate?.toISOString() || 'N/A',
          'Modification Date': metadata.modificationDate?.toISOString() || 'N/A',
          Pages: metadata.pageCount,
          'PDF Version': metadata.version || 'N/A',
        });
      }
    }
    // Summary statistics
    else if (args.summary) {
      progress.start();
      const summary = await pdfService.getSummary(args.file);
      progress.succeed('Summary generated');

      logger.section('PDF Summary');

      if (format === 'json') {
        formatter.json(summary);
      } else {
        formatter.keyValue({
          Title: summary.metadata.title || 'N/A',
          Author: summary.metadata.author || 'N/A',
          Pages: summary.metadata.pageCount,
          Words: summary.wordCount.toLocaleString(),
          Characters: summary.characterCount.toLocaleString(),
          Lines: summary.lineCount.toLocaleString(),
          'Avg Words/Page': summary.averageWordsPerPage,
        });
      }
    }
    // Search text
    else if (args.search) {
      progress.update(`Searching for "${args.search}"`);
      progress.start();
      const results = await pdfService.searchText(args.file, args.search);
      progress.succeed(`Found ${results.length} matches`);

      logger.section(`Search Results for "${args.search}"`);

      if (results.length === 0) {
        logger.info('No matches found.');
      } else if (format === 'json') {
        formatter.json(results);
      } else {
        formatter.table(
          ['Page', 'Position', 'Context'],
          results.map((r) => [r.page, r.position, r.context])
        );
      }
    }
    // Extract tables
    else if (args.tables) {
      progress.update('Extracting tables');
      progress.start();
      const tables = await pdfService.extractTables(args.file);
      progress.succeed(`Found ${tables.length} table(s)`);

      if (tables.length === 0) {
        logger.info('No tables detected in the PDF.');
        logger.verbose('Note: Table detection uses heuristics and may not find all tables.');
      } else if (format === 'json') {
        formatter.json(tables);
      } else {
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
          logger.section(`Table ${i + 1} (Page ${table.pageNumber || '?'})`);
          formatter.table(table.headers, table.rows);
          logger.blank();
        }
      }
    }
    // Full text extraction
    else {
      progress.start();

      const extractionOptions: { pageRange?: { start: number; end: number } } = {};
      if (args.pages) {
        extractionOptions.pageRange = parsePageRange(args.pages);
      }

      const content = await pdfService.readPdf(args.file, extractionOptions);
      progress.succeed('PDF loaded');

      logger.section('File Info');
      formatter.keyValue({
        Path: content.info.path,
        Size: formatBytes(content.info.size),
        Pages: content.metadata.pageCount,
        'Pages Extracted': content.pages.length,
      });

      logger.section('Content');

      if (format === 'json') {
        formatter.json({
          pages: content.pages,
          metadata: content.metadata,
        });
      } else {
        for (let i = 0; i < content.pages.length; i++) {
          const pageText = content.pages[i];
          if (args.pages) {
            const range = parsePageRange(args.pages);
            console.log(`\n--- Page ${range.start + i} ---\n`);
          } else {
            console.log(`\n--- Page ${i + 1} ---\n`);
          }
          console.log(pageText);
        }
      }
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
