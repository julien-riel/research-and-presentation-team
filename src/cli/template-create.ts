#!/usr/bin/env node
/**
 * Template Creator CLI
 *
 * Create presentations from predefined templates
 *
 * Usage:
 *   npx tsx src/cli/template-create.ts --template <type> --title <title> --output <path>
 *
 * Options:
 *   --template <type>     Template type (required)
 *   --title <title>       Presentation title (required)
 *   --subtitle <text>     Subtitle
 *   --author <name>       Author name
 *   --company <name>      Company name
 *   --date <date>         Date (YYYY-MM-DD)
 *   --theme <theme>       Theme name
 *   --output <path>       Output PPTX path (required)
 *   --list-templates      List available templates
 *   --list-themes         List available themes
 *   --verbose             Verbose output
 *   --debug               Debug mode
 *   --quiet               Minimal output
 */

import { parseArgs } from 'node:util';
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
  TemplateService,
  THEMES,
  type ThemeName,
  type TemplateType,
} from '../lib/presentation/TemplateService.js';
import { PptxBuilderService } from '../lib/presentation/PptxBuilderService.js';

interface CliArgs extends CommonArgs {
  template?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  company?: string;
  date?: string;
  theme?: string;
  listTemplates?: boolean;
  listThemes?: boolean;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      template: { type: 'string', short: 't' },
      title: { type: 'string', short: 'T' },
      subtitle: { type: 'string', short: 's' },
      author: { type: 'string', short: 'a' },
      company: { type: 'string', short: 'c' },
      date: { type: 'string', short: 'd' },
      theme: { type: 'string' },
      output: { type: 'string', short: 'o' },
      'list-templates': { type: 'boolean' },
      'list-themes': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    ...values,
    listTemplates: values['list-templates'],
    listThemes: values['list-themes'],
  } as CliArgs;
}

function showHelp(): void {
  console.log(`
Template Creator CLI - Create presentations from predefined templates

Usage:
  npx tsx src/cli/template-create.ts --template <type> --title <title> --output <path>

Options:
  -t, --template <type>     Template type (required, see --list-templates)
  -T, --title <title>       Presentation title (required)
  -s, --subtitle <text>     Subtitle
  -a, --author <name>       Author name
  -c, --company <name>      Company name
  -d, --date <date>         Date (YYYY-MM-DD, default: today)
      --theme <theme>       Theme name (see --list-themes, default: corporate)
  -o, --output <path>       Output PPTX path (required)
      --list-templates      List available templates
      --list-themes         List available themes with color info
  -v, --verbose             Verbose output
      --debug               Debug mode with timing
      --quiet               Minimal output
  -h, --help                Show this help message

Available Templates:
  - business-report     Standard business report with sections
  - pitch-deck          Investor pitch deck (problem/solution/market/ask)
  - training            Training presentation with modules
  - quarterly-review    Quarterly business review (QBR)
  - product-launch      Product launch announcement
  - data-analysis       Data analysis report with findings

Available Themes:
  - corporate           Blue professional (default)
  - modern              Purple/indigo modern
  - minimal             Black/white minimal
  - nature              Green natural
  - tech                Dark tech style
  - warmth              Warm brown/orange
  - ocean               Blue ocean
  - dark                Dark mode

Examples:
  # Create a pitch deck
  npx tsx src/cli/template-create.ts \\
    --template pitch-deck \\
    --title "Our Startup" \\
    --company "Acme Inc" \\
    --theme modern \\
    --output pitch.pptx

  # Create a quarterly review
  npx tsx src/cli/template-create.ts \\
    --template quarterly-review \\
    --title "Q4 2024 Review" \\
    --author "John Smith" \\
    --output q4-review.pptx

  # List all templates
  npx tsx src/cli/template-create.ts --list-templates

  # List all themes with colors
  npx tsx src/cli/template-create.ts --list-themes
`);
}

function listTemplates(): void {
  console.log('\nAvailable Templates:\n');
  console.log('  business-report   Standard business report with agenda and sections');
  console.log('  pitch-deck        Investor pitch (problem/solution/market/traction/ask)');
  console.log('  training          Training/workshop with modules and exercises');
  console.log('  quarterly-review  Quarterly business review (QBR) format');
  console.log('  product-launch    Product launch announcement');
  console.log('  data-analysis     Data analysis report with methodology and findings');
  console.log('');
}

function listThemes(): void {
  console.log('\nAvailable Themes:\n');

  for (const [name, theme] of Object.entries(THEMES)) {
    console.log(`  ${name.padEnd(15)} Primary: ${theme.colors.primary}  Accent: ${theme.colors.accent}`);
  }

  console.log('');
  console.log('Theme details:');
  console.log('  corporate  - Professional blue theme, ideal for business presentations');
  console.log('  modern     - Purple/indigo theme, contemporary and vibrant');
  console.log('  minimal    - Black/white theme, clean and focused');
  console.log('  nature     - Green theme, organic and calming');
  console.log('  tech       - Dark slate theme, technical and modern');
  console.log('  warmth     - Brown/orange theme, warm and inviting');
  console.log('  ocean      - Blue ocean theme, fresh and professional');
  console.log('  dark       - Dark mode theme, easy on the eyes');
  console.log('');
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const args = parseArguments();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const logger = new Logger(getVerbosity(args));

  // Handle list commands
  if (args.listTemplates) {
    listTemplates();
    process.exit(0);
  }

  if (args.listThemes) {
    listThemes();
    process.exit(0);
  }

  try {
    // Validate required arguments
    if (!args.template) {
      throw new CliError('--template is required. Use --list-templates to see available templates.');
    }

    if (!args.title) {
      throw new CliError('--title is required. Provide a title for your presentation.');
    }

    if (!args.output) {
      throw new CliError('--output is required. Specify the output PPTX file path.');
    }

    logger.debug(`Starting template creation at ${new Date().toISOString()}`);

    const templateService = new TemplateService();
    const pptxBuilder = new PptxBuilderService();

    // Validate template type
    const availableTemplates = templateService.getAvailableTemplates();
    if (!availableTemplates.includes(args.template as TemplateType)) {
      throw new CliError(
        `Unknown template: ${args.template}. Available: ${availableTemplates.join(', ')}`
      );
    }

    // Validate theme
    const availableThemes = templateService.getAvailableThemes();
    if (args.theme && !availableThemes.includes(args.theme as ThemeName)) {
      throw new CliError(
        `Unknown theme: ${args.theme}. Available: ${availableThemes.join(', ')}`
      );
    }

    logger.section('Template Creation');
    logger.info(`Template: ${args.template}`);
    logger.info(`Title: ${args.title}`);
    logger.info(`Theme: ${args.theme || 'corporate'}`);
    logger.info(`Output: ${args.output}`);
    logger.blank();

    // Create spec from template
    const progress = new Progress('Creating presentation', !args.quiet);
    progress.start();

    const spec = templateService.createFromTemplate(
      args.template as TemplateType,
      {
        title: args.title,
        subtitle: args.subtitle,
        author: args.author,
        company: args.company,
        date: args.date || new Date().toISOString().split('T')[0],
        theme: (args.theme as ThemeName) || 'corporate',
      }
    );

    logger.verbose(`  Generated ${spec.slides.length} slides`);

    // Build PPTX
    progress.update('Building PPTX file');
    const result = await pptxBuilder.build(spec, args.output);

    if (result.success) {
      progress.succeed('Presentation created');
      logger.blank();
      logger.info(`Output: ${result.outputPath}`);
      logger.info(`Slides: ${result.slideCount}`);
    } else {
      progress.fail('Failed to create presentation');
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
