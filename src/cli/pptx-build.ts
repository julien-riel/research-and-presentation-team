#!/usr/bin/env node
/**
 * PPTX Builder CLI
 *
 * Generate PowerPoint presentations from JSON specifications
 *
 * Usage:
 *   npx tsx src/cli/pptx-build.ts --spec <path> --output <path>
 *
 * Options:
 *   --spec <path>        Path to presentation specification (JSON)
 *   --theme <path>       Path to theme file (JSON)
 *   --output <path>      Output PPTX file path (required)
 *   --quick              Quick mode: generate from title and bullets
 *   --title <text>       Presentation title (for quick mode)
 *   --verbose            Verbose output
 *   --debug              Debug mode
 *   --quiet              Minimal output
 */

import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import { PptxBuilderService } from '../lib/presentation/PptxBuilderService.js';
import type { PresentationSpec, PresentationTheme } from '../types/presentation.js';
import {
  Logger,
  Progress,
  ProgressBar,
  CliError,
  handleError,
  formatDuration,
  getVerbosity,
  COMMON_CLI_OPTIONS,
  type CommonArgs,
} from './utils/index.js';

interface CliArgs extends CommonArgs {
  spec?: string;
  theme?: string;
  output?: string;
  quick?: boolean;
  title?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      spec: { type: 'string', short: 's' },
      theme: { type: 'string', short: 't' },
      output: { type: 'string', short: 'o' },
      quick: { type: 'boolean', short: 'q' },
      title: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return values as CliArgs;
}

function showHelp(): void {
  console.log(`
PPTX Builder CLI - Generate PowerPoint presentations

Usage:
  npx tsx src/cli/pptx-build.ts --spec <path> --output <path>
  npx tsx src/cli/pptx-build.ts --quick --title "My Title" --output <path>

Options:
  -s, --spec <path>        Path to presentation specification (JSON)
  -t, --theme <path>       Path to theme file (JSON)
  -o, --output <path>      Output PPTX file path (required)
  -q, --quick              Quick mode: interactive prompt for simple presentations
      --title <text>       Presentation title (for quick mode)
  -v, --verbose            Verbose output
      --debug              Debug mode with timing
      --quiet              Minimal output
  -h, --help               Show this help message

Specification Format:
  See skills/pptx-builder/SKILL.md for the complete specification format.

  Basic structure:
  {
    "metadata": { "title": "...", "author": "..." },
    "settings": { "layout": "LAYOUT_16x9" },
    "theme": {
      "colors": { "primary": "#1E3A5F", "secondary": "#4A6FA5", "accent": "#EE6C4D" }
    },
    "slides": [
      { "type": "title", "title": "...", "subtitle": "..." },
      { "type": "section", "title": "Section Name", "number": 1 },
      { "type": "content", "title": "...", "elements": [...] },
      { "type": "two-column", "title": "...", "left": {...}, "right": {...} },
      { "type": "quote", "quote": "...", "author": "..." }
    ]
  }

Slide Types:
  title       - Title slide with main title, subtitle, author, date
  section     - Section divider with number and title
  content     - Content slide with title and elements
  two-column  - Two-column layout
  quote       - Quote slide with attribution

Element Types:
  text        - Text block with styling
  bullets     - Bullet point list
  table       - Data table with headers
  image       - Image from file path
  chart       - Embedded chart
  shape       - Shape (rect, ellipse, arrow, etc.)

Examples:
  npx tsx src/cli/pptx-build.ts --spec presentation.json --output presentation.pptx
  npx tsx src/cli/pptx-build.ts --spec presentation.json --theme corporate.json --output deck.pptx
  npx tsx src/cli/pptx-build.ts --quick --title "Q4 Review" --output review.pptx
`);
}

function validateSpec(spec: PresentationSpec): string[] {
  const errors: string[] = [];

  if (!spec.metadata?.title) {
    errors.push('Missing metadata.title');
  }

  if (!spec.slides || spec.slides.length === 0) {
    errors.push('No slides defined');
  }

  spec.slides?.forEach((slide, index) => {
    if (!slide.type) {
      errors.push(`Slide ${index + 1}: Missing type`);
    }

    // Type-specific validation
    switch (slide.type) {
      case 'content':
        if (!('elements' in slide) || !slide.elements?.length) {
          errors.push(`Slide ${index + 1} (content): Missing elements`);
        }
        break;
      case 'two-column':
        if (!('left' in slide) || !('right' in slide)) {
          errors.push(`Slide ${index + 1} (two-column): Missing left or right column`);
        }
        break;
      case 'quote':
        if (!('quote' in slide) || !slide.quote) {
          errors.push(`Slide ${index + 1} (quote): Missing quote text`);
        }
        if (!('author' in slide) || !slide.author) {
          errors.push(`Slide ${index + 1} (quote): Missing author`);
        }
        break;
    }
  });

  return errors;
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

    const builder = new PptxBuilderService();

    logger.debug(`Starting PPTX generation at ${new Date().toISOString()}`);

    // Quick mode: create a simple presentation
    if (args.quick) {
      const title = args.title || 'Presentation';

      logger.section('Quick Presentation Mode');
      logger.info(`Creating presentation: "${title}"`);
      logger.blank();

      const progress = new Progress('Building presentation', !args.quiet);
      progress.start();

      // In quick mode, create a simple presentation
      const result = await builder.createSimplePresentation(
        title,
        [
          {
            title: 'Overview',
            bullets: [
              'First key point',
              'Second key point',
              'Third key point',
            ],
          },
          {
            title: 'Details',
            bullets: [
              'Supporting information',
              'Data and evidence',
              'Next steps',
            ],
          },
          {
            title: 'Conclusion',
            bullets: [
              'Summary of main points',
              'Call to action',
              'Questions?',
            ],
          },
        ],
        args.output
      );

      if (result.success) {
        progress.succeed('Presentation created');
        logger.blank();
        logger.info(`Output: ${result.outputPath}`);
        logger.info(`Slides: ${result.slideCount}`);
        logger.blank();
        logger.info('Tip: Edit the JSON spec file for more customization.');
      } else {
        progress.fail('Failed to create presentation');
        throw new CliError(result.error || 'Unknown error');
      }

      logger.debug(`Total execution time: ${formatDuration(Date.now() - startTime)}`);
      return;
    }

    // Standard mode: build from spec file
    if (!args.spec) {
      throw new CliError('--spec is required (or use --quick for quick mode). Use --help for usage information.');
    }

    if (!existsSync(args.spec)) {
      throw new CliError(`Spec file not found: ${args.spec}`);
    }

    let spec: PresentationSpec;

    const loadProgress = new Progress('Loading specification', !args.quiet);
    loadProgress.start();

    try {
      const specContent = readFileSync(args.spec, 'utf-8');
      spec = JSON.parse(specContent);
      loadProgress.succeed(`Specification loaded from ${args.spec}`);
    } catch (e) {
      loadProgress.fail('Failed to load specification');
      throw new CliError(`Error parsing spec file: ${(e as Error).message}`);
    }

    // Load external theme if provided
    if (args.theme) {
      if (!existsSync(args.theme)) {
        throw new CliError(`Theme file not found: ${args.theme}`);
      }

      const themeProgress = new Progress('Loading theme', !args.quiet);
      themeProgress.start();

      try {
        const themeContent = readFileSync(args.theme, 'utf-8');
        const theme: PresentationTheme = JSON.parse(themeContent);
        spec.theme = { ...spec.theme, ...theme };
        themeProgress.succeed(`Theme loaded from ${args.theme}`);
      } catch (e) {
        themeProgress.fail('Failed to load theme');
        throw new CliError(`Error parsing theme file: ${(e as Error).message}`);
      }
    }

    // Validate spec
    const errors = validateSpec(spec);
    if (errors.length > 0) {
      logger.error('Specification validation failed:');
      errors.forEach((e) => logger.info(`  - ${e}`));
      throw new CliError('Please fix the specification errors and try again.', 2);
    }

    logger.section('PPTX Generation');
    logger.info(`Title: ${spec.metadata.title}`);
    logger.info(`Author: ${spec.metadata.author || 'Not specified'}`);
    logger.info(`Slides: ${spec.slides.length}`);
    logger.info(`Output: ${args.output}`);
    logger.blank();

    // Show slide summary in verbose mode
    if (args.verbose || args.debug) {
      logger.info('Slide Summary:');
      spec.slides.forEach((slide, index) => {
        const title = 'title' in slide ? slide.title : '(no title)';
        const icon =
          slide.type === 'title' ? 'T' :
          slide.type === 'section' ? 'S' :
          slide.type === 'content' ? 'C' :
          slide.type === 'two-column' ? '2' :
          slide.type === 'quote' ? 'Q' : '?';
        logger.verbose(`  ${index + 1}. [${icon}] ${slide.type}: ${title}`);
      });
      logger.blank();
    }

    // Build the presentation with progress bar
    const progressBar = new ProgressBar(spec.slides.length, 'Building slides');

    const buildProgress = new Progress('Building presentation', !args.quiet);
    buildProgress.start();

    const result = await builder.build(spec, args.output);

    if (result.success) {
      buildProgress.succeed('Presentation built successfully');
      logger.blank();
      logger.info(`Output: ${result.outputPath}`);
      logger.info(`Slides: ${result.slideCount}`);
    } else {
      buildProgress.fail('Failed to build presentation');
      throw new CliError(result.error || 'Unknown error');
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
