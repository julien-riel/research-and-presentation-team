/**
 * PdfReaderService - Read and extract content from PDF files
 *
 * Features:
 * - Extract text content from PDF
 * - Get PDF metadata (title, author, pages, etc.)
 * - Extract tables (basic heuristics)
 * - Page-by-page extraction
 */

import { existsSync, statSync, createReadStream } from 'node:fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pdfjs-dist ESM import
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * PDF metadata info type from pdfjs-dist
 */
interface PdfInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
  PDFFormatVersion?: string;
  [key: string]: unknown;
}

/**
 * Text item from pdfjs-dist
 */
interface TextItem {
  str: string;
  dir?: string;
  transform?: number[];
  width?: number;
  height?: number;
  fontName?: string;
  hasEOL?: boolean;
}

/**
 * Read file as buffer using streams (memory efficient for large files)
 */
async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks

    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Parse PDF using pdfjs-dist directly
 */
async function parsePdf(
  dataBuffer: Buffer,
  options: { maxPages?: number } = {}
): Promise<{
  text: string;
  numpages: number;
  info: PdfInfo;
  version?: string;
}> {
  // Convert Buffer to Uint8Array
  const uint8Array = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const maxPages = options.maxPages || numPages;

  // Get metadata
  const metadata = await pdfDocument.getMetadata().catch(() => ({ info: {}, metadata: null }));
  const info = (metadata.info || {}) as PdfInfo;

  // Extract text page by page
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(numPages, maxPages); i++) {
    try {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as unknown[])
        .filter((item): item is TextItem =>
          typeof item === 'object' && item !== null && 'str' in item
        )
        .map((item) => item.str)
        .join(' ');
      pages.push(pageText);
    } catch {
      pages.push('');
    }
  }

  const text = pages.join('\f'); // Use form feed as page separator

  return {
    text,
    numpages: numPages,
    info,
    version: info.PDFFormatVersion,
  };
}

/**
 * PDF metadata
 */
export interface PdfMetadata {
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Subject */
  subject?: string;
  /** Keywords */
  keywords?: string;
  /** Creator application */
  creator?: string;
  /** Producer application */
  producer?: string;
  /** Creation date */
  creationDate?: Date;
  /** Modification date */
  modificationDate?: Date;
  /** Number of pages */
  pageCount: number;
  /** PDF version */
  version?: string;
}

/**
 * Extracted PDF content
 */
export interface PdfContent {
  /** Raw text content */
  text: string;
  /** Text split by pages */
  pages: string[];
  /** Metadata */
  metadata: PdfMetadata;
  /** File info */
  info: {
    path: string;
    size: number;
  };
}

/**
 * Extracted table structure
 */
export interface ExtractedTable {
  /** Table headers (first row) */
  headers: string[];
  /** Table rows */
  rows: string[][];
  /** Page number where table was found */
  pageNumber?: number;
}

/**
 * Options for PDF extraction
 */
export interface PdfExtractionOptions {
  /** Maximum pages to extract (0 = all) */
  maxPages?: number;
  /** Extract tables */
  extractTables?: boolean;
  /** Page range (1-indexed) */
  pageRange?: { start: number; end: number };
}

/**
 * Default extraction options
 */
const DEFAULT_OPTIONS: Required<PdfExtractionOptions> = {
  maxPages: 0,
  extractTables: false,
  pageRange: { start: 1, end: Infinity },
};

/**
 * Service for reading PDF files
 */
export class PdfReaderService {
  /**
   * Read and extract content from a PDF file
   */
  async readPdf(
    filePath: string,
    options: PdfExtractionOptions = {}
  ): Promise<PdfContent> {
    if (!existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };
    const fileStats = statSync(filePath);
    const dataBuffer = await readFileAsBuffer(filePath);

    const data = await parsePdf(dataBuffer, {
      maxPages: opts.maxPages > 0 ? opts.maxPages : undefined,
    });

    // Parse info from pdfjs-dist
    const info = data.info;
    const metadata: PdfMetadata = {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      keywords: info.Keywords,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: info.CreationDate ? this.parseDate(info.CreationDate) : undefined,
      modificationDate: info.ModDate ? this.parseDate(info.ModDate) : undefined,
      pageCount: data.numpages,
      version: data.version,
    };

    // Split text by page markers (heuristic)
    const pages = this.splitByPages(data.text, data.numpages);

    // Apply page range filter
    const filteredPages = pages.slice(
      opts.pageRange.start - 1,
      Math.min(opts.pageRange.end, pages.length)
    );

    return {
      text: filteredPages.join('\n\n'),
      pages: filteredPages,
      metadata,
      info: {
        path: filePath,
        size: fileStats.size,
      },
    };
  }

  /**
   * Get PDF metadata only (faster than full extraction)
   */
  async getMetadata(filePath: string): Promise<PdfMetadata> {
    if (!existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    const dataBuffer = await readFileAsBuffer(filePath);
    const data = await parsePdf(dataBuffer, { maxPages: 1 });

    const info = data.info;
    return {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      keywords: info.Keywords,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: info.CreationDate ? this.parseDate(info.CreationDate) : undefined,
      modificationDate: info.ModDate ? this.parseDate(info.ModDate) : undefined,
      pageCount: data.numpages,
      version: data.version,
    };
  }

  /**
   * Extract text from specific page range
   */
  async getPageRange(
    filePath: string,
    startPage: number,
    endPage: number
  ): Promise<string[]> {
    const content = await this.readPdf(filePath, {
      pageRange: { start: startPage, end: endPage },
    });
    return content.pages;
  }

  /**
   * Extract tables from PDF (basic heuristic-based extraction)
   */
  async extractTables(filePath: string): Promise<ExtractedTable[]> {
    const content = await this.readPdf(filePath);
    const tables: ExtractedTable[] = [];

    for (let pageIdx = 0; pageIdx < content.pages.length; pageIdx++) {
      const pageText = content.pages[pageIdx];
      const pageTables = this.findTablesInText(pageText, pageIdx + 1);
      tables.push(...pageTables);
    }

    return tables;
  }

  /**
   * Find tables in text using heuristics
   */
  private findTablesInText(text: string, pageNumber: number): ExtractedTable[] {
    const tables: ExtractedTable[] = [];
    const lines = text.split('\n').filter((line) => line.trim());

    // Look for potential table rows (multiple columns separated by spaces/tabs)
    const tableRows: string[][] = [];
    let inTable = false;

    for (const line of lines) {
      // Heuristic: table row has multiple columns separated by 2+ spaces or tabs
      const columns = line.split(/\s{2,}|\t+/).filter((col) => col.trim());

      if (columns.length >= 2) {
        if (!inTable) {
          inTable = true;
        }
        tableRows.push(columns);
      } else if (inTable && tableRows.length >= 2) {
        // End of table
        tables.push(this.createTable(tableRows, pageNumber));
        tableRows.length = 0;
        inTable = false;
      } else {
        inTable = false;
        tableRows.length = 0;
      }
    }

    // Handle last table
    if (tableRows.length >= 2) {
      tables.push(this.createTable(tableRows, pageNumber));
    }

    return tables;
  }

  /**
   * Create table structure from rows
   */
  private createTable(rows: string[][], pageNumber: number): ExtractedTable {
    // Normalize column count
    const maxCols = Math.max(...rows.map((r) => r.length));
    const normalizedRows = rows.map((row) => {
      while (row.length < maxCols) {
        row.push('');
      }
      return row;
    });

    return {
      headers: normalizedRows[0] || [],
      rows: normalizedRows.slice(1),
      pageNumber,
    };
  }

  /**
   * Split text by pages (heuristic)
   */
  private splitByPages(text: string, pageCount: number): string[] {
    // Try to split by form feed character first
    if (text.includes('\f')) {
      return text.split('\f').map((p) => p.trim()).filter(Boolean);
    }

    // If no form feed, try to split evenly (fallback)
    if (pageCount === 1) {
      return [text.trim()];
    }

    // Heuristic: split by large gaps or page number patterns
    const pagePatterns = [
      /\n\s*-\s*\d+\s*-\s*\n/g, // - 1 -
      /\n\s*\d+\s*\/\s*\d+\s*\n/g, // 1 / 10
      /\n\s*Page\s+\d+\s*\n/gi, // Page 1
    ];

    for (const pattern of pagePatterns) {
      const parts = text.split(pattern);
      if (parts.length >= pageCount * 0.5) {
        return parts.map((p) => p.trim()).filter(Boolean);
      }
    }

    // Last resort: split by approximate character count
    const charsPerPage = Math.ceil(text.length / pageCount);
    const pages: string[] = [];
    for (let i = 0; i < text.length; i += charsPerPage) {
      pages.push(text.slice(i, i + charsPerPage).trim());
    }

    return pages.filter(Boolean);
  }

  /**
   * Parse PDF date string
   */
  private parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;

    // PDF date format: D:YYYYMMDDHHmmSS+HH'mm'
    const match = dateStr.match(
      /D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/
    );

    if (match) {
      const [, year, month, day, hour = '0', min = '0', sec = '0'] = match;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(min),
        parseInt(sec)
      );
    }

    // Try standard date parsing
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  /**
   * Search for text in PDF
   */
  async searchText(
    filePath: string,
    searchTerm: string,
    options: { caseSensitive?: boolean } = {}
  ): Promise<Array<{ page: number; context: string; position: number }>> {
    const content = await this.readPdf(filePath);
    const results: Array<{ page: number; context: string; position: number }> = [];

    const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();

    for (let pageIdx = 0; pageIdx < content.pages.length; pageIdx++) {
      const pageText = options.caseSensitive
        ? content.pages[pageIdx]
        : content.pages[pageIdx].toLowerCase();

      let position = 0;
      let searchPos = pageText.indexOf(term, position);

      while (searchPos !== -1) {
        // Extract context (surrounding text)
        const start = Math.max(0, searchPos - 50);
        const end = Math.min(pageText.length, searchPos + term.length + 50);
        const context = content.pages[pageIdx].slice(start, end);

        results.push({
          page: pageIdx + 1,
          context: `...${context}...`,
          position: searchPos,
        });

        position = searchPos + 1;
        searchPos = pageText.indexOf(term, position);
      }
    }

    return results;
  }

  /**
   * Get summary statistics
   */
  async getSummary(filePath: string): Promise<{
    metadata: PdfMetadata;
    wordCount: number;
    characterCount: number;
    lineCount: number;
    averageWordsPerPage: number;
  }> {
    const content = await this.readPdf(filePath);
    const text = content.text;

    const words = text.split(/\s+/).filter(Boolean);
    const lines = text.split('\n').filter((l) => l.trim());

    return {
      metadata: content.metadata,
      wordCount: words.length,
      characterCount: text.length,
      lineCount: lines.length,
      averageWordsPerPage:
        content.metadata.pageCount > 0
          ? Math.round(words.length / content.metadata.pageCount)
          : 0,
    };
  }
}

/**
 * Singleton instance
 */
let instance: PdfReaderService | null = null;

/**
 * Get singleton instance
 */
export function getPdfReaderService(): PdfReaderService {
  if (!instance) {
    instance = new PdfReaderService();
  }
  return instance;
}
