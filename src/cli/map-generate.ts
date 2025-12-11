#!/usr/bin/env node
/**
 * Map Generate CLI
 *
 * Generate choropleth maps from data
 *
 * Usage:
 *   npx tsx src/cli/map-generate.ts --data <path> --output <path> [options]
 *
 * Options:
 *   --data <path>        JSON file with country data
 *   --output <path>      Output SVG path
 *   --title <text>       Map title
 *   --region <region>    Map region (world, europe, asia, etc.)
 *   --color-low <hex>    Low value color
 *   --color-high <hex>   High value color
 *   --list-countries     List supported countries
 */

import { parseArgs } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';
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
import { StaticMapService, type CountryData, type MapRegion } from '../lib/maps/StaticMapService.js';

interface CliArgs extends CommonArgs {
  data?: string;
  output?: string;
  title?: string;
  region?: string;
  'color-low'?: string;
  'color-high'?: string;
  'legend-title'?: string;
  width?: string;
  height?: string;
  'list-countries'?: boolean;
  'list-regions'?: boolean;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      data: { type: 'string', short: 'd' },
      output: { type: 'string', short: 'o' },
      title: { type: 'string', short: 't' },
      region: { type: 'string', short: 'r' },
      'color-low': { type: 'string' },
      'color-high': { type: 'string' },
      'legend-title': { type: 'string' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string', short: 'h' },
      'list-countries': { type: 'boolean' },
      'list-regions': { type: 'boolean' },
      help: { type: 'boolean' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return values as CliArgs;
}

function showHelp(): void {
  console.log(`
Map Generate CLI - Create choropleth maps from data

Usage:
  npx tsx src/cli/map-generate.ts --data <path> --output <path> [options]

Options:
  -d, --data <path>        JSON file with country data (required)
  -o, --output <path>      Output SVG file path (required)
  -t, --title <text>       Map title
  -r, --region <region>    Region: world, europe, asia, africa, north-america, south-america, oceania
      --color-low <hex>    Low value color (default: #f7fbff)
      --color-high <hex>   High value color (default: #08519c)
      --legend-title <t>   Legend title (default: Value)
  -w, --width <px>         Map width (default: 960)
      --height <px>        Map height (default: 500)
      --list-countries     List all supported country codes
      --list-regions       List all available regions
  -F, --format <fmt>       Output format: json, markdown, table
  -v, --verbose            Verbose output
      --debug              Debug mode
      --quiet              Minimal output
  -h, --help               Show this help message

Data Format (JSON):
  [
    { "code": "FR", "value": 100 },
    { "code": "DE", "value": 85 },
    { "code": "US", "value": 120 }
  ]

Examples:
  # Generate world map from data file
  npx tsx src/cli/map-generate.ts --data sales.json --output map.svg --title "Sales by Country"

  # Generate Europe map with custom colors
  npx tsx src/cli/map-generate.ts --data europe-data.json --output europe.svg \\
    --region europe --color-low "#fee0d2" --color-high "#de2d26"

  # List supported countries
  npx tsx src/cli/map-generate.ts --list-countries

  # List available regions
  npx tsx src/cli/map-generate.ts --list-regions
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
    const mapService = new StaticMapService();

    // List regions
    if (args['list-regions']) {
      const regions = mapService.getRegions();
      logger.section('Available Regions');

      if (format === 'json') {
        formatter.json(regions);
      } else {
        for (const region of regions) {
          const countries = mapService.getCountriesByRegion(region);
          console.log(`- **${region}** (${countries.length} countries)`);
        }
      }
      return;
    }

    // List countries
    if (args['list-countries']) {
      const countries = mapService.getSupportedCountries();
      logger.section('Supported Countries');

      if (format === 'json') {
        formatter.json(countries);
      } else {
        // Group by region
        const byRegion = new Map<string, typeof countries>();
        for (const country of countries) {
          const list = byRegion.get(country.region) || [];
          list.push(country);
          byRegion.set(country.region, list);
        }

        for (const [region, list] of byRegion) {
          console.log(`\n### ${region.toUpperCase()}\n`);
          formatter.table(
            ['Code', 'Country'],
            list.map(c => [c.code, c.name])
          );
        }
      }
      return;
    }

    // Generate map
    if (!args.data) {
      throw new CliError('--data is required. Use --help for usage information.');
    }
    if (!args.output) {
      throw new CliError('--output is required. Use --help for usage information.');
    }

    // Read data file
    if (!existsSync(args.data)) {
      throw new CliError(`Data file not found: ${args.data}`);
    }

    const dataContent = readFileSync(args.data, 'utf-8');
    const data: CountryData[] = JSON.parse(dataContent);

    if (!Array.isArray(data)) {
      throw new CliError('Data must be an array of { code, value } objects');
    }

    // Validate data
    for (const item of data) {
      if (!item.code || typeof item.value !== 'number') {
        throw new CliError('Each data item must have "code" (string) and "value" (number)');
      }
    }

    const progress = new Progress('Generating map', !args.quiet);
    progress.start();

    // Build options
    const options = {
      title: args.title,
      width: args.width ? parseInt(args.width) : undefined,
      height: args.height ? parseInt(args.height) : undefined,
      colorScale: [
        args['color-low'] || '#f7fbff',
        args['color-high'] || '#08519c',
      ] as [string, string],
      legendTitle: args['legend-title'],
    };

    // Generate map
    let result;
    if (args.region && args.region !== 'world') {
      result = mapService.generateRegion(args.region as MapRegion, data, options);
    } else {
      result = mapService.generate(data, options);
    }

    // Save to file
    const outputPath = mapService.save(result, args.output);
    progress.succeed(`Map saved to ${outputPath}`);

    // Show summary
    logger.section('Map Summary');
    formatter.keyValue({
      'Output': outputPath,
      'Dimensions': `${result.width} x ${result.height}`,
      'Countries Colored': result.countriesColored,
      'Data Points': data.length,
    });

    // Warn about unmatched countries
    const supportedCodes = new Set(mapService.getSupportedCountries().map(c => c.code));
    const unmatched = data.filter(d => !supportedCodes.has(d.code.toUpperCase()));
    if (unmatched.length > 0) {
      logger.blank();
      logger.warn(`${unmatched.length} country code(s) not found in map:`);
      logger.info(unmatched.map(d => d.code).join(', '));
    }

  } catch (error) {
    handleError(error, logger);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
