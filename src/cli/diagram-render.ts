#!/usr/bin/env node
/**
 * Diagram Renderer CLI
 *
 * Generate diagrams using Mermaid with PNG/SVG export support
 *
 * Usage:
 *   npx tsx src/cli/diagram-render.ts --type <mermaid|plantuml> --input <path> --output <path>
 *
 * Options:
 *   --type <type>        Diagram type: mermaid or plantuml (required)
 *   --input <path>       Input file path (.mmd or .puml)
 *   --code <string>      Inline diagram code
 *   --output <path>      Output image path (required)
 *   --format <fmt>       Output format: png, svg, html (default: png)
 *   --theme <theme>      Mermaid theme: default, forest, dark, neutral
 *   --width <n>          Image width (default: 1200)
 *   --height <n>         Image height (default: 800)
 *   --scale <n>          Scale factor (default: 2)
 *   --verbose            Verbose output
 *   --debug              Debug mode
 *   --quiet              Minimal output
 */

import { parseArgs } from 'node:util';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
import {
  ImageRenderService,
  closeImageRenderService,
} from '../lib/rendering/ImageRenderService.js';

interface CliArgs extends Omit<CommonArgs, 'format'> {
  type?: string;
  input?: string;
  code?: string;
  output?: string;
  imageFormat?: string;
  theme?: string;
  width?: number;
  height?: number;
  scale?: number;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      type: { type: 'string', short: 't' },
      input: { type: 'string', short: 'i' },
      code: { type: 'string', short: 'c' },
      output: { type: 'string', short: 'o' },
      'image-format': { type: 'string', short: 'f' },
      theme: { type: 'string' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string', short: 'H' },
      scale: { type: 'string', short: 's' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    width: values.width ? parseInt(values.width as string) : 1200,
    height: values.height ? parseInt(values.height as string) : 800,
    scale: values.scale ? parseFloat(values.scale as string) : 2,
    imageFormat: (values['image-format'] as string) || 'png',
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Diagram Renderer CLI - Generate diagrams using Mermaid with PNG/SVG export

Usage:
  npx tsx src/cli/diagram-render.ts --type <type> --input <path> --output <path>

Options:
  -t, --type <type>        Diagram type: mermaid or plantuml (required)
  -i, --input <path>       Input file path (.mmd, .mermaid, .puml, .plantuml)
  -c, --code <string>      Inline diagram code (alternative to --input)
  -o, --output <path>      Output image path (required)
  -f, --format <fmt>       Output format: png, svg, html (default: png)
      --theme <theme>      Mermaid theme: default, forest, dark, neutral
  -w, --width <n>          Image width in pixels (default: 1200)
  -H, --height <n>         Image height in pixels (default: 800)
  -s, --scale <n>          Scale factor for resolution (default: 2)
  -v, --verbose            Verbose output
      --debug              Debug mode with timing
      --quiet              Minimal output
  -h, --help               Show this help message

Mermaid Diagram Types:
  - flowchart (graph TD/LR/etc.)
  - sequenceDiagram
  - classDiagram
  - stateDiagram-v2
  - erDiagram
  - gantt
  - pie
  - mindmap
  - timeline

Examples:
  # Render Mermaid to PNG
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png

  # Inline code with dark theme
  npx tsx src/cli/diagram-render.ts --type mermaid --code "graph TD; A-->B" --output flow.png --theme dark

  # Export as SVG
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.svg --format svg

  # High resolution
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png --scale 3

  # HTML preview (fallback)
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.html --format html
`);
}

function generateMermaidPreviewHtml(code: string, theme: string = 'default'): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mermaid Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
    .mermaid { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { font-size: 16px; color: #333; margin-bottom: 10px; }
    .info { margin-top: 10px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>Mermaid Diagram Preview</h1>
  <div class="mermaid">
${code}
  </div>
  <div class="info">
    Generated with Presentation Team - Diagram Renderer
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: '${theme}' });
  </script>
</body>
</html>`;
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
    if (!args.type) {
      throw new CliError('--type is required (mermaid or plantuml). Use --help for usage information.');
    }

    if (!args.output) {
      throw new CliError('--output is required. Use --help for usage information.');
    }

    if (!args.input && !args.code) {
      throw new CliError('Either --input or --code is required. Use --help for usage information.');
    }

    logger.debug(`Starting diagram generation at ${new Date().toISOString()}`);

    let diagramCode: string;

    if (args.input) {
      if (!existsSync(args.input)) {
        throw new CliError(`Input file not found: ${args.input}`);
      }

      const progress = new Progress('Loading diagram code', !args.quiet);
      progress.start();

      diagramCode = readFileSync(args.input, 'utf-8');
      progress.succeed(`Loaded from ${args.input}`);

      logger.verbose(`  Lines: ${diagramCode.split('\n').length}`);
      logger.verbose(`  Size: ${diagramCode.length} characters`);
    } else {
      diagramCode = args.code!;
      logger.verbose(`Using inline code (${diagramCode.length} characters)`);
    }

    logger.section('Diagram Generation');
    logger.info(`Type: ${args.type}`);
    logger.info(`Output: ${args.output}`);
    logger.info(`Format: ${args.imageFormat}`);
    logger.info(`Size: ${args.width}x${args.height} @ ${args.scale}x`);
    if (args.theme) {
      logger.info(`Theme: ${args.theme}`);
    }
    logger.blank();

    if (args.type === 'mermaid') {
      const progress = new Progress('Generating diagram', !args.quiet);
      progress.start();

      if (args.imageFormat === 'html') {
        // HTML preview (fallback, no browser needed)
        const html = generateMermaidPreviewHtml(diagramCode, args.theme);
        writeFileSync(args.output, html);
        progress.succeed('HTML preview generated');

        logger.blank();
        logger.info(`Output: ${args.output}`);
        logger.info('Open the HTML file in a browser to view the diagram.');
      } else if (args.imageFormat === 'svg') {
        // SVG export using Playwright
        const renderService = new ImageRenderService();

        try {
          await renderService.saveMermaidSvg(
            diagramCode,
            args.output,
            args.theme || 'default'
          );
          progress.succeed('SVG generated');
          logger.blank();
          logger.info(`Output: ${args.output}`);
        } finally {
          await renderService.close();
        }
      } else {
        // PNG export using Playwright
        const renderService = new ImageRenderService();

        try {
          await renderService.renderMermaid(diagramCode, args.output, {
            width: args.width,
            height: args.height,
            scale: args.scale,
            format: 'png',
            theme: args.theme || 'default',
          });
          progress.succeed('PNG generated');
          logger.blank();
          logger.info(`Output: ${args.output}`);
          logger.info(`Resolution: ${args.width! * args.scale!}x${args.height! * args.scale!} pixels`);
        } finally {
          await renderService.close();
        }
      }
    } else if (args.type === 'plantuml') {
      logger.warn('PlantUML rendering requires Java to be installed.');
      logger.info('');
      logger.info('Alternative: Use Mermaid for most diagram types.');
      logger.info('Mermaid supports: flowcharts, sequence, class, state, ER, gantt, pie, mindmap');
      throw new CliError('PlantUML support requires Java installation. Consider using Mermaid instead.');
    } else {
      throw new CliError(`Unknown diagram type: ${args.type}. Use 'mermaid' or 'plantuml'.`);
    }

    logger.debug(`Total execution time: ${formatDuration(Date.now() - startTime)}`);
  } catch (error) {
    await closeImageRenderService();
    handleError(error, logger);
  }
}

main().catch(async (error) => {
  await closeImageRenderService();
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
