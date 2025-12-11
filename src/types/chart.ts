/**
 * Types for chart generation using Vega-Lite
 *
 * Vega-Lite is a high-level grammar of interactive graphics.
 * These types provide a simplified interface while allowing full Vega-Lite spec access.
 */

/**
 * Supported chart types (mapped to Vega-Lite marks)
 */
export type ChartType =
  | 'bar'
  | 'barH'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'boxplot'
  | 'histogram';

/**
 * Simplified chart configuration for common use cases
 */
export interface ChartConfig {
  type: ChartType;
  title?: ChartTitle;
  data: ChartData;
  options?: ChartOptions;
  theme?: ChartTheme;
}

export interface ChartTitle {
  text: string;
  subtitle?: string;
  anchor?: 'start' | 'middle' | 'end';
}

export interface ChartData {
  /** Column names for categories (x-axis for most charts) */
  categories?: string[];
  /** Data series */
  series: ChartSeries[];
  /** Raw tabular data (alternative to categories + series) */
  values?: Record<string, unknown>[];
}

export interface ChartSeries {
  name: string;
  data: (number | ChartDataPoint)[];
  color?: string;
  /** For stacked charts */
  stack?: string;
}

export interface ChartDataPoint {
  value: number;
  name?: string;
  color?: string;
}

export interface ChartOptions {
  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Axis
  xAxisTitle?: string;
  yAxisTitle?: string;
  xAxisType?: 'nominal' | 'ordinal' | 'quantitative' | 'temporal';
  yAxisType?: 'nominal' | 'ordinal' | 'quantitative' | 'temporal';
  yAxisMin?: number;
  yAxisMax?: number;

  // Grid
  showGrid?: boolean;

  // Labels
  showLabels?: boolean;
  labelFormat?: string;

  // Animation (Vega-Lite doesn't animate by default)
  animation?: boolean;

  // Tooltip
  showTooltip?: boolean;

  // Line chart options
  smooth?: boolean;
  strokeWidth?: number;
  point?: boolean;

  // Area chart options
  areaOpacity?: number;

  // Bar chart options
  barWidth?: number;
  cornerRadius?: number;

  // Pie/Doughnut options
  innerRadius?: number;
  outerRadius?: number;
}

export interface ChartTheme {
  backgroundColor?: string;
  textColor?: string;
  colors?: string[];
  fontFamily?: string;
  fontSize?: number;
  /** Vega-Lite theme name: 'default', 'dark', 'excel', 'fivethirtyeight', 'ggplot2', 'quartz', 'vox', 'urbaninstitute' */
  vegaTheme?: string;
}

export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf';
  width: number;
  height: number;
  scale?: number;
  backgroundColor?: string;
}

export interface ChartRenderResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Vega-Lite Specification Type
 * This is a permissive type that allows any valid Vega-Lite spec.
 * See https://vega.github.io/vega-lite/docs/ for full documentation.
 */
export interface VegaLiteSpec {
  $schema?: string;
  title?: string | { text: string; subtitle?: string; anchor?: string };
  description?: string;
  width?: number | 'container';
  height?: number | 'container';
  autosize?: { type: string; contains?: string; resize?: boolean } | string;
  padding?: number | { left: number; right: number; top: number; bottom: number };
  background?: string;
  data?: {
    values?: Record<string, unknown>[];
    url?: string;
    format?: Record<string, unknown>;
    name?: string;
  };
  mark?:
    | string
    | {
        type: string;
        tooltip?: boolean | Record<string, unknown>;
        color?: string;
        opacity?: number;
        filled?: boolean;
        stroke?: string;
        strokeWidth?: number;
        cornerRadius?: number;
        innerRadius?: number;
        outerRadius?: number;
        interpolate?: string;
        point?: boolean | Record<string, unknown>;
        [key: string]: unknown;
      };
  encoding?: {
    x?: VegaLiteEncoding;
    y?: VegaLiteEncoding;
    color?: VegaLiteEncoding;
    size?: VegaLiteEncoding;
    shape?: VegaLiteEncoding;
    theta?: VegaLiteEncoding;
    radius?: VegaLiteEncoding;
    text?: VegaLiteEncoding;
    tooltip?: VegaLiteEncoding | VegaLiteEncoding[];
    order?: VegaLiteEncoding;
    [key: string]: unknown;
  };
  layer?: VegaLiteSpec[];
  concat?: VegaLiteSpec[];
  hconcat?: VegaLiteSpec[];
  vconcat?: VegaLiteSpec[];
  facet?: Record<string, unknown>;
  repeat?: Record<string, unknown>;
  resolve?: Record<string, unknown>;
  selection?: Record<string, unknown>;
  params?: Record<string, unknown>[];
  transform?: Record<string, unknown>[];
  config?: VegaLiteConfig;
  [key: string]: unknown;
}

export interface VegaLiteEncoding {
  field?: string;
  type?: 'quantitative' | 'ordinal' | 'nominal' | 'temporal';
  aggregate?: string;
  bin?: boolean | Record<string, unknown>;
  timeUnit?: string;
  title?: string | null;
  scale?: {
    domain?: unknown[];
    range?: unknown[];
    type?: string;
    zero?: boolean;
    nice?: boolean;
    padding?: number;
    [key: string]: unknown;
  };
  axis?: {
    title?: string | null;
    grid?: boolean;
    gridDash?: number[];
    gridColor?: string;
    gridOpacity?: number;
    labels?: boolean;
    labelAngle?: number;
    labelFontSize?: number;
    tickCount?: number;
    format?: string;
    [key: string]: unknown;
  } | null;
  legend?: {
    title?: string | null;
    orient?: string;
    direction?: string;
    [key: string]: unknown;
  } | null;
  sort?: string | string[] | Record<string, unknown> | null;
  value?: unknown;
  condition?: Record<string, unknown> | Record<string, unknown>[];
  [key: string]: unknown;
}

export interface VegaLiteConfig {
  view?: { stroke?: string | null; continuousWidth?: number; continuousHeight?: number };
  background?: string;
  font?: string;
  title?: Record<string, unknown>;
  axis?: Record<string, unknown>;
  axisX?: Record<string, unknown>;
  axisY?: Record<string, unknown>;
  legend?: Record<string, unknown>;
  mark?: Record<string, unknown>;
  bar?: Record<string, unknown>;
  line?: Record<string, unknown>;
  area?: Record<string, unknown>;
  point?: Record<string, unknown>;
  arc?: Record<string, unknown>;
  range?: { category?: string[]; [key: string]: unknown };
  [key: string]: unknown;
}
