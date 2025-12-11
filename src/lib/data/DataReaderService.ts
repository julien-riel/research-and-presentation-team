/**
 * DataReaderService - Read and analyze data files (Excel, CSV, JSON)
 *
 * Supports:
 * - Excel files (.xlsx, .xls) via exceljs
 * - CSV files via csv-parse
 * - TSV files
 * - JSON files
 *
 * Features:
 * - Automatic schema detection
 * - Data quality reports
 * - Multi-sheet support for Excel
 * - Encoding detection
 * - Streaming support for large files (>100MB)
 * - Random sampling for very large datasets
 */

import { parse } from 'csv-parse/sync';
import { parse as parseStream } from 'csv-parse';
import ExcelJS from 'exceljs';
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { extname } from 'node:path';
import type {
  ColumnSchema,
  DataPreview,
  DataQualityIssue,
  DataQualityReport,
  DataFrame,
  DataSchema,
  DataType,
  FileFormat,
  FileStatistics,
  ReadOptions,
} from '../../types/data.js';

/** Default streaming threshold: 100MB */
const DEFAULT_STREAMING_THRESHOLD = 100 * 1024 * 1024;

/** Maximum string length in Node.js (~512MB) */
const MAX_STRING_LENGTH = 0x1fffffe8;

/**
 * Information about Excel sheets
 */
export interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
}

/**
 * Result of reading a data file
 */
export interface ReadResult {
  dataFrame: DataFrame;
  schema: DataSchema;
  quality: DataQualityReport;
}

/**
 * Service for reading data files
 */
export class DataReaderService {
  /**
   * Read a data file and return structured data
   * Automatically uses streaming for large files (>100MB by default)
   */
  async read(filePath: string, options: ReadOptions = {}): Promise<ReadResult> {
    const format = this.detectFormat(filePath);
    const fileSize = statSync(filePath).size;
    const threshold = options.streamingThreshold ?? DEFAULT_STREAMING_THRESHOLD;

    // Check if file is too large for synchronous read
    const needsStreaming = options.streaming || fileSize > threshold || fileSize > MAX_STRING_LENGTH;

    let dataFrame: DataFrame;

    switch (format) {
      case 'xlsx':
      case 'xls':
        dataFrame = await this.readExcel(filePath, options);
        break;
      case 'csv':
        if (needsStreaming) {
          dataFrame = await this.readCsvStreaming(filePath, options);
        } else {
          dataFrame = this.readCsv(filePath, options);
        }
        break;
      case 'tsv':
        if (needsStreaming) {
          dataFrame = await this.readCsvStreaming(filePath, { ...options, delimiter: '\t' });
        } else {
          dataFrame = this.readCsv(filePath, { ...options, delimiter: '\t' });
        }
        break;
      case 'json':
        if (fileSize > MAX_STRING_LENGTH) {
          throw new Error(`JSON file too large (${(fileSize / 1024 / 1024).toFixed(1)} MB). Maximum supported: ~512 MB. Consider converting to CSV.`);
        }
        dataFrame = this.readJson(filePath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const schema = this.detectSchema(dataFrame, format, fileSize);
    const quality = this.analyzeQuality(dataFrame, schema);

    return { dataFrame, schema, quality };
  }

  /**
   * Get file statistics without loading all data
   * Useful for very large files to understand structure before reading
   */
  async getFileStatistics(filePath: string, options: ReadOptions = {}): Promise<FileStatistics> {
    const format = this.detectFormat(filePath);
    const fileSize = statSync(filePath).size;

    let rowCount = 0;
    let columns: string[] = [];

    switch (format) {
      case 'xlsx':
      case 'xls': {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const sheetName = options.sheet || workbook.worksheets[0]?.name;
        const worksheet = workbook.getWorksheet(sheetName);
        if (worksheet) {
          rowCount = worksheet.rowCount - 1; // Minus header
          const headerRow = worksheet.getRow(1);
          headerRow.eachCell({ includeEmpty: false }, (cell) => {
            columns.push(cell.text?.toString() || '');
          });
        }
        break;
      }
      case 'csv':
      case 'tsv': {
        const stats = await this.getCsvStatistics(filePath, options);
        rowCount = stats.rowCount;
        columns = stats.columns;
        break;
      }
      case 'json': {
        const content = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          rowCount = data.length;
          columns = data.length > 0 ? Object.keys(data[0]) : [];
        }
        break;
      }
    }

    // Read sample for schema detection (first 1000 rows)
    let sampleSchema: DataSchema | undefined;
    try {
      const sampleResult = await this.read(filePath, { ...options, maxRows: 1000 });
      sampleSchema = sampleResult.schema;
      sampleSchema.rowCount = rowCount; // Update with actual row count
    } catch {
      // Sample read failed, skip schema
    }

    return {
      rowCount,
      columnCount: columns.length,
      columns,
      fileSize,
      format,
      estimatedMemory: fileSize * 2, // Rough estimate: 2x file size in memory
      sampleSchema,
    };
  }

  /**
   * Get CSV file statistics without loading all data
   */
  private async getCsvStatistics(filePath: string, options: ReadOptions = {}): Promise<{ rowCount: number; columns: string[] }> {
    return new Promise((resolve, reject) => {
      let rowCount = 0;
      let columns: string[] = [];
      const encoding = options.encoding || 'utf-8';

      const rl = createInterface({
        input: createReadStream(filePath, { encoding }),
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        if (rowCount === 0) {
          // Parse header line
          const delimiter = options.delimiter || this.detectDelimiterFromLine(line);
          columns = line.split(delimiter).map(col => col.replace(/^"|"$/g, '').trim());
        }
        rowCount++;
      });

      rl.on('close', () => {
        resolve({ rowCount: rowCount - 1, columns }); // Minus header row
      });

      rl.on('error', reject);
    });
  }

  /**
   * Detect delimiter from a single line
   */
  private detectDelimiterFromLine(line: string): string {
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    for (const delimiter of delimiters) {
      const count = (line.match(new RegExp(delimiter === '|' ? '\\|' : delimiter, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  }

  /**
   * Read CSV file using streaming (for large files)
   */
  async readCsvStreaming(filePath: string, options: ReadOptions = {}): Promise<DataFrame> {
    return new Promise((resolve, reject) => {
      const encoding = options.encoding || 'utf-8';
      const skipRows = options.skipRows ?? 0;
      const maxRows = options.maxRows;
      const sampleRate = options.sampleRate;

      // First pass: detect delimiter from first line
      const firstLinePromise = new Promise<string>((res, rej) => {
        const rl = createInterface({
          input: createReadStream(filePath, { encoding }),
          crlfDelay: Infinity,
        });
        rl.once('line', (line) => {
          rl.close();
          res(line);
        });
        rl.on('error', rej);
      });

      firstLinePromise.then((firstLine) => {
        const delimiter = options.delimiter || this.detectDelimiterFromLine(firstLine);

        const columns: string[] = [];
        const data: Record<string, unknown[]> = {};
        let rowCount = 0;
        let headerParsed = false;
        let skippedRows = 0;

        const parser = parseStream({
          delimiter,
          relax_column_count: true,
          relax_quotes: true,
          quote: false, // Disable quote parsing for problematic files
          trim: true,
          skip_empty_lines: true,
        });

        const stream = createReadStream(filePath, { encoding });

        parser.on('data', (record: string[]) => {
          // Skip rows if needed
          if (skippedRows < skipRows) {
            skippedRows++;
            return;
          }

          // First row after skip is header
          if (!headerParsed) {
            record.forEach((col) => {
              const colName = col || `Column${columns.length + 1}`;
              columns.push(colName);
              data[colName] = [];
            });
            headerParsed = true;
            return;
          }

          // Check max rows
          if (maxRows && rowCount >= maxRows) {
            stream.destroy();
            parser.end();
            return;
          }

          // Apply sampling if specified
          if (sampleRate && Math.random() > sampleRate) {
            return;
          }

          // Add row data
          columns.forEach((col, i) => {
            const value = record[i];
            data[col].push(this.parseValue(value || '', options));
          });
          rowCount++;
        });

        parser.on('end', () => {
          resolve({ columns, data, rowCount });
        });

        parser.on('error', (err) => {
          reject(new Error(`CSV parsing error: ${err.message}`));
        });

        stream.pipe(parser);
      }).catch(reject);
    });
  }

  /**
   * Read Excel file
   */
  async readExcel(filePath: string, options: ReadOptions = {}): Promise<DataFrame> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheetName = options.sheet || workbook.worksheets[0]?.name;
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const headerRow = options.headerRow ?? 1;
    const skipRows = options.skipRows ?? 0;
    const maxRows = options.maxRows;

    const headers: string[] = [];
    const headerRowData = worksheet.getRow(headerRow + skipRows);
    headerRowData.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = cell.text?.toString() || `Column${colNumber}`;
    });

    // Filter out empty trailing headers
    const columnCount = headers.filter((h) => h).length;
    const validHeaders = headers.slice(0, columnCount);

    const data: Record<string, unknown[]> = {};
    validHeaders.forEach((header) => {
      data[header] = [];
    });

    let rowCount = 0;
    const startRow = headerRow + skipRows + 1;
    const endRow = maxRows ? startRow + maxRows - 1 : worksheet.rowCount;

    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
      const row = worksheet.getRow(rowNum);
      let hasData = false;

      validHeaders.forEach((header, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        const value = this.extractCellValue(cell);
        data[header].push(value);
        if (value !== null && value !== undefined && value !== '') {
          hasData = true;
        }
      });

      if (hasData) {
        rowCount++;
      } else {
        // Remove last empty row
        validHeaders.forEach((header) => {
          data[header].pop();
        });
      }
    }

    return {
      columns: validHeaders,
      data,
      rowCount,
    };
  }

  /**
   * Extract value from Excel cell
   */
  private extractCellValue(cell: ExcelJS.Cell): unknown {
    if (cell.type === ExcelJS.ValueType.Null) {
      return null;
    }

    if (cell.type === ExcelJS.ValueType.Date) {
      return cell.value;
    }

    if (cell.type === ExcelJS.ValueType.Number) {
      return cell.value;
    }

    if (cell.type === ExcelJS.ValueType.Boolean) {
      return cell.value;
    }

    if (cell.type === ExcelJS.ValueType.Formula) {
      return cell.result;
    }

    if (cell.type === ExcelJS.ValueType.RichText) {
      const richText = cell.value as ExcelJS.CellRichTextValue;
      return richText.richText.map((t) => t.text).join('');
    }

    return cell.text?.toString() || null;
  }

  /**
   * Read CSV file
   */
  readCsv(filePath: string, options: ReadOptions = {}): DataFrame {
    const encoding = options.encoding || 'utf-8';
    const delimiter = options.delimiter || this.detectDelimiter(filePath, encoding);
    const skipRows = options.skipRows ?? 0;
    const maxRows = options.maxRows;

    let content = readFileSync(filePath, encoding);

    // Skip rows if specified
    if (skipRows > 0) {
      const lines = content.split('\n');
      content = lines.slice(skipRows).join('\n');
    }

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      relax_column_count: true,
      trim: true,
    });

    const limitedRecords = maxRows ? records.slice(0, maxRows) : records;

    if (limitedRecords.length === 0) {
      return { columns: [], data: {}, rowCount: 0 };
    }

    const columns = Object.keys(limitedRecords[0]);
    const data: Record<string, unknown[]> = {};

    columns.forEach((col) => {
      data[col] = limitedRecords.map((record: Record<string, string>) => {
        const value = record[col];
        return this.parseValue(value, options);
      });
    });

    return {
      columns,
      data,
      rowCount: limitedRecords.length,
    };
  }

  /**
   * Detect CSV delimiter
   */
  private detectDelimiter(filePath: string, encoding: BufferEncoding): string {
    const content = readFileSync(filePath, encoding);
    const firstLines = content.split('\n').slice(0, 5).join('\n');

    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    for (const delimiter of delimiters) {
      const count = (firstLines.match(new RegExp(delimiter === '|' ? '\\|' : delimiter, 'g')) || [])
        .length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  }

  /**
   * Parse a string value to its appropriate type
   */
  private parseValue(value: string, options: ReadOptions = {}): unknown {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Check for boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Check for number
    const decimalSeparator = options.decimalSeparator || '.';
    let numStr = value;
    if (decimalSeparator !== '.') {
      numStr = value.replace(decimalSeparator, '.');
    }
    // Remove thousand separators
    numStr = numStr.replace(/[\s,]/g, '');

    const num = parseFloat(numStr);
    if (!isNaN(num) && isFinite(num) && /^-?\d*\.?\d+$/.test(numStr)) {
      return num;
    }

    // Check for date
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // ISO date
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];

    for (const pattern of datePatterns) {
      if (pattern.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return value;
  }

  /**
   * Read JSON file
   */
  readJson(filePath: string): DataFrame {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Handle array of objects
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { columns: [], data: {}, rowCount: 0 };
      }

      const columns = Object.keys(data[0]);
      const result: Record<string, unknown[]> = {};

      columns.forEach((col) => {
        result[col] = data.map((row) => row[col]);
      });

      return {
        columns,
        data: result,
        rowCount: data.length,
      };
    }

    // Handle object with arrays
    if (typeof data === 'object') {
      const columns = Object.keys(data);
      const rowCount = Math.max(...columns.map((col) => data[col]?.length || 0));

      return {
        columns,
        data,
        rowCount,
      };
    }

    throw new Error('Invalid JSON format: expected array of objects or object with arrays');
  }

  /**
   * Detect file format from extension
   */
  detectFormat(filePath: string): FileFormat {
    const ext = extname(filePath).toLowerCase();
    const formats: Record<string, FileFormat> = {
      '.xlsx': 'xlsx',
      '.xls': 'xls',
      '.csv': 'csv',
      '.tsv': 'tsv',
      '.json': 'json',
    };

    const format = formats[ext];
    if (!format) {
      throw new Error(`Unknown file extension: ${ext}`);
    }

    return format;
  }

  /**
   * Detect schema from DataFrame
   */
  detectSchema(dataFrame: DataFrame, format: FileFormat, fileSize: number): DataSchema {
    const columns: ColumnSchema[] = dataFrame.columns.map((name) => {
      const values = dataFrame.data[name];
      const type = this.inferColumnType(values);
      const nullCount = values.filter((v) => v === null || v === undefined || v === '').length;
      const uniqueValues = new Set(values.filter((v) => v !== null && v !== undefined && v !== ''));

      return {
        name,
        type,
        nullable: nullCount > 0,
        unique: uniqueValues.size,
        nullCount,
        examples: this.getExamples(values),
      };
    });

    return {
      columns,
      rowCount: dataFrame.rowCount,
      fileSize,
      format,
    };
  }

  /**
   * Infer column type from values
   */
  private inferColumnType(values: unknown[]): DataType {
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');

    if (nonNullValues.length === 0) {
      return 'string';
    }

    const types = new Set<string>();

    for (const value of nonNullValues) {
      if (typeof value === 'boolean') {
        types.add('boolean');
      } else if (typeof value === 'number') {
        types.add(Number.isInteger(value) ? 'integer' : 'float');
      } else if (value instanceof Date) {
        types.add('date');
      } else if (typeof value === 'string') {
        // Check for currency
        if (/^[$€£¥]\s*[\d,]+\.?\d*$|^[\d,]+\.?\d*\s*[$€£¥]$/.test(value)) {
          types.add('currency');
        }
        // Check for percentage
        else if (/^[\d.]+%$/.test(value)) {
          types.add('percent');
        }
        // Check for date string
        else if (
          /^\d{4}-\d{2}-\d{2}$/.test(value) ||
          /^\d{2}\/\d{2}\/\d{4}$/.test(value)
        ) {
          types.add('date');
        }
        // Check for datetime
        else if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
          types.add('datetime');
        } else {
          types.add('string');
        }
      } else {
        types.add('mixed');
      }
    }

    // Consolidate types
    if (types.size === 1) {
      const type = [...types][0];
      return type as DataType;
    }

    // Integer + Float = Float
    if (types.has('integer') && types.has('float')) {
      types.delete('integer');
    }

    // Check for category (low cardinality strings)
    if (types.has('string')) {
      const uniqueRatio = new Set(nonNullValues).size / nonNullValues.length;
      if (uniqueRatio < 0.1 && nonNullValues.length > 10) {
        return 'category';
      }
    }

    if (types.size === 1) {
      return [...types][0] as DataType;
    }

    return 'mixed';
  }

  /**
   * Get example values from a column
   */
  private getExamples(values: unknown[], count = 3): unknown[] {
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');
    const unique = [...new Set(nonNull)];
    return unique.slice(0, count);
  }

  /**
   * Analyze data quality
   */
  analyzeQuality(dataFrame: DataFrame, schema: DataSchema): DataQualityReport {
    const issues: DataQualityIssue[] = [];
    let totalCompleteness = 0;
    let totalUniqueness = 0;

    for (const colSchema of schema.columns) {
      const values = dataFrame.data[colSchema.name];
      const nonNullCount = values.length - colSchema.nullCount;

      // Completeness
      const completeness = nonNullCount / values.length;
      totalCompleteness += completeness;

      if (completeness < 0.9) {
        issues.push({
          column: colSchema.name,
          type: 'null',
          severity: completeness < 0.5 ? 'error' : 'warning',
          count: colSchema.nullCount,
          percentage: ((1 - completeness) * 100),
          message: `Column has ${colSchema.nullCount} null values (${((1 - completeness) * 100).toFixed(1)}%)`,
        });
      }

      // Uniqueness
      const uniqueness = colSchema.unique / nonNullCount;
      totalUniqueness += uniqueness;

      // Check for duplicates in what should be unique columns
      if (
        uniqueness < 0.5 &&
        nonNullCount > 10 &&
        colSchema.name.toLowerCase().includes('id')
      ) {
        issues.push({
          column: colSchema.name,
          type: 'duplicate',
          severity: 'warning',
          count: nonNullCount - colSchema.unique,
          percentage: ((1 - uniqueness) * 100),
          message: `Potential ID column has ${((1 - uniqueness) * 100).toFixed(1)}% duplicates`,
        });
      }

      // Check for mixed types
      if (colSchema.type === 'mixed') {
        issues.push({
          column: colSchema.name,
          type: 'mixed_type',
          severity: 'warning',
          count: values.length,
          percentage: 100,
          message: `Column contains mixed data types`,
        });
      }
    }

    const columnCount = schema.columns.length || 1;

    return {
      completeness: totalCompleteness / columnCount,
      uniqueness: totalUniqueness / columnCount,
      validity: 1 - issues.filter((i) => i.severity === 'error').length / columnCount,
      consistency: 1 - issues.filter((i) => i.type === 'mixed_type').length / columnCount,
      issues,
    };
  }

  /**
   * Get preview of data
   */
  getPreview(dataFrame: DataFrame, rows = 10): DataPreview {
    const previewRows = Math.min(rows, dataFrame.rowCount);
    const rowData: unknown[][] = [];

    for (let i = 0; i < previewRows; i++) {
      const row: unknown[] = [];
      for (const col of dataFrame.columns) {
        row.push(dataFrame.data[col][i]);
      }
      rowData.push(row);
    }

    return {
      headers: dataFrame.columns,
      rows: rowData,
      totalRows: dataFrame.rowCount,
      previewRows,
    };
  }

  /**
   * List sheets in Excel file
   */
  async listSheets(filePath: string): Promise<SheetInfo[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    return workbook.worksheets.map((ws) => ({
      name: ws.name,
      rowCount: ws.rowCount,
      columnCount: ws.columnCount,
    }));
  }
}

/**
 * Default instance
 */
export const dataReaderService = new DataReaderService();
