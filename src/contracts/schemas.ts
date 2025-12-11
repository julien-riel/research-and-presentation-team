/**
 * Runtime validation schemas using Zod
 *
 * These schemas validate data contracts between skills at runtime,
 * ensuring type safety at system boundaries.
 */

import { z } from 'zod';

// =============================================================================
// DATA SCHEMAS (data-reader output)
// =============================================================================

export const DataTypeSchema = z.enum([
  'string',
  'number',
  'integer',
  'float',
  'boolean',
  'date',
  'datetime',
  'currency',
  'percent',
  'category',
  'mixed',
]);

export const FileFormatSchema = z.enum(['xlsx', 'xls', 'csv', 'tsv', 'json']);

export const ColumnSchemaSchema = z.object({
  name: z.string().min(1),
  type: DataTypeSchema,
  nullable: z.boolean(),
  unique: z.number().int().nonnegative(),
  nullCount: z.number().int().nonnegative(),
  examples: z.array(z.unknown()),
});

export const DataSchemaSchema = z.object({
  columns: z.array(ColumnSchemaSchema).min(1),
  rowCount: z.number().int().nonnegative(),
  fileSize: z.number().nonnegative(),
  format: FileFormatSchema,
});

export const DataQualityIssueSchema = z.object({
  column: z.string(),
  type: z.enum(['null', 'duplicate', 'invalid', 'outlier', 'mixed_type']),
  severity: z.enum(['warning', 'error']),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  message: z.string(),
});

export const DataQualityReportSchema = z.object({
  completeness: z.number().min(0).max(1),
  uniqueness: z.number().min(0).max(1),
  validity: z.number().min(0).max(1),
  consistency: z.number().min(0).max(1),
  issues: z.array(DataQualityIssueSchema),
});

export const DataFrameSchema = z.object({
  columns: z.array(z.string()).min(1),
  data: z.record(z.string(), z.array(z.unknown())),
  rowCount: z.number().int().nonnegative(),
});

export const DataPreviewSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.unknown())),
  totalRows: z.number().int().nonnegative(),
  previewRows: z.number().int().nonnegative(),
});

export const ReadOptionsSchema = z.object({
  sheet: z.string().optional(),
  delimiter: z.string().optional(),
  encoding: z.string().optional(),
  headerRow: z.number().int().nonnegative().optional(),
  skipRows: z.number().int().nonnegative().optional(),
  maxRows: z.number().int().positive().optional(),
  dateFormat: z.string().optional(),
  decimalSeparator: z.string().optional(),
});

/**
 * Full output contract for data-reader → data-analyst
 */
export const ReadResultSchema = z.object({
  dataFrame: DataFrameSchema,
  schema: DataSchemaSchema,
  quality: DataQualityReportSchema,
  preview: DataPreviewSchema.optional(),
});

// =============================================================================
// ANALYSIS SCHEMAS (data-analyst output)
// =============================================================================

export const CorrelationMethodSchema = z.enum(['pearson', 'spearman', 'kendall']);

export const CorrelationStrengthSchema = z.enum([
  'negligible',
  'weak',
  'moderate',
  'strong',
  'very_strong',
]);

export const DescriptiveStatsSchema = z.object({
  column: z.string(),
  count: z.number().int().nonnegative(),
  mean: z.number(),
  median: z.number(),
  std: z.number().nonnegative(),
  min: z.number(),
  max: z.number(),
  q1: z.number(),
  q3: z.number(),
  iqr: z.number().nonnegative(),
  skewness: z.number(),
  kurtosis: z.number(),
  nullCount: z.number().int().nonnegative(),
  nullPercent: z.number().min(0).max(100),
});

export const CorrelationMatrixSchema = z.object({
  columns: z.array(z.string()),
  values: z.array(z.array(z.number().min(-1).max(1))),
  method: CorrelationMethodSchema,
});

export const CorrelationResultSchema = z.object({
  column1: z.string(),
  column2: z.string(),
  coefficient: z.number().min(-1).max(1),
  pValue: z.number().min(0).max(1).optional(),
  strength: CorrelationStrengthSchema,
});

export const TrendAnalysisSchema = z.object({
  column: z.string(),
  trend: z.enum(['increasing', 'decreasing', 'stable', 'volatile']),
  slope: z.number(),
  rSquared: z.number().min(0).max(1),
  seasonality: z
    .object({
      detected: z.boolean(),
      period: z.number().positive().optional(),
      strength: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export const OutlierMethodSchema = z.enum(['iqr', 'zscore', 'modified_zscore']);

export const OutlierPointSchema = z.object({
  index: z.number().int().nonnegative(),
  value: z.number(),
  score: z.number(),
});

export const OutlierResultSchema = z.object({
  column: z.string(),
  method: OutlierMethodSchema,
  outliers: z.array(OutlierPointSchema),
  lowerBound: z.number(),
  upperBound: z.number(),
});

export const AggregationOperationSchema = z.enum([
  'sum',
  'mean',
  'median',
  'min',
  'max',
  'count',
  'std',
]);

export const AggregationResultSchema = z.object({
  column: z.string(),
  operation: AggregationOperationSchema,
  value: z.number(),
});

export const GroupStatsSchema = z.object({
  groupValue: z.unknown(),
  count: z.number().int().nonnegative(),
  aggregations: z.record(z.string(), AggregationResultSchema),
});

export const GroupByResultSchema = z.object({
  groupColumn: z.string(),
  groups: z.array(GroupStatsSchema),
});

export const FindingSchema = z.object({
  title: z.string(),
  observation: z.string(),
  quantification: z.string(),
  significance: z.string().optional(),
  implications: z.string(),
});

export const AnalysisReportSchema = z.object({
  summary: z.string(),
  findings: z.array(FindingSchema),
  recommendations: z.array(z.string()),
  limitations: z.array(z.string()),
});

// =============================================================================
// CHART SCHEMAS (chart-generator input/output)
// =============================================================================

export const ChartTypeSchema = z.enum([
  'bar',
  'barH',
  'line',
  'area',
  'pie',
  'doughnut',
  'scatter',
  'bubble',
  'heatmap',
  'boxplot',
  'histogram',
]);

export const ChartTitleSchema = z.object({
  text: z.string(),
  subtitle: z.string().optional(),
  anchor: z.enum(['start', 'middle', 'end']).optional(),
});

export const ChartDataPointSchema = z.object({
  value: z.number(),
  name: z.string().optional(),
  color: z.string().optional(),
});

export const ChartSeriesSchema = z.object({
  name: z.string(),
  data: z.array(z.union([z.number(), ChartDataPointSchema])),
  color: z.string().optional(),
  stack: z.string().optional(),
});

export const ChartDataSchema = z.object({
  categories: z.array(z.string()).optional(),
  series: z.array(ChartSeriesSchema).min(1),
  values: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const ChartOptionsSchema = z.object({
  showLegend: z.boolean().optional(),
  legendPosition: z.enum(['top', 'bottom', 'left', 'right']).optional(),
  xAxisTitle: z.string().optional(),
  yAxisTitle: z.string().optional(),
  xAxisType: z.enum(['nominal', 'ordinal', 'quantitative', 'temporal']).optional(),
  yAxisType: z.enum(['nominal', 'ordinal', 'quantitative', 'temporal']).optional(),
  yAxisMin: z.number().optional(),
  yAxisMax: z.number().optional(),
  showGrid: z.boolean().optional(),
  showLabels: z.boolean().optional(),
  labelFormat: z.string().optional(),
  animation: z.boolean().optional(),
  showTooltip: z.boolean().optional(),
  smooth: z.boolean().optional(),
  strokeWidth: z.number().positive().optional(),
  point: z.boolean().optional(),
  areaOpacity: z.number().min(0).max(1).optional(),
  barWidth: z.number().positive().optional(),
  cornerRadius: z.number().nonnegative().optional(),
  innerRadius: z.number().nonnegative().optional(),
  outerRadius: z.number().positive().optional(),
});

export const ChartThemeSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  colors: z.array(z.string()).optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().positive().optional(),
  vegaTheme: z.string().optional(),
});

export const ChartConfigSchema = z.object({
  type: ChartTypeSchema,
  title: z.union([z.string(), ChartTitleSchema]).optional(),
  data: ChartDataSchema,
  options: ChartOptionsSchema.optional(),
  theme: ChartThemeSchema.optional(),
});

export const ChartExportOptionsSchema = z.object({
  format: z.enum(['png', 'svg', 'pdf']),
  width: z.number().positive(),
  height: z.number().positive(),
  scale: z.number().positive().optional(),
  backgroundColor: z.string().optional(),
});

export const ChartRenderResultSchema = z.object({
  success: z.boolean(),
  outputPath: z.string().optional(),
  error: z.string().optional(),
  dimensions: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
});

// =============================================================================
// PRESENTATION SCHEMAS (pptx-builder input)
// =============================================================================

export const LayoutSchema = z.enum(['LAYOUT_16x9', 'LAYOUT_4x3', 'LAYOUT_WIDE']);

export const PresentationMetadataSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  revision: z.string().optional(),
});

export const PresentationSettingsSchema = z.object({
  layout: LayoutSchema,
  rtlMode: z.boolean().optional(),
});

export const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
});

export const ThemeTypographySchema = z.object({
  fontFamily: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  sizes: z.object({
    h1: z.string(),
    h2: z.string(),
    h3: z.string(),
    body: z.string(),
    caption: z.string(),
  }),
});

export const ThemeSpacingSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
});

export const PresentationThemeSchema = z.object({
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  spacing: ThemeSpacingSchema.optional(),
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
});

export const TextStyleSchema = z.object({
  fontFace: z.string().optional(),
  fontSize: z.number().positive().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  valign: z.enum(['top', 'middle', 'bottom']).optional(),
});

export const RichTextPartSchema = z.object({
  text: z.string(),
  options: TextStyleSchema.partial().optional(),
});

export const ElementAnimationSchema = z.object({
  type: z.enum(['fadeIn', 'slideIn', 'zoomIn']),
  delay: z.number().nonnegative().optional(),
  duration: z.number().positive().optional(),
});

const BaseElementSchema = z.object({
  position: PositionSchema,
  animation: ElementAnimationSchema.optional(),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: z.union([z.string(), z.array(RichTextPartSchema)]),
  style: TextStyleSchema.optional(),
});

export const BulletItemSchema = z.object({
  text: z.string(),
  indent: z.number().int().nonnegative().optional(),
});

export const BulletsElementSchema = BaseElementSchema.extend({
  type: z.literal('bullets'),
  items: z.array(z.union([z.string(), BulletItemSchema])),
  style: TextStyleSchema.optional(),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  path: z.string().min(1),
  sizing: z
    .object({
      type: z.enum(['contain', 'cover', 'stretch']),
    })
    .optional(),
  altText: z.string().optional(),
});

export const ChartElementSchema = BaseElementSchema.extend({
  type: z.literal('chart'),
  chartType: z.string(),
  data: z.array(z.unknown()),
  series: z.array(z.string()).optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const TableStyleSchema = z.object({
  headerBackground: z.string().optional(),
  headerColor: z.string().optional(),
  alternateRows: z.boolean().optional(),
  borderColor: z.string().optional(),
});

export const TableElementSchema = BaseElementSchema.extend({
  type: z.literal('table'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  style: TableStyleSchema.optional(),
});

export const ShapeTypeSchema = z.enum([
  'rect',
  'roundRect',
  'ellipse',
  'triangle',
  'diamond',
  'arrow',
  'chevron',
  'line',
]);

export const ShapeStyleSchema = z.object({
  fill: z.string().optional(),
  line: z
    .object({
      color: z.string().optional(),
      width: z.number().positive().optional(),
      dashType: z.enum(['solid', 'dash', 'dot']).optional(),
    })
    .optional(),
  shadow: z
    .object({
      type: z.enum(['outer', 'inner']).optional(),
      blur: z.number().nonnegative().optional(),
      offset: z.number().optional(),
    })
    .optional(),
});

export const ShapeElementSchema = BaseElementSchema.extend({
  type: z.literal('shape'),
  shape: ShapeTypeSchema,
  style: ShapeStyleSchema.optional(),
  text: z
    .object({
      content: z.string(),
      style: TextStyleSchema.optional(),
    })
    .optional(),
});

/**
 * Discriminated union for slide elements
 */
export const SlideElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  BulletsElementSchema,
  ImageElementSchema,
  ChartElementSchema,
  TableElementSchema,
  ShapeElementSchema,
]);

export const BackgroundSchema = z.object({
  color: z.string().optional(),
  image: z.string().optional(),
});

export const SlideTransitionSchema = z.object({
  type: z.enum(['fade', 'slide', 'zoom']),
  duration: z.number().positive().optional(),
});

const BaseSlideSchema = z.object({
  master: z.string().optional(),
  background: BackgroundSchema.optional(),
  notes: z.string().optional(),
  transition: SlideTransitionSchema.optional(),
});

export const TitleSlideSchema = BaseSlideSchema.extend({
  type: z.literal('title'),
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
});

export const SectionSlideSchema = BaseSlideSchema.extend({
  type: z.literal('section'),
  title: z.string(),
  subtitle: z.string().optional(),
  number: z.number().int().positive().optional(),
});

export const ContentSlideSchema = BaseSlideSchema.extend({
  type: z.literal('content'),
  title: z.string(),
  elements: z.array(SlideElementSchema),
});

export const ColumnContentSchema = z.object({
  title: z.string().optional(),
  elements: z.array(SlideElementSchema),
});

export const TwoColumnSlideSchema = BaseSlideSchema.extend({
  type: z.literal('two-column'),
  title: z.string(),
  left: ColumnContentSchema,
  right: ColumnContentSchema,
});

export const QuoteSlideSchema = BaseSlideSchema.extend({
  type: z.literal('quote'),
  quote: z.string(),
  author: z.string(),
  title: z.string().optional(),
});

/**
 * Discriminated union for slide types
 */
export const SlideSpecSchema = z.discriminatedUnion('type', [
  TitleSlideSchema,
  SectionSlideSchema,
  ContentSlideSchema,
  TwoColumnSlideSchema,
  QuoteSlideSchema,
]);

export const MasterSlideSchema = z.object({
  name: z.string(),
  background: BackgroundSchema.optional(),
  elements: z.array(SlideElementSchema).optional(),
});

/**
 * Full presentation specification contract
 */
export const PresentationSpecSchema = z.object({
  metadata: PresentationMetadataSchema,
  settings: PresentationSettingsSchema,
  theme: PresentationThemeSchema.optional(),
  masters: z.array(MasterSlideSchema).optional(),
  slides: z.array(SlideSpecSchema).min(1),
});

export const BuildResultSchema = z.object({
  success: z.boolean(),
  outputPath: z.string().optional(),
  slideCount: z.number().int().positive().optional(),
  error: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS (infer types from schemas for type safety)
// =============================================================================

export type ValidatedDataFrame = z.infer<typeof DataFrameSchema>;
export type ValidatedDataSchema = z.infer<typeof DataSchemaSchema>;
export type ValidatedReadResult = z.infer<typeof ReadResultSchema>;
export type ValidatedChartConfig = z.infer<typeof ChartConfigSchema>;
export type ValidatedPresentationSpec = z.infer<typeof PresentationSpecSchema>;
export type ValidatedSlideSpec = z.infer<typeof SlideSpecSchema>;
export type ValidatedSlideElement = z.infer<typeof SlideElementSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates data and returns typed result or throws with detailed error
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(
      `Validation failed${context ? ` (${context})` : ''}:\n${errors}`
    );
  }
  return result.data;
}

/**
 * Validates data and returns result object (doesn't throw)
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
