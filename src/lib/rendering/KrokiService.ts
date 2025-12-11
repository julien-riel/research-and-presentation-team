/**
 * KrokiService - Render diagrams using Kroki API
 *
 * Kroki is a unified API for rendering diagrams from text.
 * Supports: Mermaid, PlantUML, GraphViz, D2, Structurizr, BPMN, Excalidraw, and more.
 *
 * API Documentation: https://kroki.io/
 *
 * Usage:
 *   const kroki = new KrokiService();
 *   const png = await kroki.render('mermaid', 'graph TD; A-->B', 'png');
 */

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

/**
 * Image dimensions result
 */
export interface ImageDimensions {
  width: number;
  height: number;
  ratio: number;
}

/**
 * Render result with dimensions
 */
export interface RenderResult {
  buffer: Buffer;
  dimensions?: ImageDimensions;
}

/**
 * Read PNG dimensions from buffer
 * PNG format: bytes 16-19 = width, bytes 20-23 = height (big-endian)
 */
function getPngDimensions(buffer: Buffer): ImageDimensions | null {
  // Check PNG signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngSignature)) {
    return null;
  }

  // IHDR chunk starts at byte 8, width at 16, height at 20
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const ratio = Math.round((width / height) * 100) / 100;

  return { width, height, ratio };
}

/**
 * Supported diagram types in Kroki
 */
export type KrokiDiagramType =
  | 'mermaid'
  | 'plantuml'
  | 'graphviz'
  | 'dot'
  | 'd2'
  | 'structurizr'
  | 'bpmn'
  | 'excalidraw'
  | 'ditaa'
  | 'blockdiag'
  | 'seqdiag'
  | 'actdiag'
  | 'nwdiag'
  | 'packetdiag'
  | 'rackdiag'
  | 'c4plantuml'
  | 'erd'
  | 'nomnoml'
  | 'svgbob'
  | 'vega'
  | 'vegalite'
  | 'wavedrom'
  | 'pikchr'
  | 'umlet'
  | 'bytefield'
  | 'wireviz'
  | 'symbolator';

/**
 * Supported output formats
 */
export type KrokiOutputFormat = 'png' | 'svg' | 'pdf' | 'jpeg' | 'base64';

/**
 * Kroki service options
 */
export interface KrokiOptions {
  /** Kroki server URL (default: https://kroki.io) */
  serverUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Render options
 */
export interface KrokiRenderOptions {
  /** Output format (default: png) */
  format?: KrokiOutputFormat;
  /** Use GET request with encoded URL instead of POST (useful for caching) */
  useGet?: boolean;
  /** Additional diagram options (passed as query params for some types) */
  diagramOptions?: Record<string, string>;
}

/**
 * Service for rendering diagrams via Kroki API
 */
export class KrokiService {
  private serverUrl: string;
  private timeout: number;

  constructor(options: KrokiOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://kroki.io';
    this.timeout = options.timeout || 30000;
  }

  /**
   * Encode diagram source for URL (deflate + base64url)
   */
  private encodeForUrl(source: string): string {
    const compressed = deflateSync(Buffer.from(source, 'utf-8'), { level: 9 });
    return compressed
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Build the Kroki API URL
   */
  private buildUrl(
    diagramType: KrokiDiagramType,
    format: KrokiOutputFormat,
    encodedSource?: string,
    options?: Record<string, string>
  ): string {
    let url = `${this.serverUrl}/${diagramType}/${format}`;

    if (encodedSource) {
      url += `/${encodedSource}`;
    }

    if (options && Object.keys(options).length > 0) {
      const params = new URLSearchParams(options);
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Render a diagram to the specified format
   */
  async render(
    diagramType: KrokiDiagramType,
    source: string,
    options: KrokiRenderOptions = {}
  ): Promise<Buffer> {
    const format = options.format || 'png';

    if (options.useGet) {
      // GET request with encoded URL (better for caching)
      const encoded = this.encodeForUrl(source);
      const url = this.buildUrl(diagramType, format, encoded, options.diagramOptions);

      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kroki API error (${response.status}): ${errorText}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } else {
      // POST request (simpler, no URL length limit)
      const url = this.buildUrl(diagramType, format, undefined, options.diagramOptions);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: source,
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kroki API error (${response.status}): ${errorText}`);
      }

      return Buffer.from(await response.arrayBuffer());
    }
  }

  /**
   * Render a diagram and save to file
   * Returns dimensions for PNG images
   */
  async renderToFile(
    diagramType: KrokiDiagramType,
    source: string,
    outputPath: string,
    options: KrokiRenderOptions = {}
  ): Promise<RenderResult> {
    const buffer = await this.render(diagramType, source, options);
    writeFileSync(outputPath, buffer);

    // Get dimensions for PNG format
    const format = options.format || 'png';
    const dimensions = format === 'png' ? getPngDimensions(buffer) : undefined;

    return {
      buffer,
      dimensions: dimensions || undefined,
    };
  }

  /**
   * Render a Mermaid diagram
   */
  async renderMermaid(
    source: string,
    outputPath: string,
    format: KrokiOutputFormat = 'png'
  ): Promise<void> {
    await this.renderToFile('mermaid', source, outputPath, { format });
  }

  /**
   * Render a PlantUML diagram
   */
  async renderPlantUml(
    source: string,
    outputPath: string,
    format: KrokiOutputFormat = 'png'
  ): Promise<void> {
    await this.renderToFile('plantuml', source, outputPath, { format });
  }

  /**
   * Render a GraphViz/DOT diagram
   */
  async renderGraphViz(
    source: string,
    outputPath: string,
    format: KrokiOutputFormat = 'png'
  ): Promise<void> {
    await this.renderToFile('graphviz', source, outputPath, { format });
  }

  /**
   * Render a D2 diagram
   */
  async renderD2(
    source: string,
    outputPath: string,
    format: KrokiOutputFormat = 'svg'
  ): Promise<void> {
    await this.renderToFile('d2', source, outputPath, { format });
  }

  /**
   * Render a C4 diagram (using PlantUML C4 extension)
   */
  async renderC4(
    source: string,
    outputPath: string,
    format: KrokiOutputFormat = 'png'
  ): Promise<void> {
    await this.renderToFile('c4plantuml', source, outputPath, { format });
  }

  /**
   * Render an Excalidraw diagram
   */
  async renderExcalidraw(
    source: string,
    outputPath: string,
    format: KrokiOutputFormat = 'svg'
  ): Promise<void> {
    await this.renderToFile('excalidraw', source, outputPath, { format });
  }

  /**
   * Check if Kroki server is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get supported diagram types
   */
  static getSupportedTypes(): KrokiDiagramType[] {
    return [
      'mermaid',
      'plantuml',
      'graphviz',
      'dot',
      'd2',
      'structurizr',
      'bpmn',
      'excalidraw',
      'ditaa',
      'blockdiag',
      'seqdiag',
      'actdiag',
      'nwdiag',
      'packetdiag',
      'rackdiag',
      'c4plantuml',
      'erd',
      'nomnoml',
      'svgbob',
      'vega',
      'vegalite',
      'wavedrom',
      'pikchr',
      'umlet',
      'bytefield',
      'wireviz',
      'symbolator',
    ];
  }

  /**
   * Map file extensions to diagram types
   */
  static getDiagramTypeFromExtension(ext: string): KrokiDiagramType | null {
    const mapping: Record<string, KrokiDiagramType> = {
      '.mmd': 'mermaid',
      '.mermaid': 'mermaid',
      '.puml': 'plantuml',
      '.plantuml': 'plantuml',
      '.pu': 'plantuml',
      '.dot': 'graphviz',
      '.gv': 'graphviz',
      '.d2': 'd2',
      '.excalidraw': 'excalidraw',
      '.ditaa': 'ditaa',
      '.bpmn': 'bpmn',
      '.erd': 'erd',
      '.nomnoml': 'nomnoml',
    };
    return mapping[ext.toLowerCase()] || null;
  }
}

/**
 * Default Kroki service instance
 */
export const krokiService = new KrokiService();
