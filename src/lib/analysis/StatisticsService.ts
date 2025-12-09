/**
 * StatisticsService - Statistical analysis of data
 *
 * Features:
 * - Descriptive statistics (mean, median, std, quartiles)
 * - Correlation analysis (Pearson, Spearman)
 * - Outlier detection (IQR, Z-score)
 * - Trend analysis
 * - Group by aggregations
 */

import * as ss from 'simple-statistics';
import type { DataFrame } from '../../types/data.js';
import type {
  AggregationOperation,
  CorrelationMatrix,
  CorrelationMethod,
  CorrelationResult,
  CorrelationStrength,
  DescriptiveStats,
  GroupByResult,
  GroupStats,
  OutlierMethod,
  OutlierResult,
  TrendAnalysis,
} from '../../types/analysis.js';

/**
 * Service for statistical analysis
 */
export class StatisticsService {
  /**
   * Calculate descriptive statistics for a numeric column
   */
  describe(values: number[]): DescriptiveStats {
    const validValues = values.filter((v) => v !== null && v !== undefined && !isNaN(v));

    if (validValues.length === 0) {
      return this.emptyStats('');
    }

    const sorted = [...validValues].sort((a, b) => a - b);
    const n = validValues.length;

    const mean = ss.mean(validValues);
    const median = ss.median(sorted);
    const std = ss.standardDeviation(validValues);
    const min = ss.min(validValues);
    const max = ss.max(validValues);
    const q1 = ss.quantile(sorted, 0.25);
    const q3 = ss.quantile(sorted, 0.75);
    const iqr = q3 - q1;

    // Skewness and kurtosis
    const skewness = this.calculateSkewness(validValues, mean, std);
    const kurtosis = this.calculateKurtosis(validValues, mean, std);

    const nullCount = values.length - validValues.length;

    return {
      column: '',
      count: n,
      mean,
      median,
      std,
      min,
      max,
      q1,
      q3,
      iqr,
      skewness,
      kurtosis,
      nullCount,
      nullPercent: (nullCount / values.length) * 100,
    };
  }

  /**
   * Calculate descriptive statistics for all numeric columns
   */
  describeAll(dataFrame: DataFrame): DescriptiveStats[] {
    const results: DescriptiveStats[] = [];

    for (const column of dataFrame.columns) {
      const values = dataFrame.data[column];
      const numericValues = values
        .filter((v) => typeof v === 'number')
        .map((v) => v as number);

      if (numericValues.length > 0) {
        const stats = this.describe(numericValues);
        stats.column = column;
        results.push(stats);
      }
    }

    return results;
  }

  /**
   * Empty stats for columns with no valid data
   */
  private emptyStats(column: string): DescriptiveStats {
    return {
      column,
      count: 0,
      mean: NaN,
      median: NaN,
      std: NaN,
      min: NaN,
      max: NaN,
      q1: NaN,
      q3: NaN,
      iqr: NaN,
      skewness: NaN,
      kurtosis: NaN,
      nullCount: 0,
      nullPercent: 0,
    };
  }

  /**
   * Calculate skewness
   */
  private calculateSkewness(values: number[], mean: number, std: number): number {
    if (std === 0 || values.length < 3) return 0;

    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }

  /**
   * Calculate kurtosis (excess kurtosis)
   */
  private calculateKurtosis(values: number[], mean: number, std: number): number {
    if (std === 0 || values.length < 4) return 0;

    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 4), 0);
    const k = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum;
    const correction = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
    return k - correction;
  }

  /**
   * Calculate correlation between two columns
   */
  correlation(
    x: number[],
    y: number[],
    method: CorrelationMethod = 'pearson'
  ): number {
    // Filter paired values where both are valid numbers
    const pairs: [number, number][] = [];
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      if (
        typeof x[i] === 'number' &&
        typeof y[i] === 'number' &&
        !isNaN(x[i]) &&
        !isNaN(y[i])
      ) {
        pairs.push([x[i], y[i]]);
      }
    }

    if (pairs.length < 3) return NaN;

    const xVals = pairs.map((p) => p[0]);
    const yVals = pairs.map((p) => p[1]);

    switch (method) {
      case 'pearson':
        return ss.sampleCorrelation(xVals, yVals);
      case 'spearman':
        return this.spearmanCorrelation(xVals, yVals);
      case 'kendall':
        return this.kendallCorrelation(xVals, yVals);
      default:
        return ss.sampleCorrelation(xVals, yVals);
    }
  }

  /**
   * Calculate Spearman rank correlation
   */
  private spearmanCorrelation(x: number[], y: number[]): number {
    const rankX = this.rank(x);
    const rankY = this.rank(y);
    return ss.sampleCorrelation(rankX, rankY);
  }

  /**
   * Calculate Kendall tau correlation
   */
  private kendallCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    let concordant = 0;
    let discordant = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const xDiff = x[i] - x[j];
        const yDiff = y[i] - y[j];
        const product = xDiff * yDiff;

        if (product > 0) concordant++;
        else if (product < 0) discordant++;
      }
    }

    const totalPairs = (n * (n - 1)) / 2;
    return (concordant - discordant) / totalPairs;
  }

  /**
   * Rank values (for Spearman)
   */
  private rank(values: number[]): number[] {
    const indexed = values.map((v, i) => ({ value: v, index: i }));
    indexed.sort((a, b) => a.value - b.value);

    const ranks = new Array(values.length);
    for (let i = 0; i < indexed.length; i++) {
      ranks[indexed[i].index] = i + 1;
    }

    // Handle ties by averaging ranks
    const sorted = [...values].sort((a, b) => a - b);
    let i = 0;
    while (i < sorted.length) {
      let j = i;
      while (j < sorted.length && sorted[j] === sorted[i]) j++;
      if (j > i + 1) {
        const avgRank = (i + j + 1) / 2;
        for (let k = 0; k < values.length; k++) {
          if (values[k] === sorted[i]) {
            ranks[k] = avgRank;
          }
        }
      }
      i = j;
    }

    return ranks;
  }

  /**
   * Get correlation strength description
   */
  getCorrelationStrength(r: number): CorrelationStrength {
    const absR = Math.abs(r);
    if (absR < 0.1) return 'negligible';
    if (absR < 0.3) return 'weak';
    if (absR < 0.5) return 'moderate';
    if (absR < 0.7) return 'strong';
    return 'very_strong';
  }

  /**
   * Calculate correlation matrix for all numeric columns
   */
  correlationMatrix(
    dataFrame: DataFrame,
    method: CorrelationMethod = 'pearson'
  ): CorrelationMatrix {
    const numericColumns = dataFrame.columns.filter((col) => {
      const values = dataFrame.data[col];
      return values.some((v) => typeof v === 'number');
    });

    const n = numericColumns.length;
    const values: number[][] = [];

    for (let i = 0; i < n; i++) {
      values[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          values[i][j] = 1;
        } else if (j < i) {
          values[i][j] = values[j][i];
        } else {
          const xValues = dataFrame.data[numericColumns[i]] as number[];
          const yValues = dataFrame.data[numericColumns[j]] as number[];
          values[i][j] = this.correlation(xValues, yValues, method);
        }
      }
    }

    return {
      columns: numericColumns,
      values,
      method,
    };
  }

  /**
   * Find significant correlations
   */
  findSignificantCorrelations(
    dataFrame: DataFrame,
    threshold = 0.5,
    method: CorrelationMethod = 'pearson'
  ): CorrelationResult[] {
    const matrix = this.correlationMatrix(dataFrame, method);
    const results: CorrelationResult[] = [];

    for (let i = 0; i < matrix.columns.length; i++) {
      for (let j = i + 1; j < matrix.columns.length; j++) {
        const coefficient = matrix.values[i][j];
        if (!isNaN(coefficient) && Math.abs(coefficient) >= threshold) {
          results.push({
            column1: matrix.columns[i],
            column2: matrix.columns[j],
            coefficient,
            strength: this.getCorrelationStrength(coefficient),
          });
        }
      }
    }

    return results.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
  }

  /**
   * Detect outliers using IQR method
   */
  detectOutliersIQR(values: number[], multiplier = 1.5): OutlierResult {
    const validValues = values
      .map((v, i) => ({ value: v, index: i }))
      .filter((v) => typeof v.value === 'number' && !isNaN(v.value));

    const nums = validValues.map((v) => v.value);
    const sorted = [...nums].sort((a, b) => a - b);

    const q1 = ss.quantile(sorted, 0.25);
    const q3 = ss.quantile(sorted, 0.75);
    const iqr = q3 - q1;

    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;

    const outliers = validValues
      .filter((v) => v.value < lowerBound || v.value > upperBound)
      .map((v) => ({
        index: v.index,
        value: v.value,
        score: v.value < lowerBound
          ? (lowerBound - v.value) / iqr
          : (v.value - upperBound) / iqr,
      }));

    return {
      column: '',
      method: 'iqr',
      outliers,
      lowerBound,
      upperBound,
    };
  }

  /**
   * Detect outliers using Z-score method
   */
  detectOutliersZScore(values: number[], threshold = 3): OutlierResult {
    const validValues = values
      .map((v, i) => ({ value: v, index: i }))
      .filter((v) => typeof v.value === 'number' && !isNaN(v.value));

    const nums = validValues.map((v) => v.value);
    const mean = ss.mean(nums);
    const std = ss.standardDeviation(nums);

    const outliers = validValues
      .filter((v) => Math.abs((v.value - mean) / std) > threshold)
      .map((v) => ({
        index: v.index,
        value: v.value,
        score: Math.abs((v.value - mean) / std),
      }));

    return {
      column: '',
      method: 'zscore',
      outliers,
      lowerBound: mean - threshold * std,
      upperBound: mean + threshold * std,
    };
  }

  /**
   * Detect outliers in a column
   */
  detectOutliers(
    values: number[],
    method: OutlierMethod = 'iqr'
  ): OutlierResult {
    switch (method) {
      case 'iqr':
        return this.detectOutliersIQR(values);
      case 'zscore':
        return this.detectOutliersZScore(values);
      case 'modified_zscore':
        return this.detectOutliersModifiedZScore(values);
      default:
        return this.detectOutliersIQR(values);
    }
  }

  /**
   * Detect outliers using Modified Z-score (MAD-based)
   */
  private detectOutliersModifiedZScore(values: number[], threshold = 3.5): OutlierResult {
    const validValues = values
      .map((v, i) => ({ value: v, index: i }))
      .filter((v) => typeof v.value === 'number' && !isNaN(v.value));

    const nums = validValues.map((v) => v.value);
    const median = ss.median(nums);
    const mad = ss.medianAbsoluteDeviation(nums);

    // Modified Z-score = 0.6745 * (x - median) / MAD
    const k = 0.6745;

    const outliers = validValues
      .filter((v) => Math.abs(k * (v.value - median) / mad) > threshold)
      .map((v) => ({
        index: v.index,
        value: v.value,
        score: Math.abs(k * (v.value - median) / mad),
      }));

    return {
      column: '',
      method: 'modified_zscore',
      outliers,
      lowerBound: median - (threshold * mad) / k,
      upperBound: median + (threshold * mad) / k,
    };
  }

  /**
   * Analyze trend in a time series
   */
  analyzeTrend(values: number[]): TrendAnalysis {
    const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

    if (validValues.length < 3) {
      return {
        column: '',
        trend: 'stable',
        slope: 0,
        rSquared: 0,
      };
    }

    // Simple linear regression with index as x
    const x = validValues.map((_, i) => i);
    const regression = ss.linearRegression(x.map((xi, i) => [xi, validValues[i]]));
    const regressionLine = ss.linearRegressionLine(regression);
    const rSquared = ss.rSquared(
      x.map((xi, i) => [xi, validValues[i]]),
      regressionLine
    );

    const slope = regression.m;

    // Determine trend direction
    let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    if (Math.abs(slope) < 0.01 * ss.mean(validValues)) {
      trend = 'stable';
    } else if (rSquared < 0.3) {
      trend = 'volatile';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      column: '',
      trend,
      slope,
      rSquared,
    };
  }

  /**
   * Group by and aggregate
   */
  groupBy(
    dataFrame: DataFrame,
    groupColumn: string,
    aggregations: { column: string; operation: AggregationOperation }[]
  ): GroupByResult {
    const groupValues = dataFrame.data[groupColumn];
    if (!groupValues) {
      throw new Error(`Column not found: ${groupColumn}`);
    }

    // Group indices by value
    const groups = new Map<unknown, number[]>();
    for (let i = 0; i < groupValues.length; i++) {
      const value = groupValues[i];
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(i);
    }

    // Calculate aggregations for each group
    const groupStats: GroupStats[] = [];

    for (const [groupValue, indices] of groups) {
      const aggregationResults: Record<string, { column: string; operation: AggregationOperation; value: number }> = {};

      for (const { column, operation } of aggregations) {
        const columnValues = dataFrame.data[column];
        if (!columnValues) continue;

        const groupColumnValues = indices
          .map((i) => columnValues[i])
          .filter((v) => typeof v === 'number') as number[];

        let value: number;
        switch (operation) {
          case 'sum':
            value = ss.sum(groupColumnValues);
            break;
          case 'mean':
            value = ss.mean(groupColumnValues);
            break;
          case 'median':
            value = ss.median(groupColumnValues);
            break;
          case 'min':
            value = ss.min(groupColumnValues);
            break;
          case 'max':
            value = ss.max(groupColumnValues);
            break;
          case 'count':
            value = groupColumnValues.length;
            break;
          case 'std':
            value = ss.standardDeviation(groupColumnValues);
            break;
          default:
            value = NaN;
        }

        aggregationResults[`${column}_${operation}`] = {
          column,
          operation,
          value,
        };
      }

      groupStats.push({
        groupValue,
        count: indices.length,
        aggregations: aggregationResults,
      });
    }

    return {
      groupColumn,
      groups: groupStats,
    };
  }

  /**
   * Calculate percentiles
   */
  percentiles(values: number[], percentileList = [10, 25, 50, 75, 90]): Record<number, number> {
    const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));
    const sorted = [...validValues].sort((a, b) => a - b);

    const result: Record<number, number> = {};
    for (const p of percentileList) {
      result[p] = ss.quantile(sorted, p / 100);
    }

    return result;
  }

  /**
   * Calculate distribution histogram
   */
  histogram(values: number[], bins = 10): { binEdges: number[]; counts: number[] } {
    const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

    if (validValues.length === 0) {
      return { binEdges: [], counts: [] };
    }

    const min = ss.min(validValues);
    const max = ss.max(validValues);
    const binWidth = (max - min) / bins;

    const binEdges: number[] = [];
    const counts: number[] = new Array(bins).fill(0);

    for (let i = 0; i <= bins; i++) {
      binEdges.push(min + i * binWidth);
    }

    for (const value of validValues) {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex === bins) binIndex = bins - 1; // Include max in last bin
      counts[binIndex]++;
    }

    return { binEdges, counts };
  }

  /**
   * Calculate growth rate between periods
   */
  growthRate(values: number[]): { absolute: number; relative: number; cagr?: number } {
    const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

    if (validValues.length < 2) {
      return { absolute: 0, relative: 0 };
    }

    const first = validValues[0];
    const last = validValues[validValues.length - 1];

    const absolute = last - first;
    const relative = first !== 0 ? (last - first) / first : 0;

    // CAGR for more than 2 periods
    let cagr: number | undefined;
    if (validValues.length > 2 && first > 0 && last > 0) {
      const periods = validValues.length - 1;
      cagr = Math.pow(last / first, 1 / periods) - 1;
    }

    return { absolute, relative, cagr };
  }
}

/**
 * Default instance
 */
export const statisticsService = new StatisticsService();
