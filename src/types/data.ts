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
}

export interface DataFrame {
  columns: string[];
  data: Record<string, unknown[]>;
  rowCount: number;
}
