/**
 * ChartGeneratorService - Generate Vega-Lite specifications for charts
 *
 * Features:
 * - Generate Vega-Lite specs from ChartConfig
 * - Multiple chart types (bar, line, pie, scatter, etc.)
 * - Theme support
 * - Data-driven chart creation from DataFrames
 *
 * Vega-Lite is a declarative grammar for interactive graphics.
 * See: https://vega.github.io/vega-lite/
 */

import { writeFileSync } from 'node:fs';
import type { DataFrame } from '../../types/data.js';
import type {
  ChartConfig,
  ChartDataPoint,
  ChartOptions,
  ChartSeries,
  ChartTheme,
  ChartType,
  VegaLiteConfig,
  VegaLiteSpec,
} from '../../types/chart.js';

/**
 * Default color palette (Tableau 10 - professional and accessible)
 */
const DEFAULT_COLORS = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
];

/**
 * Default theme configuration
 */
const DEFAULT_THEME: ChartTheme = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  colors: DEFAULT_COLORS,
  fontFamily: 'Arial, sans-serif',
  fontSize: 12,
};

/**
 * Service for generating Vega-Lite chart specifications
 */
export class ChartGeneratorService {
  private theme: ChartTheme;

  constructor(theme?: ChartTheme) {
    this.theme = { ...DEFAULT_THEME, ...theme };
  }

  /**
   * Set the theme
   */
  setTheme(theme: Partial<ChartTheme>): void {
    this.theme = { ...this.theme, ...theme };
  }

  /**
   * Generate Vega-Lite spec from ChartConfig
   */
  generateSpec(config: ChartConfig, width?: number, height?: number): VegaLiteSpec {
    const theme = { ...this.theme, ...config.theme };

    // Convert data to Vega-Lite format (array of records)
    const values = this.convertDataToValues(config);

    // Base configuration
    const baseConfig = this.buildConfig(theme);

    // Build spec based on chart type
    switch (config.type) {
      case 'bar':
        return this.buildBarSpec(config, values, theme, baseConfig, width, height);
      case 'barH':
        return this.buildBarHSpec(config, values, theme, baseConfig, width, height);
      case 'line':
        return this.buildLineSpec(config, values, theme, baseConfig, width, height);
      case 'area':
        return this.buildAreaSpec(config, values, theme, baseConfig, width, height);
      case 'pie':
      case 'doughnut':
        return this.buildPieSpec(config, values, theme, baseConfig, width, height);
      case 'scatter':
        return this.buildScatterSpec(config, values, theme, baseConfig, width, height);
      case 'bubble':
        return this.buildBubbleSpec(config, values, theme, baseConfig, width, height);
      case 'heatmap':
        return this.buildHeatmapSpec(config, values, theme, baseConfig, width, height);
      case 'boxplot':
        return this.buildBoxplotSpec(config, values, theme, baseConfig, width, height);
      case 'histogram':
        return this.buildHistogramSpec(config, values, theme, baseConfig, width, height);
      default:
        return this.buildBarSpec(config, values, theme, baseConfig, width, height);
    }
  }

  /**
   * Convert ChartConfig data to Vega-Lite values format
   */
  private convertDataToValues(config: ChartConfig): Record<string, unknown>[] {
    const { categories, series, values } = config.data;

    // If raw values provided, use them directly
    if (values && values.length > 0) {
      return values;
    }

    // Convert series format to flat records
    const result: Record<string, unknown>[] = [];

    if (categories && series.length > 0) {
      for (let i = 0; i < categories.length; i++) {
        for (const s of series) {
          const dataPoint = s.data[i];
          const value = typeof dataPoint === 'number' ? dataPoint : (dataPoint as ChartDataPoint)?.value;
          const pointColor = typeof dataPoint === 'object' ? (dataPoint as ChartDataPoint)?.color : undefined;

          result.push({
            category: categories[i],
            series: s.name,
            value,
            ...(pointColor && { _color: pointColor }),
            ...(s.color && { _seriesColor: s.color }),
          });
        }
      }
    }

    return result;
  }

  /**
   * Build Vega-Lite config from theme
   */
  private buildConfig(theme: ChartTheme): VegaLiteConfig {
    return {
      background: theme.backgroundColor,
      font: theme.fontFamily,
      view: {
        stroke: null, // Remove border around chart
      },
      axis: {
        labelFontSize: theme.fontSize,
        titleFontSize: theme.fontSize ? theme.fontSize + 2 : 14,
        labelColor: theme.textColor,
        titleColor: theme.textColor,
        gridColor: '#e0e0e0',
        gridDash: [2, 2],
        domainColor: '#888888',
      },
      legend: {
        labelFontSize: theme.fontSize,
        titleFontSize: theme.fontSize,
        labelColor: theme.textColor,
        titleColor: theme.textColor,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold' as const,
        color: theme.textColor,
        subtitleFontSize: 12,
        subtitleColor: theme.textColor,
      },
      range: {
        category: theme.colors || DEFAULT_COLORS,
      },
    };
  }

  /**
   * Build base spec with common properties
   */
  private buildBaseSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const spec: VegaLiteSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values },
      config: vegaConfig,
    };

    if (width) spec.width = width;
    if (height) spec.height = height;

    if (config.title) {
      spec.title = {
        text: config.title.text,
        subtitle: config.title.subtitle,
        anchor: config.title.anchor || 'middle',
      };
    }

    return spec;
  }

  /**
   * Build vertical bar chart spec
   */
  private buildBarSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};
    const hasSeries = config.data.series.length > 1;

    const spec = this.buildBaseSpec(config, values, vegaConfig, width, height);

    spec.mark = {
      type: 'bar',
      tooltip: options.showTooltip !== false,
      cornerRadiusTopLeft: options.cornerRadius || 0,
      cornerRadiusTopRight: options.cornerRadius || 0,
    };

    spec.encoding = {
      x: {
        field: 'category',
        type: 'nominal',
        title: options.xAxisTitle || null,
        axis: {
          labelAngle: 0,
          grid: false,
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        title: options.yAxisTitle || null,
        scale: {
          zero: true,
          ...(options.yAxisMin !== undefined && { domainMin: options.yAxisMin }),
          ...(options.yAxisMax !== undefined && { domainMax: options.yAxisMax }),
        },
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (hasSeries) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: this.getLegendOrient(options.legendPosition) },
      };
      spec.encoding.xOffset = { field: 'series' };
    } else if (config.data.series[0]?.color) {
      (spec.mark as Record<string, unknown>).color = config.data.series[0].color;
    }

    if (options.showLabels) {
      return this.addTextLabels(spec, 'top');
    }

    return spec;
  }

  /**
   * Build horizontal bar chart spec
   */
  private buildBarHSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};
    const hasSeries = config.data.series.length > 1;

    const spec = this.buildBaseSpec(config, values, vegaConfig, width, height);

    spec.mark = {
      type: 'bar',
      tooltip: options.showTooltip !== false,
      cornerRadiusTopRight: options.cornerRadius || 0,
      cornerRadiusBottomRight: options.cornerRadius || 0,
    };

    spec.encoding = {
      y: {
        field: 'category',
        type: 'nominal',
        title: options.yAxisTitle || null,
        sort: '-x',
        axis: {
          grid: false,
        },
      },
      x: {
        field: 'value',
        type: 'quantitative',
        title: options.xAxisTitle || null,
        scale: {
          zero: true,
          ...(options.yAxisMin !== undefined && { domainMin: options.yAxisMin }),
          ...(options.yAxisMax !== undefined && { domainMax: options.yAxisMax }),
        },
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (hasSeries) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: this.getLegendOrient(options.legendPosition) },
      };
      spec.encoding.yOffset = { field: 'series' };
    } else if (config.data.series[0]?.color) {
      (spec.mark as Record<string, unknown>).color = config.data.series[0].color;
    }

    return spec;
  }

  /**
   * Build line chart spec
   */
  private buildLineSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};
    const hasSeries = config.data.series.length > 1;

    const spec = this.buildBaseSpec(config, values, vegaConfig, width, height);

    spec.mark = {
      type: 'line',
      tooltip: options.showTooltip !== false,
      strokeWidth: options.strokeWidth || 2,
      point: options.point !== false,
      ...(options.smooth && { interpolate: 'monotone' }),
    };

    spec.encoding = {
      x: {
        field: 'category',
        type: options.xAxisType || 'nominal',
        title: options.xAxisTitle || null,
        axis: {
          grid: false,
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        title: options.yAxisTitle || null,
        scale: {
          zero: false,
          ...(options.yAxisMin !== undefined && { domainMin: options.yAxisMin }),
          ...(options.yAxisMax !== undefined && { domainMax: options.yAxisMax }),
        },
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (hasSeries) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: this.getLegendOrient(options.legendPosition) },
      };
    } else if (config.data.series[0]?.color) {
      (spec.mark as Record<string, unknown>).color = config.data.series[0].color;
    }

    return spec;
  }

  /**
   * Build area chart spec
   */
  private buildAreaSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};
    const hasSeries = config.data.series.length > 1;

    const spec = this.buildBaseSpec(config, values, vegaConfig, width, height);

    spec.mark = {
      type: 'area',
      tooltip: options.showTooltip !== false,
      opacity: options.areaOpacity ?? 0.7,
      line: true,
      ...(options.smooth && { interpolate: 'monotone' }),
    };

    spec.encoding = {
      x: {
        field: 'category',
        type: options.xAxisType || 'nominal',
        title: options.xAxisTitle || null,
        axis: {
          grid: false,
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        title: options.yAxisTitle || null,
        scale: {
          zero: true,
          ...(options.yAxisMin !== undefined && { domainMin: options.yAxisMin }),
          ...(options.yAxisMax !== undefined && { domainMax: options.yAxisMax }),
        },
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (hasSeries) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: this.getLegendOrient(options.legendPosition) },
      };
    } else if (config.data.series[0]?.color) {
      (spec.mark as Record<string, unknown>).color = config.data.series[0].color;
    }

    return spec;
  }

  /**
   * Build pie/doughnut chart spec
   */
  private buildPieSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};
    const isDoughnut = config.type === 'doughnut';

    // For pie charts, we need to restructure the data
    const pieValues = this.convertToPieValues(config);

    const spec = this.buildBaseSpec(config, pieValues, vegaConfig, width, height);

    // Calculate radius based on dimensions
    const minDim = Math.min(width || 400, height || 400);
    const outerRadius = options.outerRadius || minDim / 2 - 20;
    const innerRadius = isDoughnut ? (options.innerRadius || outerRadius * 0.5) : 0;

    spec.mark = {
      type: 'arc',
      tooltip: options.showTooltip !== false,
      innerRadius,
      outerRadius,
    };

    spec.encoding = {
      theta: {
        field: 'value',
        type: 'quantitative',
        stack: true,
      },
      color: {
        field: 'category',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: 'right' },
      },
    };

    if (options.showLabels) {
      // Add labels as a layer
      return {
        ...spec,
        layer: [
          { mark: spec.mark, encoding: spec.encoding },
          {
            mark: { type: 'text', radius: outerRadius + 15 },
            encoding: {
              theta: { field: 'value', type: 'quantitative', stack: true },
              text: { field: 'label', type: 'nominal' },
            },
          },
        ],
        mark: undefined,
        encoding: undefined,
      };
    }

    return spec;
  }

  /**
   * Convert data to pie chart format
   */
  private convertToPieValues(config: ChartConfig): Record<string, unknown>[] {
    const { categories, series } = config.data;
    const values: Record<string, unknown>[] = [];
    const firstSeries = series[0];

    if (firstSeries) {
      for (let i = 0; i < firstSeries.data.length; i++) {
        const dataPoint = firstSeries.data[i];
        const value = typeof dataPoint === 'number' ? dataPoint : (dataPoint as ChartDataPoint)?.value;
        const name = typeof dataPoint === 'object' ? (dataPoint as ChartDataPoint)?.name : undefined;
        const category = name || categories?.[i] || `Item ${i + 1}`;

        values.push({
          category,
          value,
          label: `${category}: ${value}`,
        });
      }
    }

    return values;
  }

  /**
   * Build scatter chart spec
   */
  private buildScatterSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};

    // For scatter plots, we expect data in [{x, y, series?}] format
    const scatterValues = this.convertToScatterValues(config);

    const spec = this.buildBaseSpec(config, scatterValues, vegaConfig, width, height);

    spec.mark = {
      type: 'point',
      tooltip: options.showTooltip !== false,
      filled: true,
      size: 60,
    };

    spec.encoding = {
      x: {
        field: 'x',
        type: 'quantitative',
        title: options.xAxisTitle || null,
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: options.yAxisTitle || null,
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (config.data.series.length > 1) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: this.getLegendOrient(options.legendPosition) },
      };
    }

    return spec;
  }

  /**
   * Build bubble chart spec
   */
  private buildBubbleSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};

    // For bubble plots, we expect data in [{x, y, size, series?}] format
    const bubbleValues = this.convertToScatterValues(config);

    const spec = this.buildBaseSpec(config, bubbleValues, vegaConfig, width, height);

    spec.mark = {
      type: 'point',
      tooltip: options.showTooltip !== false,
      filled: true,
      opacity: 0.7,
    };

    spec.encoding = {
      x: {
        field: 'x',
        type: 'quantitative',
        title: options.xAxisTitle || null,
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: options.yAxisTitle || null,
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
      size: {
        field: 'size',
        type: 'quantitative',
        title: null,
        scale: { range: [50, 1000] },
      },
    };

    if (config.data.series.length > 1) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
        legend: options.showLegend === false ? null : { orient: this.getLegendOrient(options.legendPosition) },
      };
    }

    return spec;
  }

  /**
   * Convert data to scatter/bubble format
   */
  private convertToScatterValues(config: ChartConfig): Record<string, unknown>[] {
    const values: Record<string, unknown>[] = [];

    for (const s of config.data.series) {
      for (const point of s.data) {
        if (Array.isArray(point)) {
          // [x, y] or [x, y, size] format
          values.push({
            x: point[0],
            y: point[1],
            size: point[2] || 10,
            series: s.name,
          });
        } else if (typeof point === 'object' && point !== null) {
          const p = point as Record<string, unknown>;
          values.push({
            x: p.x ?? p.value,
            y: p.y ?? 0,
            size: p.size ?? 10,
            series: s.name,
          });
        }
      }
    }

    return values;
  }

  /**
   * Build heatmap chart spec
   */
  private buildHeatmapSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};

    // Convert to heatmap format
    const heatmapValues = this.convertToHeatmapValues(config);

    const spec = this.buildBaseSpec(config, heatmapValues, vegaConfig, width, height);

    spec.mark = {
      type: 'rect',
      tooltip: options.showTooltip !== false,
    };

    spec.encoding = {
      x: {
        field: 'x',
        type: 'nominal',
        title: options.xAxisTitle || null,
      },
      y: {
        field: 'y',
        type: 'nominal',
        title: options.yAxisTitle || null,
      },
      color: {
        field: 'value',
        type: 'quantitative',
        title: null,
        scale: {
          scheme: 'blues',
        },
        legend: options.showLegend === false ? null : { orient: 'right' },
      },
    };

    if (options.showLabels) {
      return {
        ...spec,
        layer: [
          { mark: spec.mark, encoding: spec.encoding },
          {
            mark: { type: 'text' },
            encoding: {
              x: { field: 'x', type: 'nominal' },
              y: { field: 'y', type: 'nominal' },
              text: { field: 'value', type: 'quantitative' },
              color: {
                condition: { test: 'datum.value > 50', value: 'white' },
                value: 'black',
              },
            },
          },
        ],
        mark: undefined,
        encoding: undefined,
      };
    }

    return spec;
  }

  /**
   * Convert data to heatmap format
   */
  private convertToHeatmapValues(config: ChartConfig): Record<string, unknown>[] {
    const { categories, series } = config.data;
    const values: Record<string, unknown>[] = [];

    for (let yi = 0; yi < series.length; yi++) {
      const s = series[yi];
      for (let xi = 0; xi < s.data.length; xi++) {
        const value = typeof s.data[xi] === 'number' ? s.data[xi] : 0;
        values.push({
          x: categories?.[xi] || `${xi}`,
          y: s.name,
          value,
        });
      }
    }

    return values;
  }

  /**
   * Build boxplot spec
   */
  private buildBoxplotSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};

    const spec = this.buildBaseSpec(config, values, vegaConfig, width, height);

    spec.mark = {
      type: 'boxplot',
      extent: 'min-max',
    };

    spec.encoding = {
      x: {
        field: 'category',
        type: 'nominal',
        title: options.xAxisTitle || null,
      },
      y: {
        field: 'value',
        type: 'quantitative',
        title: options.yAxisTitle || null,
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (config.data.series.length > 1) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
      };
    }

    return spec;
  }

  /**
   * Build histogram spec
   */
  private buildHistogramSpec(
    config: ChartConfig,
    values: Record<string, unknown>[],
    theme: ChartTheme,
    vegaConfig: VegaLiteConfig,
    width?: number,
    height?: number
  ): VegaLiteSpec {
    const options = config.options || {};

    const spec = this.buildBaseSpec(config, values, vegaConfig, width, height);

    spec.mark = {
      type: 'bar',
      tooltip: options.showTooltip !== false,
    };

    spec.encoding = {
      x: {
        field: 'value',
        type: 'quantitative',
        bin: true,
        title: options.xAxisTitle || null,
      },
      y: {
        aggregate: 'count',
        type: 'quantitative',
        title: options.yAxisTitle || 'Count',
        axis: {
          grid: options.showGrid !== false,
          gridDash: [2, 2],
        },
      },
    };

    if (config.data.series.length > 1) {
      spec.encoding.color = {
        field: 'series',
        type: 'nominal',
        title: null,
      };
    }

    return spec;
  }

  /**
   * Add text labels to chart as a layer
   */
  private addTextLabels(spec: VegaLiteSpec, position: 'top' | 'center' = 'top'): VegaLiteSpec {
    const textMark = {
      type: 'text',
      dy: position === 'top' ? -10 : 0,
    };

    const textEncoding = {
      x: spec.encoding?.x,
      y: spec.encoding?.y,
      text: { field: 'value', type: 'quantitative' },
      ...(spec.encoding?.color && { color: spec.encoding.color }),
    };

    return {
      ...spec,
      layer: [
        { mark: spec.mark, encoding: spec.encoding },
        { mark: textMark, encoding: textEncoding },
      ],
      mark: undefined,
      encoding: undefined,
    };
  }

  /**
   * Get Vega-Lite legend orient from position
   */
  private getLegendOrient(position?: 'top' | 'bottom' | 'left' | 'right'): string {
    switch (position) {
      case 'top':
        return 'top';
      case 'bottom':
        return 'bottom';
      case 'left':
        return 'left';
      case 'right':
      default:
        return 'right';
    }
  }

  /**
   * Create chart from DataFrame
   */
  fromDataFrame(
    dataFrame: DataFrame,
    type: ChartType,
    xColumn: string,
    yColumns: string[],
    options?: ChartOptions
  ): VegaLiteSpec {
    const categories = dataFrame.data[xColumn]?.map(String) || [];

    const series = yColumns.map((col) => ({
      name: col,
      data: (dataFrame.data[col] || []).map((v) =>
        typeof v === 'number' ? v : parseFloat(String(v)) || 0
      ),
    }));

    const config: ChartConfig = {
      type,
      data: {
        categories,
        series,
      },
      options,
    };

    return this.generateSpec(config);
  }

  /**
   * Generate spec JSON string
   */
  toJson(spec: VegaLiteSpec): string {
    return JSON.stringify(spec, null, 2);
  }

  /**
   * Save spec to JSON file
   */
  saveSpec(spec: VegaLiteSpec, outputPath: string): void {
    writeFileSync(outputPath, this.toJson(spec));
  }

  /**
   * Quick chart generators
   */

  barChart(
    categories: string[],
    data: { name: string; values: number[] }[],
    options?: Partial<ChartConfig>
  ): VegaLiteSpec {
    return this.generateSpec({
      type: 'bar',
      data: {
        categories,
        series: data.map((d) => ({ name: d.name, data: d.values })),
      },
      ...options,
    });
  }

  lineChart(
    categories: string[],
    data: { name: string; values: number[] }[],
    options?: Partial<ChartConfig>
  ): VegaLiteSpec {
    return this.generateSpec({
      type: 'line',
      data: {
        categories,
        series: data.map((d) => ({ name: d.name, data: d.values })),
      },
      ...options,
    });
  }

  pieChart(data: { name: string; value: number }[], options?: Partial<ChartConfig>): VegaLiteSpec {
    return this.generateSpec({
      type: 'pie',
      data: {
        categories: data.map((d) => d.name),
        series: [{ name: 'Data', data: data.map((d) => d.value) }],
      },
      ...options,
    });
  }
}

/**
 * Default instance
 */
export const chartGeneratorService = new ChartGeneratorService();
