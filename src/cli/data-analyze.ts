#!/usr/bin/env node
/**
 * Data Analyzer CLI
 *
 * Statistical analysis of data files
 *
 * Usage:
 *   npx tsx src/cli/data-analyze.ts --file <path> [options]
 *
 * Options:
 *   --file <path>        Path to the data file (required)
 *   --describe           Descriptive statistics
 *   --correlations       Correlation matrix
 *   --threshold <n>      Correlation threshold (default: 0.5)
 *   --timeseries         Time series analysis
 *   --date-col <name>    Date column for time series
 *   --groupby <col>      Group by column
 *   --agg <ops>          Aggregation operations (comma-separated)
 *   --column <name>      Target column for single-column analysis
 *   --anomalies          Detect anomalies/outliers
 *   --method <m>         Outlier method: iqr, zscore (default: iqr)
 *   --output <path>      Output file (JSON)
 *   --format <fmt>       Output format: json, markdown, table (default: auto)
 *   --verbose            Verbose output
 *   --debug              Debug mode
 *   --quiet              Minimal output
 */

import { parseArgs } from 'node:util';
import { existsSync, writeFileSync } from 'node:fs';
import { DataReaderService } from '../lib/data/DataReaderService.js';
import { StatisticsService } from '../lib/analysis/StatisticsService.js';
import type { AggregationOperation, OutlierMethod } from '../types/analysis.js';
import {
  Logger,
  Progress,
  OutputFormatter,
  CliError,
  handleError,
  formatDuration,
  getVerbosity,
  getOutputFormat,
  COMMON_CLI_OPTIONS,
  type OutputFormat,
  type CommonArgs,
} from './utils/index.js';

interface CliArgs extends CommonArgs {
  file?: string;
  describe?: boolean;
  correlations?: boolean;
  threshold?: number;
  timeseries?: boolean;
  dateCol?: string;
  groupby?: string;
  agg?: string;
  column?: string;
  anomalies?: boolean;
  method?: string;
}

function parseArguments(): CliArgs {
  const { values } = parseArgs({
    options: {
      file: { type: 'string', short: 'f' },
      describe: { type: 'boolean', short: 'd' },
      correlations: { type: 'boolean', short: 'c' },
      threshold: { type: 'string' },
      timeseries: { type: 'boolean', short: 't' },
      'date-col': { type: 'string' },
      groupby: { type: 'string', short: 'g' },
      agg: { type: 'string', short: 'a' },
      column: { type: 'string' },
      anomalies: { type: 'boolean' },
      method: { type: 'string', short: 'm' },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
      ...COMMON_CLI_OPTIONS,
    },
    strict: true,
  });

  return {
    file: values.file as string | undefined,
    describe: values.describe as boolean | undefined,
    correlations: values.correlations as boolean | undefined,
    threshold: values.threshold ? parseFloat(values.threshold as string) : 0.5,
    timeseries: values.timeseries as boolean | undefined,
    dateCol: values['date-col'] as string | undefined,
    groupby: values.groupby as string | undefined,
    agg: values.agg as string | undefined,
    column: values.column as string | undefined,
    anomalies: values.anomalies as boolean | undefined,
    method: values.method as string | undefined,
    output: values.output as string | undefined,
    help: values.help as boolean | undefined,
    verbose: values.verbose as boolean | undefined,
    debug: values.debug as boolean | undefined,
    quiet: values.quiet as boolean | undefined,
    format: values.format as OutputFormat | undefined,
  };
}

function showHelp(): void {
  console.log(`
Data Analyzer CLI - Statistical analysis of data files

Usage:
  npx tsx src/cli/data-analyze.ts --file <path> [options]

Options:
  -f, --file <path>        Path to the data file (required)
  -d, --describe           Descriptive statistics for all numeric columns
  -c, --correlations       Find significant correlations
      --threshold <n>      Correlation threshold (default: 0.5)
  -t, --timeseries         Time series trend analysis
      --date-col <name>    Date column for time series
  -g, --groupby <col>      Group by column
  -a, --agg <ops>          Aggregation operations (mean,sum,count,min,max,median,std)
      --column <name>      Target column for single-column analysis
      --anomalies          Detect anomalies and outliers
  -m, --method <method>    Outlier method: iqr, zscore, modified_zscore (default: iqr)
  -o, --output <path>      Output file for results (JSON)
  -F, --format <fmt>       Output format: json, markdown, table (default: auto)
  -v, --verbose            Verbose output
      --debug              Debug mode with timing
      --quiet              Minimal output
  -h, --help               Show this help message

Examples:
  npx tsx src/cli/data-analyze.ts --file data.csv --describe
  npx tsx src/cli/data-analyze.ts --file data.xlsx --correlations --threshold 0.7
  npx tsx src/cli/data-analyze.ts --file data.csv --timeseries --column "sales"
  npx tsx src/cli/data-analyze.ts --file data.csv --groupby "category" --agg "mean,sum"
  npx tsx src/cli/data-analyze.ts --file data.csv --anomalies --column "value"
  npx tsx src/cli/data-analyze.ts --file data.csv --describe --format json
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
  const formatter = new OutputFormatter(getOutputFormat(args), logger);

  try {
    if (!args.file) {
      throw new CliError('--file is required. Use --help for usage information.');
    }

    if (!existsSync(args.file)) {
      throw new CliError(`File not found: ${args.file}`);
    }

    // Default to describe if no action specified
    if (
      !args.describe &&
      !args.correlations &&
      !args.timeseries &&
      !args.anomalies &&
      !args.groupby
    ) {
      args.describe = true;
    }

    const reader = new DataReaderService();
    const stats = new StatisticsService();
    const output: Record<string, unknown> = {};

    logger.section(`Analysis of ${args.file}`);
    logger.debug(`Starting analysis at ${new Date().toISOString()}`);

    // Load data
    const progress = new Progress('Loading data', !args.quiet);
    progress.start();

    const { dataFrame } = await reader.read(args.file);
    progress.succeed(`Loaded ${dataFrame.rowCount} rows, ${dataFrame.columns.length} columns`);
    logger.blank();

    logger.debug(`Data loaded in ${formatDuration(Date.now() - startTime)}`);

    // Descriptive statistics
    if (args.describe) {
      logger.section('Descriptive Statistics');

      const statsProgress = new Progress('Calculating statistics', !args.quiet);
      statsProgress.start();

      const statsResults = stats.describeAll(dataFrame);
      statsProgress.succeed(`Analyzed ${statsResults.length} numeric columns`);

      if (statsResults.length === 0) {
        logger.warn('No numeric columns found for analysis.');
      } else {
        formatter.table(
          ['Column', 'Count', 'Mean', 'Median', 'Std', 'Min', 'Max', 'Q1', 'Q3'],
          statsResults.map((s) => [
            s.column,
            s.count,
            s.mean,
            s.median,
            s.std,
            s.min,
            s.max,
            s.q1,
            s.q3,
          ])
        );
        output.descriptive = statsResults;
      }
      logger.blank();
    }

    // Correlations
    if (args.correlations) {
      logger.section('Significant Correlations');

      const corrProgress = new Progress('Calculating correlations', !args.quiet);
      corrProgress.start();

      const correlations = stats.findSignificantCorrelations(
        dataFrame,
        args.threshold,
        'pearson'
      );
      corrProgress.succeed(`Found ${correlations.length} significant correlations`);

      if (correlations.length === 0) {
        logger.info(`No correlations found above threshold ${args.threshold}`);
      } else {
        formatter.table(
          ['Column 1', 'Column 2', 'Correlation', 'Strength'],
          correlations.map((c) => [c.column1, c.column2, c.coefficient, c.strength])
        );
        output.correlations = correlations;
      }

      // Also output the full correlation matrix
      const matrix = stats.correlationMatrix(dataFrame);
      output.correlationMatrix = matrix;
      logger.blank();
    }

    // Time series analysis
    if (args.timeseries) {
      logger.section('Trend Analysis');

      const columns = args.column
        ? [args.column]
        : dataFrame.columns.filter((col) =>
            dataFrame.data[col].some((v) => typeof v === 'number')
          );

      const trends: unknown[] = [];

      for (const col of columns) {
        const values = dataFrame.data[col]?.filter(
          (v) => typeof v === 'number'
        ) as number[];

        if (values && values.length > 2) {
          const trend = stats.analyzeTrend(values);
          trend.column = col;
          trends.push(trend);

          const icon =
            trend.trend === 'increasing' ? '↗' :
            trend.trend === 'decreasing' ? '↘' :
            trend.trend === 'volatile' ? '↕' : '→';

          logger.info(`**${col}**: ${icon} ${trend.trend}`);
          logger.verbose(`  Slope: ${trend.slope.toFixed(4)}`);
          logger.verbose(`  R²: ${trend.rSquared.toFixed(3)}`);

          const growth = stats.growthRate(values);
          logger.verbose(`  Absolute growth: ${growth.absolute.toFixed(2)}`);
          logger.verbose(`  Relative growth: ${(growth.relative * 100).toFixed(1)}%`);
          if (growth.cagr !== undefined) {
            logger.verbose(`  CAGR: ${(growth.cagr * 100).toFixed(2)}%`);
          }
          logger.blank();
        }
      }

      output.trends = trends;
    }

    // Group by
    if (args.groupby) {
      logger.section(`Group By: ${args.groupby}`);

      const aggOps = (args.agg || 'mean,count').split(',') as AggregationOperation[];
      const numericCols = dataFrame.columns.filter(
        (col) =>
          col !== args.groupby &&
          dataFrame.data[col].some((v) => typeof v === 'number')
      );

      logger.debug(`Aggregating columns: ${numericCols.join(', ')}`);
      logger.debug(`Operations: ${aggOps.join(', ')}`);

      const aggregations = numericCols.flatMap((col) =>
        aggOps.map((op) => ({ column: col, operation: op }))
      );

      const result = stats.groupBy(dataFrame, args.groupby, aggregations);

      // Build table
      const headers = ['Group', 'Count', ...aggregations.map((a) => `${a.column}_${a.operation}`)];
      const rows = result.groups.map((g) => {
        const row: (string | number)[] = [String(g.groupValue), g.count];
        for (const a of aggregations) {
          const key = `${a.column}_${a.operation}`;
          row.push(g.aggregations[key]?.value ?? NaN);
        }
        return row;
      });

      formatter.table(headers, rows);
      output.groupBy = result;
      logger.blank();
    }

    // Anomaly detection
    if (args.anomalies) {
      logger.section('Anomaly Detection');

      const method = (args.method || 'iqr') as OutlierMethod;
      logger.verbose(`Method: ${method}`);

      const columns = args.column
        ? [args.column]
        : dataFrame.columns.filter((col) =>
            dataFrame.data[col].some((v) => typeof v === 'number')
          );

      const anomalies: unknown[] = [];
      let totalOutliers = 0;

      for (const col of columns) {
        const values = dataFrame.data[col] as number[];
        if (!values) continue;

        const result = stats.detectOutliers(values, method);
        result.column = col;

        if (result.outliers.length > 0) {
          totalOutliers += result.outliers.length;
          logger.info(`**${col}**: Found ${result.outliers.length} outliers`);
          logger.verbose(`  Bounds: [${result.lowerBound.toFixed(2)}, ${result.upperBound.toFixed(2)}]`);
          logger.verbose(`  Outlier values: ${result.outliers.slice(0, 5).map((o) => o.value.toFixed(2)).join(', ')}${result.outliers.length > 5 ? '...' : ''}`);
          anomalies.push(result);
        }
      }

      if (anomalies.length === 0) {
        logger.success('No anomalies detected');
      } else {
        logger.info(`\nTotal: ${totalOutliers} outliers in ${anomalies.length} columns`);
      }

      output.anomalies = anomalies;
      logger.blank();
    }

    // Write output if requested
    if (args.output && Object.keys(output).length > 0) {
      writeFileSync(args.output, JSON.stringify(output, null, 2));
      logger.success(`Results saved to ${args.output}`);
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
