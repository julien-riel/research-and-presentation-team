#!/usr/bin/env node
/**
 * Diagram Renderer CLI
 *
 * Generate diagrams using Kroki API (supports Mermaid, PlantUML, GraphViz, D2, and more)
 *
 * Usage:
 *   npx tsx src/cli/diagram-render.ts --type <type> --input <path> --output <path>
 *   npx tsx src/cli/diagram-render.ts --type mermaid --input flow.mmd --output flow.png
 *
 * Options:
 *   --type <type>           Diagram type: mermaid, plantuml, graphviz, d2, etc.
 *   --input <path>          Input file path
 *   --code <string>         Inline diagram code
 *   --output <path>         Output image path (required)
 *   --format <fmt>          Output format: png, svg (default: png)
 *   --server <url>          Kroki server URL (default: https://kroki.io)
 *   --verbose               Verbose output
 *   --debug                 Debug mode
 *   --quiet                 Minimal output
 */

import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import {
  KrokiService,
  type KrokiDiagramType,
  type KrokiOutputFormat,
  type ImageDimensions,
} from '../lib/rendering/KrokiService.js';

/** PPTX optimal ratio range (landscape, for 16:9 slides) */
const PPTX_MIN_RATIO = 1.5;
const PPTX_MAX_RATIO = 3.0;
const PPTX_OPTIMAL_RATIO = 2.25; // ~9" x 4" content area
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

interface CliArgs extends Omit<CommonArgs, 'format'> {
  type?: string;
  input?: string;
  code?: string;
  output?: string;
  outputFormat?: string;
  server?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      type: { type: 'string', short: 't' },
      input: { type: 'string', short: 'i' },
      code: { type: 'string', short: 'c' },
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f' },
      server: { type: 'string', short: 's' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    outputFormat: (values.format as string) || 'png',
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Diagram Renderer CLI - Generate diagrams using Kroki API

Kroki is a unified API that renders diagrams from text.
No local dependencies needed - diagrams are rendered server-side.

Usage:
  npx tsx src/cli/diagram-render.ts --type <type> --input <path> --output <path>
  npx tsx src/cli/diagram-render.ts --type mermaid --code "graph TD; A-->B" --output flow.png

Options:
  -t, --type <type>         Diagram type (see list below)
  -i, --input <path>        Input file path (.mmd, .puml, .dot, .d2, etc.)
  -c, --code <string>       Inline diagram code (alternative to --input)
  -o, --output <path>       Output image path (required)
  -f, --format <fmt>        Output format: png, svg (default: png)
  -s, --server <url>        Kroki server URL (default: https://kroki.io)
  -v, --verbose             Verbose output
      --debug               Debug mode with timing
      --quiet               Minimal output
  -h, --help                Show this help message

Diagram Types:
  Popular:
    mermaid     - Flowcharts, sequence diagrams, mind maps, etc.
    plantuml    - UML diagrams (class, sequence, activity, etc.)
    graphviz    - Graph visualization (DOT language)
    d2          - Modern diagram scripting language
    excalidraw  - Hand-drawn style diagrams

  UML & Architecture:
    c4plantuml  - C4 model architecture diagrams
    structurizr - Architecture as code
    nomnoml     - Simple UML diagrams

  Specialized:
    erd         - Entity-relationship diagrams
    bpmn        - Business process diagrams
    ditaa       - ASCII art diagrams
    svgbob      - ASCII to SVG

  Network & Sequence:
    seqdiag     - Sequence diagrams
    blockdiag   - Block diagrams
    nwdiag      - Network diagrams
    actdiag     - Activity diagrams
    packetdiag  - Packet diagrams
    rackdiag    - Rack diagrams

  Other:
    wavedrom    - Digital timing diagrams
    bytefield   - Byte field diagrams
    pikchr      - PIC-like diagrams
    vega        - Vega visualization
    vegalite    - Vega-Lite visualization

File Extensions (auto-detected):
  .mmd, .mermaid  → mermaid
  .puml, .pu      → plantuml
  .dot, .gv       → graphviz
  .d2             → d2
  .excalidraw     → excalidraw
  .erd            → erd
  .bpmn           → bpmn

Examples:
  # Render Mermaid diagram to PNG
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png

  # Inline code (useful for simple diagrams)
  npx tsx src/cli/diagram-render.ts --type mermaid --code "graph TD; A-->B-->C" --output flow.png

  # Export as SVG
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.svg --format svg

  # PlantUML class diagram
  npx tsx src/cli/diagram-render.ts --type plantuml --input classes.puml --output classes.png

  # GraphViz diagram
  npx tsx src/cli/diagram-render.ts --type graphviz --input graph.dot --output graph.png

  # D2 diagram
  npx tsx src/cli/diagram-render.ts --type d2 --input arch.d2 --output arch.svg --format svg

  # Use self-hosted Kroki server
  npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png --server http://localhost:8000

Note: Kroki.io is free for public use. For high-volume or private diagrams,
consider self-hosting: https://github.com/yuzutech/kroki
`);
}

/**
 * Infer diagram type from file extension
 */
function inferDiagramType(filePath: string): KrokiDiagramType | null {
  const ext = extname(filePath).toLowerCase();
  return KrokiService.getDiagramTypeFromExtension(ext);
}

/**
 * Validate diagram type
 */
function validateDiagramType(type: string): KrokiDiagramType {
  const supportedTypes = KrokiService.getSupportedTypes();
  if (!supportedTypes.includes(type as KrokiDiagramType)) {
    throw new CliError(
      `Unknown diagram type: ${type}\n  Supported types: ${supportedTypes.join(', ')}`
    );
  }
  return type as KrokiDiagramType;
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

    if (!args.input && !args.code) {
      throw new CliError('Either --input or --code is required. Use --help for usage information.');
    }

    logger.debug(`Starting diagram generation at ${new Date().toISOString()}`);

    // Load diagram code
    let diagramCode: string;
    let inferredType: KrokiDiagramType | null = null;

    if (args.input) {
      if (!existsSync(args.input)) {
        throw new CliError(`Input file not found: ${args.input}`);
      }

      const progress = new Progress('Loading diagram code', !args.quiet);
      progress.start();

      diagramCode = readFileSync(args.input, 'utf-8');
      inferredType = inferDiagramType(args.input);

      progress.succeed(`Loaded from ${args.input}`);
      logger.verbose(`  Lines: ${diagramCode.split('\n').length}`);
      logger.verbose(`  Size: ${diagramCode.length} characters`);
      if (inferredType) {
        logger.verbose(`  Inferred type: ${inferredType}`);
      }
    } else {
      diagramCode = args.code!;
      logger.verbose(`Using inline code (${diagramCode.length} characters)`);
    }

    // Determine diagram type
    let diagramType: KrokiDiagramType;
    if (args.type) {
      diagramType = validateDiagramType(args.type);
    } else if (inferredType) {
      diagramType = inferredType;
      logger.info(`Auto-detected diagram type: ${diagramType}`);
    } else {
      throw new CliError(
        '--type is required when using --code or when file extension is not recognized.\n' +
          '  Use --help to see supported diagram types.'
      );
    }

    // Determine output format
    const outputFormat = (args.outputFormat || 'png') as KrokiOutputFormat;
    if (!['png', 'svg', 'pdf', 'jpeg'].includes(outputFormat)) {
      throw new CliError(`Unsupported output format: ${outputFormat}. Use png, svg, pdf, or jpeg.`);
    }

    logger.section('Diagram Generation');
    logger.info(`Type: ${diagramType}`);
    logger.info(`Output: ${args.output}`);
    logger.info(`Format: ${outputFormat}`);
    if (args.server) {
      logger.info(`Server: ${args.server}`);
    }
    logger.blank();

    // Initialize Kroki service
    const kroki = new KrokiService({
      serverUrl: args.server,
    });

    // Check server availability (optional, but helpful for debugging)
    if (args.debug) {
      const healthProgress = new Progress('Checking Kroki server', !args.quiet);
      healthProgress.start();
      const isHealthy = await kroki.healthCheck();
      if (isHealthy) {
        healthProgress.succeed('Kroki server is available');
      } else {
        healthProgress.fail('Kroki server might be unavailable');
        logger.warn('Continuing anyway...');
      }
    }

    // Render diagram
    const renderProgress = new Progress('Rendering diagram', !args.quiet);
    renderProgress.start();

    let dimensions: ImageDimensions | undefined;

    try {
      const result = await kroki.renderToFile(diagramType, diagramCode, args.output, {
        format: outputFormat,
      });
      dimensions = result.dimensions;
      renderProgress.succeed(`Diagram saved to ${args.output}`);
    } catch (error) {
      renderProgress.fail('Failed to render diagram');
      const message = error instanceof Error ? error.message : String(error);
      throw new CliError(`Kroki rendering failed: ${message}`);
    }

    logger.blank();
    logger.info(`Output: ${args.output}`);

    // Display dimensions for PNG
    if (dimensions) {
      logger.info(`Dimensions: ${dimensions.width} x ${dimensions.height} px`);
      logger.info(`Ratio: ${dimensions.ratio}:1`);

      // Check ratio for PPTX compatibility
      if (dimensions.ratio < PPTX_MIN_RATIO) {
        logger.warn(`⚠️  Ratio too vertical (${dimensions.ratio}:1) for PPTX slides.`);
        logger.warn(`   Optimal range: ${PPTX_MIN_RATIO}:1 to ${PPTX_MAX_RATIO}:1`);
        logger.warn(`   Tip: Use 'flowchart LR' instead of 'flowchart TB' for horizontal layout.`);
      } else if (dimensions.ratio > PPTX_MAX_RATIO) {
        logger.warn(`⚠️  Ratio too wide (${dimensions.ratio}:1) for PPTX slides.`);
        logger.warn(`   Optimal range: ${PPTX_MIN_RATIO}:1 to ${PPTX_MAX_RATIO}:1`);
        logger.warn(`   Tip: Add more vertical elements or use subgraphs to balance the layout.`);
      } else {
        logger.info(`✓ Ratio OK for PPTX (optimal: ~${PPTX_OPTIMAL_RATIO}:1)`);
      }
    }

    logger.blank();
    logger.info('The diagram is ready for use.');

    logger.debug(`Total execution time: ${formatDuration(Date.now() - startTime)}`);
  } catch (error) {
    handleError(error, logger);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
