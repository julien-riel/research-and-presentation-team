/**
 * Types for data analysis
 */

export interface DescriptiveStats {
  column: string;
  count: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  nullCount: number;
  nullPercent: number;
}

export interface CorrelationMatrix {
  columns: string[];
  values: number[][];
  method: CorrelationMethod;
}

export type CorrelationMethod = 'pearson' | 'spearman' | 'kendall';

export interface CorrelationResult {
  column1: string;
  column2: string;
  coefficient: number;
  pValue?: number;
  strength: CorrelationStrength;
}

export type CorrelationStrength =
  | 'negligible'
  | 'weak'
  | 'moderate'
  | 'strong'
  | 'very_strong';

export interface TrendAnalysis {
  column: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  rSquared: number;
  seasonality?: SeasonalityResult;
}

export interface SeasonalityResult {
  detected: boolean;
  period?: number;
  strength?: number;
}

export interface OutlierResult {
  column: string;
  method: OutlierMethod;
  outliers: OutlierPoint[];
  lowerBound: number;
  upperBound: number;
}

export type OutlierMethod = 'iqr' | 'zscore' | 'modified_zscore';

export interface OutlierPoint {
  index: number;
  value: number;
  score: number;
}

export interface GroupByResult {
  groupColumn: string;
  groups: GroupStats[];
}

export interface GroupStats {
  groupValue: unknown;
  count: number;
  aggregations: Record<string, AggregationResult>;
}

export interface AggregationResult {
  column: string;
  operation: AggregationOperation;
  value: number;
}

export type AggregationOperation =
  | 'sum'
  | 'mean'
  | 'median'
  | 'min'
  | 'max'
  | 'count'
  | 'std';

export interface TimeSeriesAnalysis {
  dateColumn: string;
  valueColumn: string;
  trend: TrendComponent;
  seasonality?: SeasonalComponent;
  growth: GrowthMetrics;
}

export interface TrendComponent {
  direction: 'up' | 'down' | 'flat';
  slope: number;
  values: number[];
}

export interface SeasonalComponent {
  period: number;
  indices: number[];
}

export interface GrowthMetrics {
  absoluteGrowth: number;
  relativeGrowth: number;
  cagr?: number;
  yoyGrowth?: number[];
}

export interface AnalysisReport {
  summary: string;
  findings: Finding[];
  recommendations: string[];
  limitations: string[];
}

export interface Finding {
  title: string;
  observation: string;
  quantification: string;
  significance?: string;
  implications: string;
}
