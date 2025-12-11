/**
 * WebScraperService - Extract data from web pages using Cheerio
 *
 * Features:
 * - Extract tables from HTML pages
 * - Extract lists and structured data
 * - Extract text content
 * - Extract links and metadata
 * - No browser required (static HTML only)
 */

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

/**
 * Extracted table
 */
export interface ScrapedTable {
  /** Table headers */
  headers: string[];
  /** Table rows */
  rows: string[][];
  /** Table caption if present */
  caption?: string;
  /** Table index on page */
  index: number;
}

/**
 * Extracted list
 */
export interface ScrapedList {
  /** List items */
  items: string[];
  /** List type (ul, ol, dl) */
  type: 'unordered' | 'ordered' | 'definition';
  /** List index on page */
  index: number;
}

/**
 * Extracted link
 */
export interface ScrapedLink {
  /** Link text */
  text: string;
  /** Link URL */
  href: string;
  /** Link title attribute */
  title?: string;
}

/**
 * Page metadata
 */
export interface PageMetadata {
  /** Page title */
  title: string;
  /** Meta description */
  description?: string;
  /** Meta keywords */
  keywords?: string[];
  /** Open Graph title */
  ogTitle?: string;
  /** Open Graph description */
  ogDescription?: string;
  /** Open Graph image */
  ogImage?: string;
  /** Canonical URL */
  canonical?: string;
  /** Language */
  language?: string;
}

/**
 * Scrape options
 */
export interface ScrapeOptions {
  /** Base URL for resolving relative links */
  baseUrl?: string;
  /** Selector for main content area */
  contentSelector?: string;
  /** Remove these selectors before extraction */
  removeSelectors?: string[];
  /** Include hidden elements */
  includeHidden?: boolean;
}

/**
 * Full scrape result
 */
export interface ScrapeResult {
  /** Page URL */
  url: string;
  /** Page metadata */
  metadata: PageMetadata;
  /** Main text content */
  text: string;
  /** Extracted tables */
  tables: ScrapedTable[];
  /** Extracted lists */
  lists: ScrapedList[];
  /** Extracted links */
  links: ScrapedLink[];
  /** Extraction timestamp */
  timestamp: string;
}

/**
 * Clean text by removing extra whitespace
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Resolve URL against base
 */
function resolveUrl(href: string, baseUrl?: string): string {
  if (!href) return '';
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  if (href.startsWith('//')) {
    return 'https:' + href;
  }
  if (baseUrl) {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }
  return href;
}

/**
 * Web Scraper Service
 */
export class WebScraperService {
  /**
   * Fetch and parse a web page
   */
  async fetch(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DataBot/1.0; +https://example.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return this.parse(html, { ...options, baseUrl: options.baseUrl || url });
  }

  /**
   * Parse HTML content
   */
  parse(html: string, options: ScrapeOptions = {}): ScrapeResult {
    const $ = cheerio.load(html);
    const { contentSelector, removeSelectors = [], baseUrl } = options;

    // Remove unwanted elements
    const defaultRemove = ['script', 'style', 'noscript', 'iframe', 'nav', 'footer', 'aside', '.ad', '.advertisement'];
    [...defaultRemove, ...removeSelectors].forEach(selector => {
      $(selector).remove();
    });

    // Get content root
    const $content = contentSelector ? $(contentSelector) : $('body');

    // Extract metadata
    const metadata = this.extractMetadata($);

    // Extract tables
    const tables = this.extractTables($content, $);

    // Extract lists
    const lists = this.extractLists($content, $);

    // Extract links
    const links = this.extractLinks($content, $, baseUrl);

    // Extract text
    const text = cleanText($content.text());

    return {
      url: baseUrl || '',
      metadata,
      text,
      tables,
      lists,
      links,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract page metadata
   */
  extractMetadata($: CheerioAPI): PageMetadata {
    const getMeta = (name: string): string | undefined => {
      return $(`meta[name="${name}"]`).attr('content') ||
             $(`meta[property="${name}"]`).attr('content');
    };

    const keywords = getMeta('keywords');

    return {
      title: $('title').first().text().trim(),
      description: getMeta('description'),
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage: getMeta('og:image'),
      canonical: $('link[rel="canonical"]').attr('href'),
      language: $('html').attr('lang'),
    };
  }

  /**
   * Extract all tables from content
   */
  extractTables($content: ReturnType<CheerioAPI>, $: CheerioAPI): ScrapedTable[] {
    const tables: ScrapedTable[] = [];

    $content.find('table').each((index, table) => {
      const $table = $(table);
      const caption = $table.find('caption').first().text().trim() || undefined;

      // Extract headers
      const headers: string[] = [];
      $table.find('thead tr th, thead tr td, tr:first-child th').each((_, th) => {
        headers.push(cleanText($(th).text()));
      });

      // If no thead, try first row
      if (headers.length === 0) {
        $table.find('tr:first-child td').each((_, td) => {
          headers.push(cleanText($(td).text()));
        });
      }

      // Extract rows
      const rows: string[][] = [];
      const $rows = headers.length > 0
        ? $table.find('tbody tr, tr:not(:first-child)')
        : $table.find('tr');

      $rows.each((_, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((__, cell) => {
          cells.push(cleanText($(cell).text()));
        });
        if (cells.length > 0 && cells.some(c => c.length > 0)) {
          rows.push(cells);
        }
      });

      // Only add if we have data
      if (headers.length > 0 || rows.length > 0) {
        tables.push({
          headers: headers.length > 0 ? headers : rows.shift() || [],
          rows,
          caption,
          index,
        });
      }
    });

    return tables;
  }

  /**
   * Extract all lists from content
   */
  extractLists($content: ReturnType<CheerioAPI>, $: CheerioAPI): ScrapedList[] {
    const lists: ScrapedList[] = [];
    let index = 0;

    // Unordered lists
    $content.find('ul').each((_, ul) => {
      const items: string[] = [];
      $(ul).find('> li').each((__, li) => {
        const text = cleanText($(li).clone().children('ul, ol').remove().end().text());
        if (text) items.push(text);
      });
      if (items.length > 0) {
        lists.push({ items, type: 'unordered', index: index++ });
      }
    });

    // Ordered lists
    $content.find('ol').each((_, ol) => {
      const items: string[] = [];
      $(ol).find('> li').each((__, li) => {
        const text = cleanText($(li).clone().children('ul, ol').remove().end().text());
        if (text) items.push(text);
      });
      if (items.length > 0) {
        lists.push({ items, type: 'ordered', index: index++ });
      }
    });

    // Definition lists
    $content.find('dl').each((_, dl) => {
      const items: string[] = [];
      $(dl).find('dt').each((__, dt) => {
        const term = cleanText($(dt).text());
        const def = cleanText($(dt).next('dd').text());
        if (term) items.push(`${term}: ${def}`);
      });
      if (items.length > 0) {
        lists.push({ items, type: 'definition', index: index++ });
      }
    });

    return lists;
  }

  /**
   * Extract all links from content
   */
  extractLinks($content: ReturnType<CheerioAPI>, $: CheerioAPI, baseUrl?: string): ScrapedLink[] {
    const links: ScrapedLink[] = [];
    const seen = new Set<string>();

    $content.find('a[href]').each((_, a) => {
      const $a = $(a);
      const href = resolveUrl($a.attr('href') || '', baseUrl);
      const text = cleanText($a.text());

      // Skip empty, anchor-only, or duplicate links
      if (!href || href.startsWith('#') || seen.has(href)) return;
      seen.add(href);

      links.push({
        text: text || href,
        href,
        title: $a.attr('title') || undefined,
      });
    });

    return links;
  }

  /**
   * Extract only tables from a URL
   */
  async fetchTables(url: string, options: ScrapeOptions = {}): Promise<ScrapedTable[]> {
    const result = await this.fetch(url, options);
    return result.tables;
  }

  /**
   * Extract table by index
   */
  async fetchTable(url: string, index: number, options: ScrapeOptions = {}): Promise<ScrapedTable | null> {
    const tables = await this.fetchTables(url, options);
    return tables[index] || null;
  }

  /**
   * Extract only text from a URL
   */
  async fetchText(url: string, options: ScrapeOptions = {}): Promise<string> {
    const result = await this.fetch(url, options);
    return result.text;
  }

  /**
   * Parse HTML string and extract tables
   */
  parseTables(html: string): ScrapedTable[] {
    const $ = cheerio.load(html);
    return this.extractTables($('body'), $);
  }

  /**
   * Convert scraped table to CSV string
   */
  tableToCSV(table: ScrapedTable): string {
    const escapeCSV = (cell: string): string => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    };

    const lines: string[] = [];

    if (table.headers.length > 0) {
      lines.push(table.headers.map(escapeCSV).join(','));
    }

    for (const row of table.rows) {
      lines.push(row.map(escapeCSV).join(','));
    }

    return lines.join('\n');
  }

  /**
   * Convert scraped table to JSON
   */
  tableToJSON(table: ScrapedTable): Record<string, string>[] {
    return table.rows.map(row => {
      const obj: Record<string, string> = {};
      table.headers.forEach((header, i) => {
        obj[header || `column${i}`] = row[i] || '';
      });
      return obj;
    });
  }
}

/**
 * Singleton instance
 */
let instance: WebScraperService | null = null;

/**
 * Get singleton instance
 */
export function getWebScraperService(): WebScraperService {
  if (!instance) {
    instance = new WebScraperService();
  }
  return instance;
}
