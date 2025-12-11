/**
 * Contract validation module
 *
 * Provides runtime validation for data contracts between skills.
 */

// Schema exports
export {
  // Data schemas
  DataTypeSchema,
  FileFormatSchema,
  ColumnSchemaSchema,
  DataSchemaSchema,
  DataQualityIssueSchema,
  DataQualityReportSchema,
  DataFrameSchema,
  DataPreviewSchema,
  ReadOptionsSchema,
  ReadResultSchema,

  // Analysis schemas
  CorrelationMethodSchema,
  CorrelationStrengthSchema,
  DescriptiveStatsSchema,
  CorrelationMatrixSchema,
  CorrelationResultSchema,
  TrendAnalysisSchema,
  OutlierMethodSchema,
  OutlierPointSchema,
  OutlierResultSchema,
  AggregationOperationSchema,
  AggregationResultSchema,
  GroupStatsSchema,
  GroupByResultSchema,
  FindingSchema,
  AnalysisReportSchema,

  // Chart schemas
  ChartTypeSchema,
  ChartTitleSchema,
  ChartDataPointSchema,
  ChartSeriesSchema,
  ChartDataSchema,
  ChartOptionsSchema,
  ChartThemeSchema,
  ChartConfigSchema,
  ChartExportOptionsSchema,
  ChartRenderResultSchema,

  // Presentation schemas
  LayoutSchema,
  PresentationMetadataSchema,
  PresentationSettingsSchema,
  ThemeColorsSchema,
  ThemeTypographySchema,
  ThemeSpacingSchema,
  PresentationThemeSchema,
  PositionSchema,
  TextStyleSchema,
  RichTextPartSchema,
  ElementAnimationSchema,
  TextElementSchema,
  BulletItemSchema,
  BulletsElementSchema,
  ImageElementSchema,
  ChartElementSchema,
  TableStyleSchema,
  TableElementSchema,
  ShapeTypeSchema,
  ShapeStyleSchema,
  ShapeElementSchema,
  SlideElementSchema,
  BackgroundSchema,
  SlideTransitionSchema,
  TitleSlideSchema,
  SectionSlideSchema,
  ContentSlideSchema,
  ColumnContentSchema,
  TwoColumnSlideSchema,
  QuoteSlideSchema,
  SlideSpecSchema,
  MasterSlideSchema,
  PresentationSpecSchema,
  BuildResultSchema,

  // Validation helpers
  validateOrThrow,
  validateSafe,

  // Inferred types
  type ValidatedDataFrame,
  type ValidatedDataSchema,
  type ValidatedReadResult,
  type ValidatedChartConfig,
  type ValidatedPresentationSpec,
  type ValidatedSlideSpec,
  type ValidatedSlideElement,
} from './schemas.js';

// Registry exports
export {
  WorkflowContracts,
  DataReaderOutputSchema,
  DataAnalystOutputSchema,
  ChartGeneratorOutputSchema,
  PptxBuilderOutputSchema,
  validateWorkflowInput,
  validateWorkflowOutput,
  getContractInfo,
  listContracts,
  getContractsFrom,
  getContractsTo,
  type SkillContract,
  type ContractKey,
} from './registry.js';
