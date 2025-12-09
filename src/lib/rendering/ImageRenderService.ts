/**
 * ImageRenderService - Render HTML/SVG to PNG images using Playwright
 *
 * Features:
 * - Render ECharts HTML to PNG
 * - Render Mermaid diagrams to PNG/SVG
 * - Generate slide thumbnails
 * - Configurable viewport and scale
 */

import { chromium, type Browser, type Page } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { EChartsOption } from '../../types/chart.js';

/**
 * Options for image rendering
 */
export interface RenderOptions {
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Device scale factor for higher resolution */
  scale?: number;
  /** Output format */
  format?: 'png' | 'jpeg';
  /** JPEG quality (0-100) */
  quality?: number;
  /** Background color */
  backgroundColor?: string;
  /** Wait time for rendering (ms) */
  waitTime?: number;
}

/**
 * Default render options
 */
const DEFAULT_OPTIONS: Required<RenderOptions> = {
  width: 800,
  height: 600,
  scale: 2,
  format: 'png',
  quality: 90,
  backgroundColor: '#ffffff',
  waitTime: 500,
};

/**
 * Service for rendering images from HTML content
 */
export class ImageRenderService {
  private browser: Browser | null = null;
  private browserLaunchPromise: Promise<Browser> | null = null;

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    if (this.browserLaunchPromise) {
      return this.browserLaunchPromise;
    }

    this.browserLaunchPromise = chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.browser = await this.browserLaunchPromise;
    this.browserLaunchPromise = null;
    return this.browser;
  }

  /**
   * Create a new page with viewport settings
   */
  private async createPage(options: RenderOptions): Promise<Page> {
    const browser = await this.getBrowser();
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const page = await browser.newPage({
      viewport: {
        width: opts.width,
        height: opts.height,
      },
      deviceScaleFactor: opts.scale,
    });

    return page;
  }

  /**
   * Render HTML content to image
   */
  async renderHtml(
    html: string,
    outputPath: string,
    options: RenderOptions = {}
  ): Promise<void> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const page = await this.createPage(opts);

    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForTimeout(opts.waitTime);

      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      await page.screenshot({
        path: outputPath,
        type: opts.format,
        quality: opts.format === 'jpeg' ? opts.quality : undefined,
        fullPage: false,
      });
    } finally {
      await page.close();
    }
  }

  /**
   * Render HTML file to image
   */
  async renderHtmlFile(
    htmlPath: string,
    outputPath: string,
    options: RenderOptions = {}
  ): Promise<void> {
    if (!existsSync(htmlPath)) {
      throw new Error(`HTML file not found: ${htmlPath}`);
    }

    const html = readFileSync(htmlPath, 'utf-8');
    await this.renderHtml(html, outputPath, options);
  }

  /**
   * Render ECharts option to PNG
   */
  async renderEChart(
    option: EChartsOption,
    outputPath: string,
    renderOptions: RenderOptions = {}
  ): Promise<void> {
    const opts = { ...DEFAULT_OPTIONS, ...renderOptions };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${opts.backgroundColor}; }
    #chart { width: ${opts.width}px; height: ${opts.height}px; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    window.chartReady = false;
    var chart = echarts.init(document.getElementById('chart'));
    chart.setOption(${JSON.stringify(option)});
    chart.on('finished', function() {
      window.chartReady = true;
    });
    // Fallback: mark as ready after setOption completes
    setTimeout(function() {
      window.chartReady = true;
    }, 100);
  </script>
</body>
</html>`;

    const page = await this.createPage(opts);

    try {
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Wait for ECharts to finish rendering
      await page.waitForFunction('window.chartReady === true', { timeout: 10000 });
      await page.waitForTimeout(opts.waitTime);

      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      await page.screenshot({
        path: outputPath,
        type: opts.format,
        quality: opts.format === 'jpeg' ? opts.quality : undefined,
        fullPage: false,
      });
    } finally {
      await page.close();
    }
  }

  /**
   * Render Mermaid diagram to PNG/SVG
   */
  async renderMermaid(
    code: string,
    outputPath: string,
    options: RenderOptions & { theme?: string } = {}
  ): Promise<void> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const theme = options.theme || 'default';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${opts.backgroundColor};
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .mermaid {
      max-width: 100%;
    }
  </style>
</head>
<body>
  <div class="mermaid">
${code}
  </div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme}',
      securityLevel: 'loose'
    });
  </script>
</body>
</html>`;

    const page = await this.createPage(opts);

    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForTimeout(opts.waitTime);

      // Wait for Mermaid to render
      await page.waitForSelector('.mermaid svg', { timeout: 10000 });

      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Get the SVG element bounding box
      const svgBox = await page.evaluate(`
        (() => {
          const svg = document.querySelector('.mermaid svg');
          if (!svg) return null;
          const rect = svg.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        })()
      `) as { x: number; y: number; width: number; height: number } | null;

      if (svgBox) {
        await page.screenshot({
          path: outputPath,
          type: opts.format,
          quality: opts.format === 'jpeg' ? opts.quality : undefined,
          clip: {
            x: Math.max(0, svgBox.x - 10),
            y: Math.max(0, svgBox.y - 10),
            width: svgBox.width + 20,
            height: svgBox.height + 20,
          },
        });
      } else {
        await page.screenshot({
          path: outputPath,
          type: opts.format,
          quality: opts.format === 'jpeg' ? opts.quality : undefined,
          fullPage: true,
        });
      }
    } finally {
      await page.close();
    }
  }

  /**
   * Render Mermaid file to image
   */
  async renderMermaidFile(
    inputPath: string,
    outputPath: string,
    options: RenderOptions & { theme?: string } = {}
  ): Promise<void> {
    if (!existsSync(inputPath)) {
      throw new Error(`Mermaid file not found: ${inputPath}`);
    }

    const code = readFileSync(inputPath, 'utf-8');
    await this.renderMermaid(code, outputPath, options);
  }

  /**
   * Generate thumbnail from HTML
   */
  async generateThumbnail(
    html: string,
    outputPath: string,
    thumbnailSize: { width: number; height: number } = { width: 200, height: 150 }
  ): Promise<void> {
    await this.renderHtml(html, outputPath, {
      width: thumbnailSize.width,
      height: thumbnailSize.height,
      scale: 1,
    });
  }

  /**
   * Render multiple charts in batch
   */
  async renderBatch(
    items: Array<{
      option: EChartsOption;
      outputPath: string;
      options?: RenderOptions;
    }>
  ): Promise<void> {
    for (const item of items) {
      await this.renderEChart(item.option, item.outputPath, item.options);
    }
  }

  /**
   * Extract SVG from Mermaid diagram
   */
  async extractMermaidSvg(code: string, theme = 'default'): Promise<string> {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
  <div class="mermaid">${code}</div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: '${theme}' });
  </script>
</body>
</html>`;

    const page = await this.createPage({ width: 1200, height: 800 });

    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.waitForSelector('.mermaid svg', { timeout: 10000 });

      const svg = await page.evaluate(`
        (() => {
          const svgEl = document.querySelector('.mermaid svg');
          return svgEl ? svgEl.outerHTML : null;
        })()
      `) as string | null;

      if (!svg) {
        throw new Error('Failed to extract SVG from Mermaid diagram');
      }

      return svg;
    } finally {
      await page.close();
    }
  }

  /**
   * Save SVG to file
   */
  async saveMermaidSvg(
    code: string,
    outputPath: string,
    theme = 'default'
  ): Promise<void> {
    const svg = await this.extractMermaidSvg(code, theme);

    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, svg);
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

/**
 * Singleton instance
 */
let instance: ImageRenderService | null = null;

/**
 * Get singleton instance
 */
export function getImageRenderService(): ImageRenderService {
  if (!instance) {
    instance = new ImageRenderService();
  }
  return instance;
}

/**
 * Close singleton instance
 */
export async function closeImageRenderService(): Promise<void> {
  if (instance) {
    await instance.close();
    instance = null;
  }
}
