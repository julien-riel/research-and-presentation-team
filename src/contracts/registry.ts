/**
 * Workflow Contract Registry
 *
 * Defines the data contracts between skills, documenting expected
 * inputs and outputs for each skill transition in the workflow.
 */

import { z } from 'zod';
import {
  DataFrameSchema,
  DataSchemaSchema,
  DataQualityReportSchema,
  ReadResultSchema,
  ChartConfigSchema,
  ChartRenderResultSchema,
  PresentationSpecSchema,
  BuildResultSchema,
  DescriptiveStatsSchema,
  CorrelationMatrixSchema,
  TrendAnalysisSchema,
  OutlierResultSchema,
  GroupByResultSchema,
  AnalysisReportSchema,
} from './schemas.js';

// =============================================================================
// CONTRACT DEFINITIONS
// =============================================================================

/**
 * Contract between two skills
 */
export interface SkillContract<TInput, TOutput> {
  /** Source skill */
  from: string;
  /** Target skill */
  to: string;
  /** Description of the data flow */
  description: string;
  /** Zod schema for input validation */
  inputSchema: z.ZodSchema<TInput>;
  /** Zod schema for output validation */
  outputSchema: z.ZodSchema<TOutput>;
  /** File format for data exchange (if applicable) */
  fileFormat?: 'json' | 'png' | 'svg' | 'pptx';
  /** Typical file path pattern */
  filePattern?: string;
}

// =============================================================================
// WORKFLOW CONTRACTS
// =============================================================================

/**
 * data-reader output schema (combined result)
 */
export const DataReaderOutputSchema = ReadResultSchema;

/**
 * data-analyst output schema (analysis results)
 */
export const DataAnalystOutputSchema = z.object({
  descriptiveStats: z.array(DescriptiveStatsSchema).optional(),
  correlations: CorrelationMatrixSchema.optional(),
  trends: z.array(TrendAnalysisSchema).optional(),
  outliers: z.array(OutlierResultSchema).optional(),
  groupBy: z.array(GroupByResultSchema).optional(),
  report: AnalysisReportSchema.optional(),
});

/**
 * chart-generator output schema
 */
export const ChartGeneratorOutputSchema = ChartRenderResultSchema;

/**
 * pptx-builder output schema
 */
export const PptxBuilderOutputSchema = BuildResultSchema;

// =============================================================================
// WORKFLOW CONTRACT REGISTRY
// =============================================================================

export const WorkflowContracts = {
  /**
   * data-reader → data-analyst
   * Reading file data for statistical analysis
   */
  'data-reader -> data-analyst': {
    from: 'data-reader',
    to: 'data-analyst',
    description: 'Lecture de fichier vers DataFrame pour analyse statistique',
    inputSchema: z.string(), // File path
    outputSchema: DataReaderOutputSchema,
    fileFormat: 'json' as const,
    filePattern: '/tmp/data-*.json',
  },

  /**
   * data-analyst → chart-generator
   * Analysis results to chart configuration
   */
  'data-analyst -> chart-generator': {
    from: 'data-analyst',
    to: 'chart-generator',
    description: 'Résultats d\'analyse vers configuration de graphique',
    inputSchema: DataAnalystOutputSchema,
    outputSchema: ChartConfigSchema,
    fileFormat: 'json' as const,
    filePattern: 'output/charts/*.json',
  },

  /**
   * chart-generator → pptx-builder
   * Rendered chart images for presentation
   */
  'chart-generator -> pptx-builder': {
    from: 'chart-generator',
    to: 'pptx-builder',
    description: 'Image de graphique vers slide de présentation',
    inputSchema: ChartConfigSchema,
    outputSchema: ChartGeneratorOutputSchema,
    fileFormat: 'png' as const,
    filePattern: 'output/charts/*.png',
  },

  /**
   * diagram-generator → pptx-builder
   * Rendered diagrams for presentation
   */
  'diagram-generator -> pptx-builder': {
    from: 'diagram-generator',
    to: 'pptx-builder',
    description: 'Image de diagramme vers slide de présentation',
    inputSchema: z.string(), // Mermaid/PlantUML code
    outputSchema: z.object({
      success: z.boolean(),
      outputPath: z.string().optional(),
      dimensions: z.object({
        width: z.number(),
        height: z.number(),
        ratio: z.number(),
      }).optional(),
      error: z.string().optional(),
    }),
    fileFormat: 'png' as const,
    filePattern: 'output/diagrams/*.png',
  },

  /**
   * map-generator → pptx-builder
   * Rendered maps for presentation
   */
  'map-generator -> pptx-builder': {
    from: 'map-generator',
    to: 'pptx-builder',
    description: 'Carte choroplèthe vers slide de présentation',
    inputSchema: z.object({
      data: z.record(z.string(), z.number()),
      title: z.string().optional(),
      colorScheme: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      svgPath: z.string().optional(),
      pngPath: z.string().optional(),
      error: z.string().optional(),
    }),
    fileFormat: 'png' as const,
    filePattern: 'output/maps/*.png',
  },

  /**
   * stock-photo-finder → pptx-builder
   * Downloaded photos for presentation
   */
  'stock-photo-finder -> pptx-builder': {
    from: 'stock-photo-finder',
    to: 'pptx-builder',
    description: 'Photo stock téléchargée vers slide de présentation',
    inputSchema: z.object({
      query: z.string(),
      orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      photos: z.array(z.object({
        id: z.number(),
        path: z.string(),
        width: z.number(),
        height: z.number(),
        photographer: z.string(),
        url: z.string(),
      })),
      error: z.string().optional(),
    }),
    fileFormat: 'png' as const,
    filePattern: 'output/photos/*.jpg',
  },

  /**
   * icon-finder → pptx-builder
   * Downloaded icons for presentation
   */
  'icon-finder -> pptx-builder': {
    from: 'icon-finder',
    to: 'pptx-builder',
    description: 'Icône téléchargée vers slide de présentation',
    inputSchema: z.object({
      name: z.string(),
      size: z.number().optional(),
      color: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      path: z.string().optional(),
      error: z.string().optional(),
    }),
    fileFormat: 'svg' as const,
    filePattern: 'output/icons/*.svg',
  },

  /**
   * presentation-architect → pptx-builder
   * Structured presentation spec for final build
   */
  'presentation-architect -> pptx-builder': {
    from: 'presentation-architect',
    to: 'pptx-builder',
    description: 'Spécification de présentation vers fichier PPTX',
    inputSchema: PresentationSpecSchema,
    outputSchema: PptxBuilderOutputSchema,
    fileFormat: 'pptx' as const,
    filePattern: 'output/*.pptx',
  },

  /**
   * theme-designer → pptx-builder
   * Theme configuration for presentation styling
   */
  'theme-designer -> pptx-builder': {
    from: 'theme-designer',
    to: 'pptx-builder',
    description: 'Configuration de thème vers application de style',
    inputSchema: z.object({
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        background: z.string(),
        surface: z.string(),
        text: z.object({
          primary: z.string(),
          secondary: z.string(),
        }),
      }),
      typography: z.object({
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
      }),
    }),
    outputSchema: z.object({
      applied: z.boolean(),
    }),
  },
} as const;

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export type ContractKey = keyof typeof WorkflowContracts;

/**
 * Validates input for a specific workflow transition
 */
export function validateWorkflowInput(
  contractKey: ContractKey,
  data: unknown
): unknown {
  const contract = WorkflowContracts[contractKey];
  return contract.inputSchema.parse(data);
}

/**
 * Validates output for a specific workflow transition
 */
export function validateWorkflowOutput(
  contractKey: ContractKey,
  data: unknown
): unknown {
  const contract = WorkflowContracts[contractKey];
  return contract.outputSchema.parse(data);
}

/**
 * Gets contract metadata for a workflow transition
 */
export function getContractInfo(contractKey: ContractKey) {
  const contract = WorkflowContracts[contractKey];
  return {
    from: contract.from,
    to: contract.to,
    description: contract.description,
    fileFormat: 'fileFormat' in contract ? contract.fileFormat : undefined,
    filePattern: 'filePattern' in contract ? contract.filePattern : undefined,
  };
}

/**
 * Lists all available workflow contracts
 */
export function listContracts(): Array<{
  key: ContractKey;
  from: string;
  to: string;
  description: string;
}> {
  return Object.entries(WorkflowContracts).map(([key, contract]) => ({
    key: key as ContractKey,
    from: contract.from,
    to: contract.to,
    description: contract.description,
  }));
}

/**
 * Gets all contracts where the specified skill is the source
 */
export function getContractsFrom(skillName: string): ContractKey[] {
  return Object.entries(WorkflowContracts)
    .filter(([, contract]) => contract.from === skillName)
    .map(([key]) => key as ContractKey);
}

/**
 * Gets all contracts where the specified skill is the target
 */
export function getContractsTo(skillName: string): ContractKey[] {
  return Object.entries(WorkflowContracts)
    .filter(([, contract]) => contract.to === skillName)
    .map(([key]) => key as ContractKey);
}
