#!/usr/bin/env node
/**
 * Chart Renderer CLI
 *
 * Generate charts using Vega-Lite with direct PNG/SVG export via vl-convert
 *
 * Usage:
 *   npx tsx src/cli/chart-render.ts --config <path> --output <path>
 *   npx tsx src/cli/chart-render.ts --config <path> --output <path> --pptx-position "8:4"
 *
 * Options:
 *   --config <path>         Path to chart configuration (JSON)
 *   --spec <path>           Path to Vega-Lite spec (JSON) - use directly without conversion
 *   --template <type>       Use a predefined template (bar, line, pie, etc.)
 *   --data <path>           Data file for template
 *   --x <column>            X-axis column name
 *   --y <columns>           Y-axis column names (comma-separated)
 *   --output <path>         Output path (required)
 *   --format <fmt>          Output format: png, svg, json (default: png)
 *   --pptx-position <pos>   Target PPTX position in inches (format: "w:h" or "x,y,w,h")
 *   --width <n>             Chart width in pixels (default: 800, ignored if --pptx-position)
 *   --height <n>            Chart height in pixels (default: 600, ignored if --pptx-position)
 *   --scale <n>             Scale factor for PNG (default: 2)
 *   --title <text>          Chart title
 *   --verbose               Verbose output
 *   --debug                 Debug mode
 *   --quiet                 Minimal output
 */

import { parseArgs } from 'node:util';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ChartGeneratorService } from '../lib/visualization/ChartGeneratorService.js';
import { DataReaderService } from '../lib/data/DataReaderService.js';
import {
  parsePositionString,
  pptxPositionToPixels,
  type PptxPosition,
} from '../lib/utils/pptx-dimensions.js';
import type { ChartConfig, ChartType, ChartTheme, VegaLiteSpec } from '../types/chart.js';
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
  spec?: string;
  template?: string;
  data?: string;
  x?: string;
  y?: string;
  output?: string;
  outputFormat?: string;
  width?: number;
  height?: number;
  scale?: number;
  title?: string;
  theme?: string;
  pptxPosition?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      config: { type: 'string', short: 'c' },
      spec: { type: 'string', short: 's' },
      template: { type: 'string', short: 't' },
      data: { type: 'string', short: 'd' },
      x: { type: 'string' },
      y: { type: 'string' },
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string' },
      scale: { type: 'string' },
      title: { type: 'string' },
      theme: { type: 'string' },
      'pptx-position': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    width: values.width ? parseInt(values.width as string, 10) : 800,
    height: values.height ? parseInt(values.height as string, 10) : 600,
    scale: values.scale ? parseFloat(values.scale as string) : 2,
    outputFormat: values.format as string || 'png',
    pptxPosition: values['pptx-position'] as string | undefined,
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Chart Renderer CLI - Generate charts using Vega-Lite

Usage:
  npx tsx src/cli/chart-render.ts --config <path> --output <path>
  npx tsx src/cli/chart-render.ts --spec <path> --output <path>
  npx tsx src/cli/chart-render.ts --template <type> --data <path> --x <col> --y <cols> --output <path>

Options:
  -c, --config <path>         Path to ChartConfig JSON (simplified format)
  -s, --spec <path>           Path to Vega-Lite spec JSON (native format)
  -t, --template <type>       Use a predefined template (bar, line, pie, area, scatter)
  -d, --data <path>           Data file for template (CSV, Excel, JSON)
      --x <column>            X-axis column name
      --y <columns>           Y-axis column names (comma-separated)
  -o, --output <path>         Output path (required)
  -f, --format <fmt>          Output format: png, svg, json (default: png)
      --pptx-position <pos>   Target PPTX position in inches for pixel-perfect rendering
                              Formats: "w:h" (e.g., "8:4") or "x,y,w,h" (e.g., "1,1.2,8,4")
                              Automatically calculates dimensions at scale factor
  -w, --width <n>             Chart width in pixels (default: 800, ignored if --pptx-position)
      --height <n>            Chart height in pixels (default: 600, ignored if --pptx-position)
      --scale <n>             Scale factor for PNG output (default: 2)
      --title <text>          Chart title
      --theme <path>          Theme configuration file (JSON)
  -v, --verbose               Verbose output
      --debug                 Debug mode with timing
      --quiet                 Minimal output
  -h, --help                  Show this help message

Templates:
  bar       - Vertical bar chart
  barH      - Horizontal bar chart
  line      - Line chart
  area      - Area chart
  pie       - Pie chart
  doughnut  - Doughnut chart
  scatter   - Scatter plot
  heatmap   - Heatmap
  histogram - Histogram
  boxplot   - Box plot

PPTX Position Presets (common sizes in inches):
  fullWidth   - 9" x 4"    (full slide width below title bar)
  halfSlide   - 4.3" x 4"  (left or right column)
  twoThirds   - 6" x 4"    (two-thirds width)
  quarter     - 4.3" x 2"  (quarter slide for dashboards)

Examples:
  # Generate PNG from ChartConfig
  npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

  # Generate PNG for PPTX at exact 8" x 4" size
  npx tsx src/cli/chart-render.ts --config chart.json --output chart.png --pptx-position "8:4"

  # Generate from Vega-Lite spec directly
  npx tsx src/cli/chart-render.ts --spec vega-spec.json --output chart.png

  # Generate from data file
  npx tsx src/cli/chart-render.ts --template bar --data data.csv --x "Month" --y "Sales" --output chart.png

  # Export as SVG
  npx tsx src/cli/chart-render.ts --config chart.json --output chart.svg --format svg

  # Export Vega-Lite spec only (no rendering)
  npx tsx src/cli/chart-render.ts --config chart.json --output chart.json --format json
`);
}

/**
 * Render Vega-Lite spec to PNG using vega + canvas
 */
async function renderToPng(
  spec: VegaLiteSpec,
  outputPath: string,
  scale: number
): Promise<void> {
  const vega = await import('vega');
  const vegaLite = await import('vega-lite');

  // Compile Vega-Lite to Vega
  const vegaSpec = vegaLite.compile(spec as vegaLite.TopLevelSpec).spec;

  // Create Vega view
  const view = new vega.View(vega.parse(vegaSpec), { renderer: 'none' });

  // Generate PNG
  const canvas = await view.toCanvas(scale);
  const pngData = (canvas as unknown as { toBuffer: (type: string) => Buffer }).toBuffer('image/png');

  writeFileSync(outputPath, pngData);
  await view.finalize();
}

/**
 * Render Vega-Lite spec to SVG using vega
 */
async function renderToSvg(spec: VegaLiteSpec, outputPath: string): Promise<void> {
  const vega = await import('vega');
  const vegaLite = await import('vega-lite');

  // Compile Vega-Lite to Vega
  const vegaSpec = vegaLite.compile(spec as vegaLite.TopLevelSpec).spec;

  // Create Vega view
  const view = new vega.View(vega.parse(vegaSpec), { renderer: 'none' });

  // Generate SVG
  const svgString = await view.toSVG();

  writeFileSync(outputPath, svgString);
  await view.finalize();
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

    if (!args.config && !args.spec && !args.template) {
      throw new CliError('Either --config, --spec, or --template is required. Use --help for usage information.');
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

    let spec: VegaLiteSpec;

    if (args.spec) {
      // Load Vega-Lite spec directly
      if (!existsSync(args.spec)) {
        throw new CliError(`Spec file not found: ${args.spec}`);
      }

      const progress = new Progress('Loading Vega-Lite spec', !args.quiet);
      progress.start();

      try {
        const specContent = readFileSync(args.spec, 'utf-8');
        spec = JSON.parse(specContent);
        progress.succeed(`Vega-Lite spec loaded from ${args.spec}`);
      } catch (e) {
        progress.fail('Failed to parse spec');
        throw new CliError(`Error parsing spec file: ${(e as Error).message}`);
      }
    } else if (args.config) {
      // Load from config file and convert to Vega-Lite
      if (!existsSync(args.config)) {
        throw new CliError(`Config file not found: ${args.config}`);
      }

      const progress = new Progress('Loading chart config', !args.quiet);
      progress.start();

      try {
        const configContent = readFileSync(args.config, 'utf-8');
        const config: ChartConfig = JSON.parse(configContent);
        spec = chartService.generateSpec(config, args.width, args.height);
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

          spec = chartService.fromDataFrame(
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
            spec.title = { text: args.title, anchor: 'middle' };
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

        spec = chartService.generateSpec(sampleConfig, args.width, args.height);
        progress.succeed('Sample chart generated');
        logger.warn('No data file provided - using sample data');
      }
    } else {
      throw new CliError('No input provided');
    }

    // Determine dimensions from PPTX position or explicit width/height
    let finalWidth = args.width || 800;
    let finalHeight = args.height || 600;
    let finalScale = args.scale || 2;
    let pptxPosition: PptxPosition | undefined;

    if (args.pptxPosition) {
      const posProgress = new Progress('Calculating PPTX dimensions', !args.quiet);
      posProgress.start();

      try {
        pptxPosition = parsePositionString(args.pptxPosition);
        const pixelDims = pptxPositionToPixels(pptxPosition, { scale: finalScale });
        finalWidth = pixelDims.width;
        finalHeight = pixelDims.height;

        posProgress.succeed(`PPTX position: ${pptxPosition.w}" x ${pptxPosition.h}" → ${finalWidth}x${finalHeight}px`);
        logger.verbose(`  Position: x=${pptxPosition.x}", y=${pptxPosition.y}", w=${pptxPosition.w}", h=${pptxPosition.h}"`);
        logger.verbose(`  Aspect ratio: ${pixelDims.aspectRatio.toFixed(2)}`);
        logger.verbose(`  Scale factor: ${pixelDims.scale}x`);
      } catch (e) {
        posProgress.fail('Invalid PPTX position format');
        throw new CliError((e as Error).message);
      }
    }

    // Apply dimensions to spec
    spec.width = finalWidth;
    spec.height = finalHeight;

    // Generate output
    const saveProgress = new Progress('Saving chart', !args.quiet);
    saveProgress.start();

    const format = args.outputFormat || 'png';

    if (format === 'json') {
      // Just save the Vega-Lite spec
      const outputPath = args.output.endsWith('.json') ? args.output : `${args.output}.json`;
      chartService.saveSpec(spec, outputPath);
      saveProgress.succeed(`Vega-Lite spec saved to ${outputPath}`);

      logger.blank();
      logger.info(`Output file: ${outputPath}`);
      logger.info(`Dimensions: ${finalWidth}x${finalHeight}px`);
      logger.blank();
      logger.info('Use vl-convert or Vega Editor to render this spec.');
    } else if (format === 'svg') {
      // Generate SVG
      const outputPath = args.output.endsWith('.svg') ? args.output : args.output.replace(/\.(png|json)$/, '.svg');
      const svgPath = outputPath.endsWith('.svg') ? outputPath : `${outputPath}.svg`;

      await renderToSvg(spec, svgPath);
      saveProgress.succeed(`SVG saved to ${svgPath}`);

      // Also save the spec for reference
      const jsonPath = svgPath.replace('.svg', '.json');
      chartService.saveSpec(spec, jsonPath);

      logger.blank();
      logger.info(`Output files:`);
      logger.info(`  SVG: ${svgPath}`);
      logger.info(`  JSON: ${jsonPath}`);
      logger.info(`  Dimensions: ${finalWidth}x${finalHeight}px`);
    } else {
      // Generate PNG
      const outputPath = args.output.endsWith('.png') ? args.output : args.output.replace(/\.(svg|json|html)$/, '.png');
      const pngPath = outputPath.endsWith('.png') ? outputPath : `${outputPath}.png`;

      await renderToPng(spec, pngPath, finalScale);
      saveProgress.succeed(`PNG saved to ${pngPath}`);

      // Also save the spec for reference
      const jsonPath = pngPath.replace('.png', '.json');
      chartService.saveSpec(spec, jsonPath);

      logger.blank();
      logger.info(`Output files:`);
      logger.info(`  PNG: ${pngPath}`);
      logger.info(`  JSON: ${jsonPath}`);
      logger.info(`  Dimensions: ${finalWidth * finalScale}x${finalHeight * finalScale}px (${finalScale}x scale)`);
      if (pptxPosition) {
        logger.info(`  PPTX size: ${pptxPosition.w}" x ${pptxPosition.h}"`);
      }
      logger.blank();
      logger.info('The PNG is ready for PPTX insertion without resizing.');
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
