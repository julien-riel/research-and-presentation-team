/**
 * Types for chart generation
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
  | 'radar'
  | 'heatmap'
  | 'funnel'
  | 'gauge'
  | 'treemap';

export interface ChartConfig {
  type: ChartType;
  title?: ChartTitle;
  data: ChartData;
  options?: ChartOptions;
  theme?: ChartTheme;
}

export interface ChartTitle {
  text: string;
  subtext?: string;
  left?: 'left' | 'center' | 'right';
}

export interface ChartData {
  categories?: string[];
  series: ChartSeries[];
}

export interface ChartSeries {
  name: string;
  type?: ChartType;
  data: (number | ChartDataPoint)[];
  color?: string;
  stack?: string;
}

export interface ChartDataPoint {
  value: number;
  name?: string;
  itemStyle?: {
    color?: string;
  };
}

export interface ChartOptions {
  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Axis
  xAxisTitle?: string;
  yAxisTitle?: string;
  xAxisType?: 'category' | 'value' | 'time';
  yAxisType?: 'category' | 'value';
  yAxisMin?: number;
  yAxisMax?: number;

  // Grid
  showGrid?: boolean;
  gridStyle?: 'solid' | 'dashed' | 'dotted' | 'none';

  // Labels
  showLabels?: boolean;
  labelPosition?: 'top' | 'inside' | 'outside';
  showPercent?: boolean;

  // Animation
  animation?: boolean;

  // Tooltip
  showTooltip?: boolean;

  // Specific options
  smooth?: boolean; // for line charts
  areaOpacity?: number; // for area charts
  barWidth?: string | number;
  radius?: [string, string]; // for pie/doughnut
}

export interface ChartTheme {
  backgroundColor?: string;
  textColor?: string;
  colors?: string[];
  fontFamily?: string;
  fontSize?: number;
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
 * ECharts option type - permissive to allow all ECharts configurations
 * See https://echarts.apache.org/en/option.html for full documentation
 */
export interface EChartsOption {
  title?: Record<string, unknown>;
  tooltip?: Record<string, unknown>;
  legend?: Record<string, unknown>;
  grid?: Record<string, unknown>;
  xAxis?: Record<string, unknown>;
  yAxis?: Record<string, unknown>;
  series?: Array<Record<string, unknown>>;
  radar?: Record<string, unknown>;
  visualMap?: Record<string, unknown>;
  backgroundColor?: string;
  textStyle?: Record<string, unknown>;
  color?: string[];
  animation?: boolean;
  [key: string]: unknown;
}
