/**
 * CLI Utilities
 *
 * Shared utilities for all CLI commands:
 * - Output formatters (JSON, Markdown, Table)
 * - Logging with verbosity levels
 * - Error handling
 * - Progress indicators
 */

/**
 * Output format options
 */
export type OutputFormat = 'json' | 'markdown' | 'table' | 'auto';

/**
 * Verbosity levels
 */
export type VerbosityLevel = 'quiet' | 'normal' | 'verbose' | 'debug';

/**
 * CLI Logger - handles output based on verbosity level
 */
export class Logger {
  private level: VerbosityLevel;
  private startTime: number;

  constructor(level: VerbosityLevel = 'normal') {
    this.level = level;
    this.startTime = Date.now();
  }

  /**
   * Check if a level should be logged
   */
  private shouldLog(level: VerbosityLevel): boolean {
    const levels: VerbosityLevel[] = ['quiet', 'normal', 'verbose', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  /**
   * Get elapsed time
   */
  private elapsed(): string {
    const ms = Date.now() - this.startTime;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  /**
   * Standard output (normal level)
   */
  info(message: string): void {
    if (this.shouldLog('normal')) {
      console.log(message);
    }
  }

  /**
   * Success message with checkmark
   */
  success(message: string): void {
    if (this.shouldLog('normal')) {
      console.log(`✓ ${message}`);
    }
  }

  /**
   * Warning message
   */
  warn(message: string): void {
    if (this.shouldLog('normal')) {
      console.warn(`⚠ ${message}`);
    }
  }

  /**
   * Error message
   */
  error(message: string): void {
    console.error(`✗ ${message}`);
  }

  /**
   * Verbose output (only in verbose/debug mode)
   */
  verbose(message: string): void {
    if (this.shouldLog('verbose')) {
      console.log(`  ${message}`);
    }
  }

  /**
   * Debug output (only in debug mode)
   */
  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG ${this.elapsed()}] ${message}`);
    }
  }

  /**
   * Print a header/section
   */
  section(title: string): void {
    if (this.shouldLog('normal')) {
      console.log(`\n## ${title}\n`);
    }
  }

  /**
   * Print a blank line
   */
  blank(): void {
    if (this.shouldLog('normal')) {
      console.log('');
    }
  }
}

/**
 * CLI Error with exit code
 */
export class CliError extends Error {
  code: number;

  constructor(message: string, code = 1) {
    super(message);
    this.name = 'CliError';
    this.code = code;
  }
}

/**
 * Handle CLI errors
 */
export function handleError(error: unknown, logger: Logger): never {
  if (error instanceof CliError) {
    logger.error(error.message);
    process.exit(error.code);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  logger.error(String(error));
  process.exit(1);
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

/**
 * Table formatter
 */
export class TableFormatter {
  /**
   * Format data as markdown table
   */
  static markdown(headers: string[], rows: unknown[][]): string {
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = rows.reduce((max, row) => {
        const cellStr = this.formatCell(row[i]);
        return Math.max(max, cellStr.length);
      }, 0);
      return Math.max(h.length, maxDataWidth, 3);
    });

    const separator = '|' + colWidths.map((w) => '-'.repeat(w + 2)).join('|') + '|';
    const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';

    const dataRows = rows.map(
      (row) =>
        '| ' +
        row
          .map((cell, i) => {
            const str = this.formatCell(cell);
            return str.slice(0, colWidths[i]).padEnd(colWidths[i]);
          })
          .join(' | ') +
        ' |'
    );

    return [headerRow, separator, ...dataRows].join('\n');
  }

  /**
   * Format data as plain text table
   */
  static plain(headers: string[], rows: unknown[][], maxWidth = 100): string {
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = rows.reduce((max, row) => {
        const cellStr = this.formatCell(row[i]);
        return Math.max(max, cellStr.length);
      }, 0);
      return Math.min(Math.max(h.length, maxDataWidth, 3), 30);
    });

    // Adjust for max width
    const totalWidth = colWidths.reduce((sum, w) => sum + w + 3, 1);
    if (totalWidth > maxWidth) {
      const factor = maxWidth / totalWidth;
      for (let i = 0; i < colWidths.length; i++) {
        colWidths[i] = Math.floor(colWidths[i] * factor);
      }
    }

    const separator = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
    const headerRow = '| ' + headers.map((h, i) => h.slice(0, colWidths[i]).padEnd(colWidths[i])).join(' | ') + ' |';

    const dataRows = rows.map(
      (row) =>
        '| ' +
        row
          .map((cell, i) => {
            const str = this.formatCell(cell);
            return str.slice(0, colWidths[i]).padEnd(colWidths[i]);
          })
          .join(' | ') +
        ' |'
    );

    return [separator, headerRow, separator, ...dataRows, separator].join('\n');
  }

  /**
   * Format a cell value
   */
  private static formatCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return String(value);
      return value.toFixed(2);
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return String(value);
  }
}

/**
 * JSON output formatter
 */
export class JsonFormatter {
  /**
   * Format data as JSON with optional pretty printing
   */
  static format(data: unknown, pretty = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }
}

/**
 * Output formatter - routes to appropriate formatter based on format
 */
export class OutputFormatter {
  private format: OutputFormat;
  private logger: Logger;

  constructor(format: OutputFormat, logger: Logger) {
    this.format = format;
    this.logger = logger;
  }

  /**
   * Output data as a table
   */
  table(headers: string[], rows: unknown[][], label?: string): void {
    if (label) {
      this.logger.section(label);
    }

    switch (this.format) {
      case 'json':
        const jsonData = rows.map((row) =>
          headers.reduce(
            (obj, header, i) => {
              obj[header] = row[i];
              return obj;
            },
            {} as Record<string, unknown>
          )
        );
        console.log(JsonFormatter.format(jsonData));
        break;
      case 'markdown':
        console.log(TableFormatter.markdown(headers, rows));
        break;
      case 'table':
      case 'auto':
      default:
        console.log(TableFormatter.markdown(headers, rows));
        break;
    }
  }

  /**
   * Output a key-value list
   */
  keyValue(data: Record<string, unknown>, label?: string): void {
    if (label) {
      this.logger.section(label);
    }

    switch (this.format) {
      case 'json':
        console.log(JsonFormatter.format(data));
        break;
      default:
        for (const [key, value] of Object.entries(data)) {
          console.log(`- **${key}**: ${this.formatValue(value)}`);
        }
        break;
    }
  }

  /**
   * Output raw JSON (always JSON format)
   */
  json(data: unknown): void {
    console.log(JsonFormatter.format(data));
  }

  /**
   * Format a value for display
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return String(value);
      return value.toFixed(2);
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }
}

/**
 * Simple progress indicator (spinner)
 */
export class Progress {
  private message: string;
  private interval: ReturnType<typeof setInterval> | null = null;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private enabled: boolean;

  constructor(message: string, enabled = true) {
    this.message = message;
    this.enabled = enabled && process.stdout.isTTY === true;
  }

  /**
   * Start the spinner
   */
  start(): void {
    if (!this.enabled) {
      console.log(`${this.message}...`);
      return;
    }

    process.stdout.write(`${this.frames[0]} ${this.message}`);
    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      process.stdout.write(`\r${this.frames[this.frameIndex]} ${this.message}`);
    }, 80);
  }

  /**
   * Update the message
   */
  update(message: string): void {
    this.message = message;
    if (!this.enabled) {
      console.log(`${message}...`);
    }
  }

  /**
   * Stop with success
   */
  succeed(message?: string): void {
    this.stop();
    console.log(`✓ ${message || this.message}`);
  }

  /**
   * Stop with failure
   */
  fail(message?: string): void {
    this.stop();
    console.log(`✗ ${message || this.message}`);
  }

  /**
   * Stop the spinner
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      if (this.enabled) {
        process.stdout.write('\r' + ' '.repeat(this.message.length + 3) + '\r');
      }
    }
  }
}

/**
 * Progress bar for multi-step operations
 */
export class ProgressBar {
  private total: number;
  private current: number = 0;
  private message: string;
  private barWidth: number;
  private enabled: boolean;

  constructor(total: number, message: string, barWidth = 30) {
    this.total = total;
    this.message = message;
    this.barWidth = barWidth;
    this.enabled = process.stdout.isTTY === true;
  }

  /**
   * Increment progress
   */
  increment(step = 1): void {
    this.current = Math.min(this.current + step, this.total);
    this.render();
  }

  /**
   * Set progress to specific value
   */
  set(value: number): void {
    this.current = Math.min(value, this.total);
    this.render();
  }

  /**
   * Render the progress bar
   */
  private render(): void {
    const percent = this.current / this.total;
    const filled = Math.round(this.barWidth * percent);
    const empty = this.barWidth - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percentStr = (percent * 100).toFixed(0).padStart(3);

    if (this.enabled) {
      process.stdout.write(`\r${this.message} [${bar}] ${percentStr}% (${this.current}/${this.total})`);
    }
  }

  /**
   * Complete the progress bar
   */
  complete(message?: string): void {
    this.current = this.total;
    this.render();
    if (this.enabled) {
      process.stdout.write('\n');
    }
    if (message) {
      console.log(`✓ ${message}`);
    }
  }
}

/**
 * Parse common CLI arguments
 */
export interface CommonArgs {
  format?: OutputFormat;
  verbose?: boolean;
  debug?: boolean;
  quiet?: boolean;
  output?: string;
  help?: boolean;
}

/**
 * Get verbosity level from args
 */
export function getVerbosity(args: CommonArgs): VerbosityLevel {
  if (args.debug) return 'debug';
  if (args.verbose) return 'verbose';
  if (args.quiet) return 'quiet';
  return 'normal';
}

/**
 * Get output format from args
 */
export function getOutputFormat(args: CommonArgs): OutputFormat {
  return args.format || 'auto';
}

/**
 * Add common CLI options to parseArgs options
 */
export const COMMON_CLI_OPTIONS = {
  format: { type: 'string' as const, short: 'F' },
  verbose: { type: 'boolean' as const, short: 'v' },
  debug: { type: 'boolean' as const },
  quiet: { type: 'boolean' as const },
} as const;
