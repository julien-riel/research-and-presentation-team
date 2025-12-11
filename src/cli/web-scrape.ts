#!/usr/bin/env node
/**
 * Web Scrape CLI
 *
 * Extract data from web pages
 *
 * Usage:
 *   npx tsx src/cli/web-scrape.ts --url <url> [options]
 *
 * Options:
 *   --url <url>          URL to scrape
 *   --tables             Extract tables only
 *   --table <n>          Extract specific table by index
 *   --text               Extract text only
 *   --links              Extract links only
 *   --metadata           Extract metadata only
 *   --selector <sel>     CSS selector for content area
 *   --output <path>      Save output to file
 *   --csv                Output tables as CSV
 */

import { parseArgs } from 'node:util';
import { writeFileSync } from 'node:fs';
import {
  Logger,
  Progress,
  CliError,
  handleError,
  getVerbosity,
  getOutputFormat,
  OutputFormatter,
  COMMON_CLI_OPTIONS,
  type CommonArgs,
} from './utils/index.js';
import { WebScraperService } from '../lib/scraper/WebScraperService.js';

interface CliArgs extends CommonArgs {
  url?: string;
  tables?: boolean;
  table?: string;
  text?: boolean;
  links?: boolean;
  metadata?: boolean;
  selector?: string;
  output?: string;
  csv?: boolean;
  'remove-selectors'?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      url: { type: 'string', short: 'u' },
      tables: { type: 'boolean', short: 't' },
      table: { type: 'string' },
      text: { type: 'boolean' },
      links: { type: 'boolean', short: 'l' },
      metadata: { type: 'boolean', short: 'm' },
      selector: { type: 'string', short: 's' },
      output: { type: 'string', short: 'o' },
      csv: { type: 'boolean' },
      'remove-selectors': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return values as CliArgs;
}

function showHelp(): void {
  console.log(`
Web Scrape CLI - Extract data from web pages

Usage:
  npx tsx src/cli/web-scrape.ts --url <url> [options]

Options:
  -u, --url <url>          URL to scrape (required)
  -t, --tables             Extract tables only
      --table <n>          Extract specific table by index (0-based)
      --text               Extract text content only
  -l, --links              Extract links only
  -m, --metadata           Extract page metadata only
  -s, --selector <sel>     CSS selector for content area (e.g., "main", "#content")
      --remove-selectors   Comma-separated selectors to remove (e.g., ".ads,.nav")
  -o, --output <path>      Save output to file (JSON or CSV)
      --csv                Output tables as CSV instead of JSON
  -F, --format <fmt>       Output format: json, markdown, table
  -v, --verbose            Verbose output
      --debug              Debug mode
      --quiet              Minimal output
  -h, --help               Show this help message

Examples:
  # Extract all tables from a page
  npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --tables

  # Extract first table as CSV
  npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --table 0 --csv

  # Extract text from main content
  npx tsx src/cli/web-scrape.ts --url "https://example.com/article" --text --selector "article"

  # Get page metadata
  npx tsx src/cli/web-scrape.ts --url "https://example.com" --metadata

  # Save full scrape to JSON
  npx tsx src/cli/web-scrape.ts --url "https://example.com" --output data.json

  # Extract table and save as CSV
  npx tsx src/cli/web-scrape.ts --url "https://en.wikipedia.org/wiki/List_of_countries" \\
    --table 0 --csv --output countries.csv
`);
}

async function main(): Promise<void> {
  const args = parseArguments();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const logger = new Logger(getVerbosity(args));
  const format = getOutputFormat(args);
  const formatter = new OutputFormatter(format, logger);

  try {
    if (!args.url) {
      throw new CliError('--url is required. Use --help for usage information.');
    }

    const scraper = new WebScraperService();
    const progress = new Progress(`Fetching ${args.url}`, !args.quiet);
    progress.start();

    // Build options
    const options = {
      contentSelector: args.selector,
      removeSelectors: args['remove-selectors']?.split(',').map(s => s.trim()),
    };

    const result = await scraper.fetch(args.url, options);
    progress.succeed('Page fetched and parsed');

    // Metadata only
    if (args.metadata) {
      logger.section('Page Metadata');
      if (format === 'json') {
        formatter.json(result.metadata);
      } else {
        formatter.keyValue({
          Title: result.metadata.title || 'N/A',
          Description: result.metadata.description || 'N/A',
          Keywords: result.metadata.keywords?.join(', ') || 'N/A',
          Language: result.metadata.language || 'N/A',
          Canonical: result.metadata.canonical || 'N/A',
          'OG Title': result.metadata.ogTitle || 'N/A',
          'OG Image': result.metadata.ogImage || 'N/A',
        });
      }
      return;
    }

    // Text only
    if (args.text) {
      logger.section('Extracted Text');
      console.log(result.text);

      if (args.output) {
        writeFileSync(args.output, result.text);
        logger.success(`Text saved to ${args.output}`);
      }
      return;
    }

    // Links only
    if (args.links) {
      logger.section(`Links (${result.links.length})`);
      if (format === 'json') {
        formatter.json(result.links);
      } else {
        formatter.table(
          ['Text', 'URL'],
          result.links.slice(0, 50).map(l => [
            l.text.slice(0, 40),
            l.href.slice(0, 60)
          ])
        );
        if (result.links.length > 50) {
          logger.info(`... and ${result.links.length - 50} more links`);
        }
      }

      if (args.output) {
        writeFileSync(args.output, JSON.stringify(result.links, null, 2));
        logger.success(`Links saved to ${args.output}`);
      }
      return;
    }

    // Specific table
    if (args.table !== undefined) {
      const tableIndex = parseInt(args.table);
      const table = result.tables[tableIndex];

      if (!table) {
        throw new CliError(`Table ${tableIndex} not found. Page has ${result.tables.length} table(s).`);
      }

      logger.section(`Table ${tableIndex}${table.caption ? `: ${table.caption}` : ''}`);

      if (args.csv) {
        const csv = scraper.tableToCSV(table);
        console.log(csv);

        if (args.output) {
          writeFileSync(args.output, csv);
          logger.success(`CSV saved to ${args.output}`);
        }
      } else if (format === 'json') {
        formatter.json(scraper.tableToJSON(table));
      } else {
        formatter.table(table.headers, table.rows.slice(0, 30));
        if (table.rows.length > 30) {
          logger.info(`... and ${table.rows.length - 30} more rows`);
        }
      }
      return;
    }

    // Tables only
    if (args.tables) {
      logger.section(`Tables (${result.tables.length})`);

      if (result.tables.length === 0) {
        logger.info('No tables found on this page.');
        return;
      }

      if (format === 'json') {
        formatter.json(result.tables.map(t => scraper.tableToJSON(t)));
      } else {
        for (let i = 0; i < result.tables.length; i++) {
          const table = result.tables[i];
          console.log(`\n### Table ${i}${table.caption ? `: ${table.caption}` : ''}\n`);
          formatter.table(
            table.headers,
            table.rows.slice(0, 10)
          );
          if (table.rows.length > 10) {
            logger.info(`... (${table.rows.length} rows total)`);
          }
        }
      }

      if (args.output) {
        const output = result.tables.map(t => scraper.tableToJSON(t));
        writeFileSync(args.output, JSON.stringify(output, null, 2));
        logger.success(`Tables saved to ${args.output}`);
      }
      return;
    }

    // Full scrape result
    logger.section('Scrape Summary');
    formatter.keyValue({
      URL: result.url,
      Title: result.metadata.title || 'N/A',
      Tables: result.tables.length,
      Lists: result.lists.length,
      Links: result.links.length,
      'Text Length': `${result.text.length} chars`,
      Timestamp: result.timestamp,
    });

    if (result.tables.length > 0) {
      logger.section('Tables Found');
      for (let i = 0; i < result.tables.length; i++) {
        const t = result.tables[i];
        console.log(`  ${i}: ${t.headers.length} columns, ${t.rows.length} rows${t.caption ? ` - "${t.caption}"` : ''}`);
      }
    }

    if (args.output) {
      writeFileSync(args.output, JSON.stringify(result, null, 2));
      logger.success(`Full scrape saved to ${args.output}`);
    } else {
      logger.blank();
      logger.info('Use --output to save results, or --tables/--text/--links for specific data');
    }

  } catch (error) {
    handleError(error, logger);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
