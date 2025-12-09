#!/usr/bin/env node
/**
 * Chart Renderer CLI
 *
 * Generate charts using ECharts
 *
 * Usage:
 *   npx tsx src/cli/chart-render.ts --config <path> --output <path>
 *
 * Options:
 *   --config <path>      Path to chart configuration (JSON)
 *   --template <type>    Use a predefined template (bar, line, pie, etc.)
 *   --data <path>        Data file for template
 *   --x <column>         X-axis column name
 *   --y <columns>        Y-axis column names (comma-separated)
 *   --output <path>      Output HTML path (required)
 *   --width <n>          Chart width (default: 800)
 *   --height <n>         Chart height (default: 600)
 *   --title <text>       Chart title
 *   --verbose            Verbose output
 *   --debug              Debug mode
 *   --quiet              Minimal output
 */

import { parseArgs } from 'node:util';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ChartGeneratorService } from '../lib/visualization/ChartGeneratorService.js';
import { DataReaderService } from '../lib/data/DataReaderService.js';
import type { ChartConfig, ChartType, ChartTheme } from '../types/chart.js';
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
  config?: string;
  template?: string;
  data?: string;
  x?: string;
  y?: string;
  output?: string;
  width?: number;
  height?: number;
  title?: string;
  theme?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      config: { type: 'string', short: 'c' },
      template: { type: 'string', short: 't' },
      data: { type: 'string', short: 'd' },
      x: { type: 'string' },
      y: { type: 'string' },
      output: { type: 'string', short: 'o' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string' },
      title: { type: 'string' },
      theme: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    width: values.width ? parseInt(values.width as string, 10) : 800,
    height: values.height ? parseInt(values.height as string, 10) : 600,
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Chart Renderer CLI - Generate charts using ECharts

Usage:
  npx tsx src/cli/chart-render.ts --config <path> --output <path>
  npx tsx src/cli/chart-render.ts --template <type> --data <path> --x <col> --y <cols> --output <path>

Options:
  -c, --config <path>      Path to chart configuration (JSON)
  -t, --template <type>    Use a predefined template (bar, line, pie, area, scatter)
  -d, --data <path>        Data file for template (CSV, Excel, JSON)
      --x <column>         X-axis column name
      --y <columns>        Y-axis column names (comma-separated)
  -o, --output <path>      Output HTML path (required)
  -w, --width <n>          Chart width in pixels (default: 800)
      --height <n>         Chart height in pixels (default: 600)
      --title <text>       Chart title
      --theme <path>       Theme configuration file (JSON)
  -v, --verbose            Verbose output
      --debug              Debug mode with timing
      --quiet              Minimal output
  -h, --help               Show this help message

Templates:
  bar       - Vertical bar chart
  barH      - Horizontal bar chart
  line      - Line chart
  area      - Area chart (line with fill)
  pie       - Pie chart
  doughnut  - Doughnut chart
  scatter   - Scatter plot
  radar     - Radar chart
  heatmap   - Heatmap

Examples:
  npx tsx src/cli/chart-render.ts --config chart.json --output chart.html
  npx tsx src/cli/chart-render.ts --template bar --data data.csv --x "Month" --y "Sales,Profit" --output chart.html
  npx tsx src/cli/chart-render.ts --template line --data data.csv --x "Date" --y "Value" --title "Trends" --output chart.html
`);
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
    if (!args.output) {
      throw new CliError('--output is required. Use --help for usage information.');
    }

    if (!args.config && !args.template) {
      throw new CliError('Either --config or --template is required. Use --help for usage information.');
    }

    const chartService = new ChartGeneratorService();

    logger.debug(`Starting chart generation at ${new Date().toISOString()}`);

    // Load theme if provided
    if (args.theme && existsSync(args.theme)) {
      const progress = new Progress('Loading theme', !args.quiet);
      progress.start();
      try {
        const themeContent = readFileSync(args.theme, 'utf-8');
        const theme: ChartTheme = JSON.parse(themeContent);
        chartService.setTheme(theme);
        progress.succeed(`Theme loaded from ${args.theme}`);
      } catch (e) {
        progress.fail('Failed to load theme');
        throw new CliError(`Could not load theme: ${(e as Error).message}`);
      }
    }

    let option;

    if (args.config) {
      // Load from config file
      if (!existsSync(args.config)) {
        throw new CliError(`Config file not found: ${args.config}`);
      }

      const progress = new Progress('Loading chart config', !args.quiet);
      progress.start();

      try {
        const configContent = readFileSync(args.config, 'utf-8');
        const config: ChartConfig = JSON.parse(configContent);
        option = chartService.generateOption(config);
        progress.succeed(`Chart configuration loaded from ${args.config}`);
        logger.verbose(`  Type: ${config.type}`);
        logger.verbose(`  Series: ${config.data.series.length}`);
      } catch (e) {
        progress.fail('Failed to parse config');
        throw new CliError(`Error parsing config file: ${(e as Error).message}`);
      }
    } else if (args.template) {
      // Generate from template and data
      if (args.data) {
        if (!existsSync(args.data)) {
          throw new CliError(`Data file not found: ${args.data}`);
        }

        if (!args.x) {
          throw new CliError('--x (x-axis column) is required when using --data');
        }

        if (!args.y) {
          throw new CliError('--y (y-axis columns) is required when using --data');
        }

        const progress = new Progress('Loading data', !args.quiet);
        progress.start();

        try {
          const reader = new DataReaderService();
          const { dataFrame } = await reader.read(args.data);
          progress.succeed(`Loaded ${dataFrame.rowCount} rows from ${args.data}`);

          const xColumn = args.x;
          const yColumns = args.y.split(',').map((c) => c.trim());

          // Validate columns exist
          if (!dataFrame.columns.includes(xColumn)) {
            throw new CliError(
              `X-axis column '${xColumn}' not found in data.\n  Available columns: ${dataFrame.columns.join(', ')}`
            );
          }

          for (const col of yColumns) {
            if (!dataFrame.columns.includes(col)) {
              throw new CliError(
                `Y-axis column '${col}' not found in data.\n  Available columns: ${dataFrame.columns.join(', ')}`
              );
            }
          }

          const chartProgress = new Progress('Generating chart', !args.quiet);
          chartProgress.start();

          option = chartService.fromDataFrame(
            dataFrame,
            args.template as ChartType,
            xColumn,
            yColumns,
            {
              showLegend: yColumns.length > 1,
              showGrid: true,
            }
          );

          // Add title if provided
          if (args.title) {
            option.title = {
              text: args.title,
              left: 'center',
            };
          }

          chartProgress.succeed('Chart generated');
          logger.verbose(`  Type: ${args.template}`);
          logger.verbose(`  X-axis: ${xColumn}`);
          logger.verbose(`  Y-axis: ${yColumns.join(', ')}`);
          logger.verbose(`  Data points: ${dataFrame.rowCount}`);
        } catch (e) {
          if (e instanceof CliError) throw e;
          throw new CliError(`Error reading data file: ${(e as Error).message}`);
        }
      } else {
        // Generate sample chart
        const progress = new Progress(`Generating sample ${args.template} chart`, !args.quiet);
        progress.start();

        const sampleConfig: ChartConfig = {
          type: args.template as ChartType,
          title: args.title ? { text: args.title } : undefined,
          data: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            series: [
              { name: 'Series A', data: [120, 200, 150, 80, 70, 110] },
              { name: 'Series B', data: [60, 100, 120, 90, 80, 100] },
            ],
          },
          options: {
            showLegend: true,
            showGrid: true,
          },
        };

        option = chartService.generateOption(sampleConfig);
        progress.succeed('Sample chart generated');
        logger.warn('No data file provided - using sample data');
      }
    }

    if (!option) {
      throw new CliError('Failed to generate chart option');
    }

    // Generate HTML preview
    const saveProgress = new Progress('Saving chart', !args.quiet);
    saveProgress.start();

    const outputPath = args.output.endsWith('.html') ? args.output : `${args.output}.html`;
    chartService.saveHtmlPreview(option, outputPath, args.width, args.height);

    // Also save the ECharts option as JSON for reference
    const jsonPath = outputPath.replace('.html', '.json');
    writeFileSync(jsonPath, chartService.toJson(option));

    saveProgress.succeed(`Chart saved to ${outputPath}`);

    logger.blank();
    logger.info(`Output files:`);
    logger.info(`  HTML: ${outputPath}`);
    logger.info(`  JSON: ${jsonPath}`);
    logger.info(`  Dimensions: ${args.width}x${args.height}px`);
    logger.blank();
    logger.info('Open the HTML file in a browser to view the interactive chart.');

    logger.debug(`Total execution time: ${formatDuration(Date.now() - startTime)}`);
  } catch (error) {
    handleError(error, logger);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
