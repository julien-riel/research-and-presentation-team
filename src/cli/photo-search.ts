#!/usr/bin/env node
/**
 * Stock Photo Search CLI
 *
 * Search and download stock photos from Pexels
 *
 * Usage:
 *   npx tsx src/cli/photo-search.ts --query "mountain landscape" --output results.json
 *   npx tsx src/cli/photo-search.ts --query "business meeting" --download --output-dir output/photos
 *
 * Environment:
 *   PEXELS_API_KEY - Required API key from https://www.pexels.com/api/
 *                    Can be set in .env file or as environment variable
 *
 * Options:
 *   --query <text>        Search query (required)
 *   --download            Download photos instead of just listing
 *   --output <path>       Output JSON file for search results
 *   --output-dir <path>   Directory for downloaded photos (with --download)
 *   --per-page <n>        Results per page (default: 15, max: 80)
 *   --page <n>            Page number (default: 1)
 *   --orientation <o>     Filter: landscape, portrait, square
 *   --size <s>            Download size: small, medium, large, original
 *   --color <hex>         Filter by color (without #)
 *   --curated             Get curated photos instead of search
 *   --id <id>             Get/download a specific photo by ID
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { StockPhotoService } from '../lib/images/StockPhotoService.js';
import type { ImageOrientation, ImageSize, StockPhoto } from '../types/images.js';
import {
  Logger,
  Progress,
  CliError,
  handleError,
  formatDuration,
  getVerbosity,
  COMMON_CLI_OPTIONS,
  type CommonArgs,
} from './utils/index.js';

interface CliArgs extends CommonArgs {
  query?: string;
  download?: boolean;
  output?: string;
  outputDir?: string;
  perPage?: string;
  page?: string;
  orientation?: string;
  size?: string;
  color?: string;
  curated?: boolean;
  id?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      query: { type: 'string', short: 'q' },
      download: { type: 'boolean', short: 'd' },
      output: { type: 'string', short: 'o' },
      'output-dir': { type: 'string' },
      'per-page': { type: 'string' },
      page: { type: 'string', short: 'p' },
      orientation: { type: 'string' },
      size: { type: 'string', short: 's' },
      color: { type: 'string' },
      curated: { type: 'boolean' },
      id: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    outputDir: values['output-dir'] as string | undefined,
    perPage: values['per-page'] as string | undefined,
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Stock Photo Search CLI - Search and download photos from Pexels

SETUP:
  1. Get a free API key at https://www.pexels.com/api/
  2. Set environment variable: export PEXELS_API_KEY=your_key_here

Usage:
  npx tsx src/cli/photo-search.ts --query <text> [options]
  npx tsx src/cli/photo-search.ts --curated [options]
  npx tsx src/cli/photo-search.ts --id <photo_id> [options]

Options:
  -q, --query <text>        Search query
  -d, --download            Download photos instead of listing
  -o, --output <path>       Output JSON file for results
      --output-dir <path>   Directory for downloads (default: output/photos)
      --per-page <n>        Results per page (1-80, default: 15)
  -p, --page <n>            Page number (default: 1)
      --orientation <o>     Filter: landscape, portrait, square
  -s, --size <s>            Download size: small, medium, large, original
      --color <hex>         Filter by color (hex without #, e.g., FF0000)
      --curated             Get curated/featured photos
      --id <id>             Get a specific photo by ID
  -v, --verbose             Verbose output
      --debug               Debug mode
      --quiet               Minimal output
  -h, --help                Show this help

Examples:
  # Search for photos
  npx tsx src/cli/photo-search.ts --query "mountain landscape"

  # Search and save results to JSON
  npx tsx src/cli/photo-search.ts --query "business team" --output results.json

  # Search with filters
  npx tsx src/cli/photo-search.ts --query "ocean" --orientation landscape --color 0066CC

  # Download search results
  npx tsx src/cli/photo-search.ts --query "coffee" --download --output-dir output/coffee-photos

  # Get curated photos
  npx tsx src/cli/photo-search.ts --curated --per-page 10

  # Download a specific photo by ID
  npx tsx src/cli/photo-search.ts --id 1234567 --download --output-dir output/photos

  # Get large landscape photos
  npx tsx src/cli/photo-search.ts --query "workspace" --orientation landscape --size large --download

Rate Limits:
  Pexels allows 200 requests per hour on the free tier.

License:
  All Pexels photos are free to use. Attribution is appreciated but not required.
  Full license: https://www.pexels.com/license/
`);
}

function formatPhotoSummary(photo: StockPhoto): string {
  return [
    `  ID: ${photo.id}`,
    `  Description: ${photo.description || '(no description)'}`,
    `  Photographer: ${photo.photographer.name}`,
    `  Dimensions: ${photo.width}x${photo.height}`,
    `  URL: ${photo.url}`,
  ].join('\n');
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const args = parseArguments();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const logger = new Logger(getVerbosity(args));

  try {
    // Validate inputs
    if (!args.query && !args.curated && !args.id) {
      throw new CliError(
        'One of --query, --curated, or --id is required. Use --help for usage information.'
      );
    }

    // Check for API key
    if (!process.env.PEXELS_API_KEY) {
      throw new CliError(
        'PEXELS_API_KEY environment variable not set.\n' +
          '  Get a free key at https://www.pexels.com/api/\n' +
          '  Then run: export PEXELS_API_KEY=your_key_here'
      );
    }

    logger.debug(`Starting photo search at ${new Date().toISOString()}`);

    // Initialize service
    const service = new StockPhotoService();

    // Parse options
    const perPage = args.perPage ? parseInt(args.perPage, 10) : 15;
    const page = args.page ? parseInt(args.page, 10) : 1;
    const orientation = args.orientation as ImageOrientation | undefined;
    const size = (args.size || 'large') as ImageSize;
    const outputDir = args.outputDir || 'output/photos';

    let photos: StockPhoto[] = [];
    let totalResults = 0;

    // Execute search or get specific photo
    if (args.id) {
      logger.section('Getting Photo');
      logger.info(`Photo ID: ${args.id}`);
      logger.blank();

      const progress = new Progress('Fetching photo', !args.quiet);
      progress.start();

      const photo = await service.getPhoto(args.id);
      photos = [photo];
      totalResults = 1;

      progress.succeed('Photo found');
    } else if (args.curated) {
      logger.section('Curated Photos');
      logger.info(`Page: ${page}, Per page: ${perPage}`);
      logger.blank();

      const progress = new Progress('Fetching curated photos', !args.quiet);
      progress.start();

      const result = await service.getCurated({ page, perPage });
      photos = result.photos;
      totalResults = result.totalResults;

      progress.succeed(`Found ${photos.length} curated photos`);
    } else {
      logger.section('Photo Search');
      logger.info(`Query: "${args.query}"`);
      if (orientation) logger.info(`Orientation: ${orientation}`);
      if (args.color) logger.info(`Color: #${args.color}`);
      logger.info(`Page: ${page}, Per page: ${perPage}`);
      logger.blank();

      const progress = new Progress('Searching photos', !args.quiet);
      progress.start();

      const result = await service.search(args.query!, {
        page,
        perPage,
        orientation,
        color: args.color,
      });

      photos = result.photos;
      totalResults = result.totalResults;

      progress.succeed(`Found ${totalResults} total results, showing ${photos.length}`);
    }

    // Display results
    if (photos.length === 0) {
      logger.warn('No photos found matching your criteria.');
    } else {
      logger.blank();
      logger.section('Results');

      for (const photo of photos) {
        logger.info(`\n${formatPhotoSummary(photo)}`);
      }
    }

    // Save JSON output
    if (args.output && photos.length > 0) {
      const outputProgress = new Progress('Saving results', !args.quiet);
      outputProgress.start();

      const output = {
        query: args.query || (args.curated ? 'curated' : `photo:${args.id}`),
        totalResults,
        page,
        perPage,
        photos: photos.map((p) => ({
          id: p.id,
          description: p.description,
          photographer: p.photographer.name,
          photographerUrl: p.photographer.url,
          url: p.url,
          width: p.width,
          height: p.height,
          aspectRatio: p.aspectRatio,
          avgColor: p.avgColor,
          sources: p.sources,
          attribution: service.getAttribution(p),
        })),
      };

      writeFileSync(args.output, JSON.stringify(output, null, 2));
      outputProgress.succeed(`Results saved to ${args.output}`);
    }

    // Download photos
    if (args.download && photos.length > 0) {
      logger.blank();
      logger.section('Downloading Photos');

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        logger.verbose(`Created directory: ${outputDir}`);
      }

      for (const photo of photos) {
        const filename = `pexels-${photo.id}.jpg`;
        const filepath = join(outputDir, filename);

        const downloadProgress = new Progress(`Downloading ${filename}`, !args.quiet);
        downloadProgress.start();

        try {
          const result = await service.download(photo, filepath, { size });
          downloadProgress.succeed(
            `${filename} (${Math.round(result.fileSize / 1024)}KB)`
          );
        } catch (error) {
          downloadProgress.fail(`Failed: ${filename}`);
          logger.error(error instanceof Error ? error.message : String(error));
        }
      }

      logger.blank();
      logger.info(`Photos saved to: ${outputDir}`);
    }

    // Summary
    logger.blank();
    if (photos.length > 0) {
      logger.info(`Attribution: ${service.getAttribution(photos[0])}`);
      logger.info('License: https://www.pexels.com/license/');
    }

    logger.debug(`Total execution time: ${formatDuration(Date.now() - startTime)}`);
  } catch (error) {
    handleError(error, logger);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
