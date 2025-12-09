/**
 * ChartGeneratorService - Generate chart configurations for ECharts
 *
 * Features:
 * - Generate ECharts option objects
 * - Multiple chart types (bar, line, pie, scatter, etc.)
 * - Theme support
 * - HTML preview generation
 * - Data-driven chart creation
 */

import { writeFileSync } from 'node:fs';
import type { DataFrame } from '../../types/data.js';
import type {
  ChartConfig,
  ChartData,
  ChartDataPoint,
  ChartOptions,
  ChartSeries,
  ChartTheme,
  ChartType,
  EChartsOption,
} from '../../types/chart.js';

/**
 * Default color palette (inspired by Tufte/professional style)
 */
const DEFAULT_COLORS = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
];

/**
 * Default theme
 */
const DEFAULT_THEME: ChartTheme = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  colors: DEFAULT_COLORS,
  fontFamily: 'Arial, sans-serif',
  fontSize: 12,
};

/**
 * Service for generating charts
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
   * Generate ECharts option from ChartConfig
   */
  generateOption(config: ChartConfig): EChartsOption {
    const theme = { ...this.theme, ...config.theme };
    const options = config.options || {};

    const baseOption: EChartsOption = {
      backgroundColor: theme.backgroundColor,
      textStyle: {
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize,
        color: theme.textColor,
      },
      color: theme.colors,
      animation: options.animation !== false,
    };

    // Add title
    if (config.title) {
      baseOption.title = {
        text: config.title.text,
        subtext: config.title.subtext,
        left: config.title.left || 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.textColor,
        },
        subtextStyle: {
          fontSize: 12,
          color: theme.textColor,
        },
      };
    }

    // Add tooltip
    if (options.showTooltip !== false) {
      baseOption.tooltip = this.buildTooltip(config.type, options);
    }

    // Add legend
    if (options.showLegend !== false && config.data.series.length > 1) {
      baseOption.legend = this.buildLegend(config.data.series, options);
    }

    // Build chart-specific options
    switch (config.type) {
      case 'bar':
      case 'barH':
        return this.buildBarChart(baseOption, config);
      case 'line':
      case 'area':
        return this.buildLineChart(baseOption, config);
      case 'pie':
      case 'doughnut':
        return this.buildPieChart(baseOption, config);
      case 'scatter':
      case 'bubble':
        return this.buildScatterChart(baseOption, config);
      case 'radar':
        return this.buildRadarChart(baseOption, config);
      case 'heatmap':
        return this.buildHeatmapChart(baseOption, config);
      case 'funnel':
        return this.buildFunnelChart(baseOption, config);
      case 'gauge':
        return this.buildGaugeChart(baseOption, config);
      case 'treemap':
        return this.buildTreemapChart(baseOption, config);
      default:
        return this.buildBarChart(baseOption, config);
    }
  }

  /**
   * Build tooltip configuration
   */
  private buildTooltip(type: ChartType, options: ChartOptions): Record<string, unknown> {
    const isPie = type === 'pie' || type === 'doughnut';
    const isScatter = type === 'scatter' || type === 'bubble';

    return {
      trigger: isPie ? 'item' : isScatter ? 'item' : 'axis',
      axisPointer: {
        type: type === 'bar' || type === 'barH' ? 'shadow' : 'cross',
      },
    };
  }

  /**
   * Build legend configuration
   */
  private buildLegend(series: ChartSeries[], options: ChartOptions): Record<string, unknown> {
    const position = options.legendPosition || 'top';
    const orient = position === 'left' || position === 'right' ? 'vertical' : 'horizontal';

    const positionProps: Record<string, string | number> = {};
    switch (position) {
      case 'top':
        positionProps.top = 30;
        positionProps.left = 'center';
        break;
      case 'bottom':
        positionProps.bottom = 10;
        positionProps.left = 'center';
        break;
      case 'left':
        positionProps.left = 10;
        positionProps.top = 'middle';
        break;
      case 'right':
        positionProps.right = 10;
        positionProps.top = 'middle';
        break;
    }

    return {
      show: true,
      data: series.map((s) => s.name),
      orient,
      ...positionProps,
    };
  }

  /**
   * Build bar chart
   */
  private buildBarChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const options = config.options || {};
    const isHorizontal = config.type === 'barH';

    const categoryAxis = {
      type: 'category' as const,
      data: config.data.categories || [],
      name: isHorizontal ? options.yAxisTitle : options.xAxisTitle,
      axisLine: { show: true },
      axisTick: { show: false },
      splitLine: { show: false },
    };

    const valueAxis = {
      type: 'value' as const,
      name: isHorizontal ? options.xAxisTitle : options.yAxisTitle,
      min: options.yAxisMin,
      max: options.yAxisMax,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: options.showGrid !== false,
        lineStyle: {
          type: options.gridStyle === 'dashed' ? 'dashed' : 'solid',
          color: '#e0e0e0',
        },
      },
    };

    return {
      ...baseOption,
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: config.title ? '15%' : '10%',
        containLabel: true,
      },
      xAxis: isHorizontal ? valueAxis : categoryAxis,
      yAxis: isHorizontal ? categoryAxis : valueAxis,
      series: config.data.series.map((s, index) => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        stack: s.stack,
        barWidth: options.barWidth,
        itemStyle: {
          color: s.color || this.theme.colors?.[index % (this.theme.colors?.length || 1)],
        },
        label: options.showLabels
          ? {
              show: true,
              position: isHorizontal ? 'right' : options.labelPosition || 'top',
            }
          : undefined,
      })),
    };
  }

  /**
   * Build line/area chart
   */
  private buildLineChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const options = config.options || {};
    const isArea = config.type === 'area';

    return {
      ...baseOption,
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: config.title ? '15%' : '10%',
        containLabel: true,
      },
      xAxis: {
        type: options.xAxisType || 'category',
        data: config.data.categories || [],
        name: options.xAxisTitle,
        boundaryGap: false,
        axisLine: { show: true },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: options.yAxisTitle,
        min: options.yAxisMin,
        max: options.yAxisMax,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: options.showGrid !== false,
          lineStyle: {
            type: options.gridStyle === 'dashed' ? 'dashed' : 'solid',
            color: '#e0e0e0',
          },
        },
      },
      series: config.data.series.map((s, index) => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: options.smooth || false,
        areaStyle: isArea
          ? {
              opacity: options.areaOpacity ?? 0.3,
            }
          : undefined,
        itemStyle: {
          color: s.color || this.theme.colors?.[index % (this.theme.colors?.length || 1)],
        },
        label: options.showLabels
          ? {
              show: true,
              position: options.labelPosition || 'top',
            }
          : undefined,
      })),
    };
  }

  /**
   * Build pie/doughnut chart
   */
  private buildPieChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const options = config.options || {};
    const isDoughnut = config.type === 'doughnut';
    const radius = options.radius || (isDoughnut ? ['40%', '70%'] : ['0%', '70%']);

    // Convert series data to pie format
    const pieData = config.data.series[0]?.data.map((d, i) => {
      if (typeof d === 'number') {
        return {
          value: d,
          name: config.data.categories?.[i] || `Item ${i + 1}`,
        };
      }
      return d as ChartDataPoint;
    }) || [];

    return {
      ...baseOption,
      legend: {
        ...baseOption.legend,
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: config.data.series[0]?.name || 'Data',
          type: 'pie',
          radius,
          center: ['60%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: options.showLabels !== false,
            formatter: options.showPercent
              ? '{b}: {d}%'
              : '{b}: {c}',
          },
        },
      ],
    };
  }

  /**
   * Build scatter/bubble chart
   */
  private buildScatterChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const options = config.options || {};
    const isBubble = config.type === 'bubble';

    return {
      ...baseOption,
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: config.title ? '15%' : '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: options.xAxisTitle,
        min: options.yAxisMin,
        axisLine: { show: true },
        splitLine: {
          show: options.showGrid !== false,
          lineStyle: { type: 'dashed', color: '#e0e0e0' },
        },
      },
      yAxis: {
        type: 'value',
        name: options.yAxisTitle,
        min: options.yAxisMin,
        max: options.yAxisMax,
        axisLine: { show: true },
        splitLine: {
          show: options.showGrid !== false,
          lineStyle: { type: 'dashed', color: '#e0e0e0' },
        },
      },
      series: config.data.series.map((s, index) => ({
        name: s.name,
        type: 'scatter',
        data: s.data,
        symbolSize: isBubble
          ? (data: number[]) => Math.sqrt(data[2] || 10) * 2
          : 10,
        itemStyle: {
          color: s.color || this.theme.colors?.[index % (this.theme.colors?.length || 1)],
        },
      })),
    };
  }

  /**
   * Build radar chart
   */
  private buildRadarChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const indicators = config.data.categories?.map((name) => ({ name, max: 100 })) || [];

    return {
      ...baseOption,
      radar: {
        indicator: indicators,
        shape: 'polygon',
        center: ['50%', '55%'],
        radius: '65%',
      },
      series: [
        {
          type: 'radar',
          data: config.data.series.map((s, index) => ({
            name: s.name,
            value: s.data as number[],
            itemStyle: {
              color: s.color || this.theme.colors?.[index % (this.theme.colors?.length || 1)],
            },
            areaStyle: {
              opacity: 0.1,
            },
          })),
        },
      ],
    };
  }

  /**
   * Build heatmap chart
   */
  private buildHeatmapChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const options = config.options || {};

    return {
      ...baseOption,
      grid: {
        left: '10%',
        right: '15%',
        bottom: '15%',
        top: config.title ? '15%' : '10%',
      },
      xAxis: {
        type: 'category',
        data: config.data.categories || [],
        name: options.xAxisTitle,
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: config.data.series.map((s) => s.name),
        name: options.yAxisTitle,
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#f7fbff', '#08306b'],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: config.data.series.flatMap((s, yi) =>
            (s.data as number[]).map((value, xi) => [xi, yi, value])
          ),
          label: {
            show: options.showLabels || false,
          },
        },
      ],
    };
  }

  /**
   * Build funnel chart
   */
  private buildFunnelChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const funnelData = config.data.series[0]?.data.map((d, i) => {
      if (typeof d === 'number') {
        return {
          value: d,
          name: config.data.categories?.[i] || `Step ${i + 1}`,
        };
      }
      return d as ChartDataPoint;
    }) || [];

    return {
      ...baseOption,
      series: [
        {
          type: 'funnel',
          left: '10%',
          top: config.title ? 60 : 40,
          bottom: 40,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
          },
          data: funnelData,
        },
      ],
    };
  }

  /**
   * Build gauge chart
   */
  private buildGaugeChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const value = config.data.series[0]?.data[0];
    const numValue = typeof value === 'number' ? value : 0;

    return {
      ...baseOption,
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          radius: '80%',
          min: 0,
          max: 100,
          progress: {
            show: true,
            width: 18,
          },
          axisLine: {
            lineStyle: {
              width: 18,
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 14,
          },
          pointer: {
            itemStyle: {
              color: this.theme.colors?.[0] || '#5470c6',
            },
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 24,
            color: 'inherit',
            offsetCenter: [0, '70%'],
          },
          data: [
            {
              value: numValue,
              name: config.data.series[0]?.name || '',
            },
          ],
        },
      ],
    };
  }

  /**
   * Build treemap chart
   */
  private buildTreemapChart(baseOption: EChartsOption, config: ChartConfig): EChartsOption {
    const treemapData = config.data.series[0]?.data.map((d, i) => {
      if (typeof d === 'number') {
        return {
          value: d,
          name: config.data.categories?.[i] || `Item ${i + 1}`,
        };
      }
      return d as ChartDataPoint;
    }) || [];

    return {
      ...baseOption,
      series: [
        {
          type: 'treemap',
          data: treemapData,
          leafDepth: 1,
          label: {
            show: true,
            formatter: '{b}\n{c}',
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#fff',
          },
        },
      ],
    };
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
  ): EChartsOption {
    const categories = dataFrame.data[xColumn]?.map(String) || [];

    const series: ChartSeries[] = yColumns.map((col) => ({
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

    return this.generateOption(config);
  }

  /**
   * Generate HTML preview
   */
  generateHtmlPreview(
    option: EChartsOption,
    width = 800,
    height = 600
  ): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chart Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      font-family: ${this.theme.fontFamily || 'Arial, sans-serif'};
    }
    #chart {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    .info {
      margin-top: 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="chart" style="width: ${width}px; height: ${height}px;"></div>
  <div class="info">
    Generated with Presentation Team - ChartGeneratorService
  </div>
  <script>
    var chart = echarts.init(document.getElementById('chart'));
    var option = ${JSON.stringify(option, null, 2)};
    chart.setOption(option);
    window.addEventListener('resize', function() { chart.resize(); });
  </script>
</body>
</html>`;
  }

  /**
   * Save HTML preview to file
   */
  saveHtmlPreview(
    option: EChartsOption,
    outputPath: string,
    width = 800,
    height = 600
  ): void {
    const html = this.generateHtmlPreview(option, width, height);
    writeFileSync(outputPath, html);
  }

  /**
   * Generate chart configuration JSON
   */
  toJson(option: EChartsOption): string {
    return JSON.stringify(option, null, 2);
  }

  /**
   * Quick chart generators
   */

  barChart(
    categories: string[],
    data: { name: string; values: number[] }[],
    options?: Partial<ChartConfig>
  ): EChartsOption {
    return this.generateOption({
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
  ): EChartsOption {
    return this.generateOption({
      type: 'line',
      data: {
        categories,
        series: data.map((d) => ({ name: d.name, data: d.values })),
      },
      ...options,
    });
  }

  pieChart(
    data: { name: string; value: number }[],
    options?: Partial<ChartConfig>
  ): EChartsOption {
    return this.generateOption({
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
