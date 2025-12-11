#!/usr/bin/env node
/**
 * Icon Search CLI
 *
 * Search and download icons from Lucide Icons
 *
 * Usage:
 *   npx tsx src/cli/icon-search.ts --query <text> [options]
 *
 * Options:
 *   --query <text>       Search query
 *   --category <cat>     Filter by category
 *   --download           Download matching icons
 *   --output-dir <path>  Output directory for downloads
 *   --color <hex>        Icon color (without #)
 *   --size <px>          Icon size in pixels
 *   --list-categories    List all categories
 *   --format <fmt>       Output format: json, markdown, table
 */

import { parseArgs } from 'node:util';
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
import { LucideIconService } from '../lib/icons/LucideIconService.js';

interface CliArgs extends CommonArgs {
  query?: string;
  category?: string;
  download?: boolean;
  'output-dir'?: string;
  color?: string;
  size?: string;
  'stroke-width'?: string;
  'list-categories'?: boolean;
  limit?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      query: { type: 'string', short: 'q' },
      category: { type: 'string', short: 'c' },
      download: { type: 'boolean', short: 'd' },
      'output-dir': { type: 'string', short: 'o' },
      color: { type: 'string' },
      size: { type: 'string', short: 's' },
      'stroke-width': { type: 'string' },
      'list-categories': { type: 'boolean' },
      limit: { type: 'string', short: 'l' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return values as CliArgs;
}

function showHelp(): void {
  console.log(`
Icon Search CLI - Search and download icons from Lucide Icons

Usage:
  npx tsx src/cli/icon-search.ts --query <text> [options]

Options:
  -q, --query <text>       Search icons by keyword
  -c, --category <cat>     Filter by category
  -d, --download           Download matching icons as SVG
  -o, --output-dir <path>  Output directory (default: output/icons)
      --color <hex>        Icon color without # (default: 000000)
  -s, --size <px>          Icon size in pixels (default: 24)
      --stroke-width <n>   Stroke width 1-3 (default: 2)
      --list-categories    List all available categories
  -l, --limit <n>          Max results (default: 20)
  -F, --format <fmt>       Output format: json, markdown, table
  -v, --verbose            Verbose output
      --debug              Debug mode
      --quiet              Minimal output
  -h, --help               Show this help message

Examples:
  # Search for chart icons
  npx tsx src/cli/icon-search.ts --query "chart"

  # List icons in a category
  npx tsx src/cli/icon-search.ts --category business

  # Download icons matching query
  npx tsx src/cli/icon-search.ts --query "arrow" --download --output-dir output/icons

  # Download with custom color and size
  npx tsx src/cli/icon-search.ts --query "check" --download --color 4CAF50 --size 48

  # List all categories
  npx tsx src/cli/icon-search.ts --list-categories

  # Output as JSON
  npx tsx src/cli/icon-search.ts --query "user" --format json
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
    const iconService = new LucideIconService();

    // List categories
    if (args['list-categories']) {
      const categories = iconService.getCategories();
      logger.section('Available Categories');

      if (format === 'json') {
        formatter.json(categories);
      } else {
        for (const cat of categories) {
          const icons = iconService.listByCategory(cat);
          console.log(`- **${cat}** (${icons.length} icons)`);
        }
      }
      return;
    }

    // Search or list by category
    const query = args.query || '';
    const category = args.category;
    const limit = parseInt(args.limit || '20');

    let icons;
    if (category) {
      icons = iconService.listByCategory(category);
      logger.section(`Icons in category: ${category}`);
    } else {
      icons = iconService.search(query, limit);
      logger.section(query ? `Search results for "${query}"` : 'Popular Icons');
    }

    if (icons.length === 0) {
      logger.info('No icons found.');
      return;
    }

    logger.info(`Found ${icons.length} icon(s)\n`);

    // Download if requested
    if (args.download) {
      const outputDir = args['output-dir'] || 'output/icons';
      const color = args.color || '000000';
      const size = parseInt(args.size || '24');
      const strokeWidth = parseInt(args['stroke-width'] || '2');

      const progress = new Progress(`Downloading ${icons.length} icons`, !args.quiet);
      progress.start();

      const results = await iconService.downloadBatch(
        icons.map(i => i.name),
        outputDir,
        { color, size, strokeWidth }
      );

      progress.succeed(`Downloaded ${results.length} icons to ${outputDir}`);

      if (format === 'json') {
        formatter.json(results);
      } else {
        formatter.table(
          ['Icon', 'Path', 'Size', 'Color'],
          results.map(r => [r.name, r.path, `${r.size}px`, `#${r.color}`])
        );
      }
    } else {
      // Just display results
      if (format === 'json') {
        formatter.json(icons);
      } else {
        formatter.table(
          ['Icon', 'Tags', 'Categories'],
          icons.map(i => [
            i.name,
            i.tags.slice(0, 4).join(', '),
            i.categories.join(', ')
          ])
        );
      }

      logger.blank();
      logger.info('Use --download to save icons to disk');
    }

  } catch (error) {
    handleError(error, logger);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
