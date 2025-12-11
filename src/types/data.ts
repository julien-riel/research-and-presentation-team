/**
 * Types for data handling
 */

export interface ColumnSchema {
  name: string;
  type: DataType;
  nullable: boolean;
  unique: number;
  nullCount: number;
  examples: unknown[];
}

export type DataType =
  | 'string'
  | 'number'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'percent'
  | 'category'
  | 'mixed';

export interface DataSchema {
  columns: ColumnSchema[];
  rowCount: number;
  fileSize: number;
  format: FileFormat;
}

export type FileFormat = 'xlsx' | 'xls' | 'csv' | 'tsv' | 'json';

export interface DataQualityReport {
  completeness: number;
  uniqueness: number;
  validity: number;
  consistency: number;
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  column: string;
  type: 'null' | 'duplicate' | 'invalid' | 'outlier' | 'mixed_type';
  severity: 'warning' | 'error';
  count: number;
  percentage: number;
  message: string;
}

export interface DataPreview {
  headers: string[];
  rows: unknown[][];
  totalRows: number;
  previewRows: number;
}

export interface ReadOptions {
  sheet?: string;
  delimiter?: string;
  encoding?: BufferEncoding;
  headerRow?: number;
  skipRows?: number;
  maxRows?: number;
  dateFormat?: string;
  decimalSeparator?: string;
  /** Sample rate (0-1) for random sampling of large files */
  sampleRate?: number;
  /** Force streaming mode for large files */
  streaming?: boolean;
  /** File size threshold (in bytes) to auto-enable streaming (default: 100MB) */
  streamingThreshold?: number;
}

/** Statistics for large files without loading all data */
export interface FileStatistics {
  rowCount: number;
  columnCount: number;
  columns: string[];
  fileSize: number;
  format: FileFormat;
  estimatedMemory: number;
  sampleSchema?: DataSchema;
}

export interface DataFrame {
  columns: string[];
  data: Record<string, unknown[]>;
  rowCount: number;
}
