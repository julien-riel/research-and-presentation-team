/**
 * PPTX Dimensions Utilities
 *
 * Converts PowerPoint positions (in inches) to pixel dimensions
 * for generating correctly-sized images.
 *
 * PowerPoint 16:9 slides are 10" x 5.625"
 * Standard screen DPI is 96
 */

/**
 * PowerPoint slide dimensions in inches
 */
export const PPTX_SLIDE = {
  /** 16:9 aspect ratio */
  '16:9': { width: 10, height: 5.625 },
  /** 4:3 aspect ratio */
  '4:3': { width: 10, height: 7.5 },
  /** Widescreen 16:10 */
  '16:10': { width: 10, height: 6.25 },
} as const;

/**
 * Standard DPI for screen rendering
 */
export const SCREEN_DPI = 96;

/**
 * Position in inches (PPTX format)
 */
export interface PptxPosition {
  /** X position in inches */
  x: number;
  /** Y position in inches */
  y: number;
  /** Width in inches */
  w: number;
  /** Height in inches */
  h: number;
}

/**
 * Pixel dimensions for image rendering
 */
export interface PixelDimensions {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Scale factor applied */
  scale: number;
  /** Aspect ratio (width/height) */
  aspectRatio: number;
}

/**
 * Options for conversion
 */
export interface ConversionOptions {
  /** DPI for conversion (default: 96) */
  dpi?: number;
  /** Scale factor for high resolution (default: 2 for retina) */
  scale?: number;
  /** Round to nearest pixel (default: true) */
  round?: boolean;
}

/**
 * Convert inches to pixels
 */
export function inchesToPixels(
  inches: number,
  dpi = SCREEN_DPI,
  scale = 1
): number {
  return inches * dpi * scale;
}

/**
 * Convert PPTX position (inches) to pixel dimensions
 *
 * @param position - Position in inches (x, y, w, h)
 * @param options - Conversion options
 * @returns Pixel dimensions for image rendering
 *
 * @example
 * // For a chart that should occupy 8" x 4" in PowerPoint
 * const dims = pptxPositionToPixels({ x: 1, y: 1.2, w: 8, h: 4 });
 * // Returns: { width: 1536, height: 768, scale: 2, aspectRatio: 2 }
 */
export function pptxPositionToPixels(
  position: PptxPosition,
  options: ConversionOptions = {}
): PixelDimensions {
  const { dpi = SCREEN_DPI, scale = 2, round = true } = options;

  let width = inchesToPixels(position.w, dpi, scale);
  let height = inchesToPixels(position.h, dpi, scale);

  if (round) {
    width = Math.round(width);
    height = Math.round(height);
  }

  return {
    width,
    height,
    scale,
    aspectRatio: position.w / position.h,
  };
}

/**
 * Parse position string to PptxPosition
 *
 * @param positionStr - Position string in format "w:h" or "x,y,w,h"
 * @returns Parsed position object
 *
 * @example
 * parsePositionString("8:4") // { x: 0, y: 0, w: 8, h: 4 }
 * parsePositionString("1,1.2,8,4") // { x: 1, y: 1.2, w: 8, h: 4 }
 */
export function parsePositionString(positionStr: string): PptxPosition {
  // Format "w:h" (shorthand for dimensions only)
  if (positionStr.includes(':')) {
    const [w, h] = positionStr.split(':').map(Number);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      throw new Error(`Invalid position format: "${positionStr}". Expected "w:h" with positive numbers.`);
    }
    return { x: 0, y: 0, w, h };
  }

  // Format "x,y,w,h" (full position)
  const parts = positionStr.split(',').map((s) => parseFloat(s.trim()));

  if (parts.length === 2) {
    // Just w,h
    const [w, h] = parts;
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      throw new Error(`Invalid position format: "${positionStr}". Expected "w,h" with positive numbers.`);
    }
    return { x: 0, y: 0, w, h };
  }

  if (parts.length === 4) {
    const [x, y, w, h] = parts;
    if (parts.some(isNaN) || w <= 0 || h <= 0) {
      throw new Error(`Invalid position format: "${positionStr}". Expected "x,y,w,h" with positive w,h.`);
    }
    return { x, y, w, h };
  }

  throw new Error(
    `Invalid position format: "${positionStr}". Expected "w:h", "w,h", or "x,y,w,h".`
  );
}

/**
 * Common PPTX image presets (in inches)
 * These correspond to typical slide layouts
 */
export const PPTX_PRESETS = {
  /** Full slide width below title bar (16:9) */
  fullWidth: { x: 0.5, y: 1.2, w: 9, h: 4 },
  /** Half slide (left or right column) */
  halfSlide: { x: 0.5, y: 1.2, w: 4.3, h: 4 },
  /** Two-thirds width */
  twoThirds: { x: 0.5, y: 1.2, w: 6, h: 4 },
  /** Quarter slide (2x2 grid) */
  quarter: { x: 0.5, y: 1.2, w: 4.3, h: 2 },
  /** Small chart for KPI dashboards */
  kpiSmall: { x: 0, y: 0, w: 3, h: 2 },
  /** Medium chart */
  medium: { x: 0, y: 0, w: 5, h: 3 },
  /** Large chart */
  large: { x: 0, y: 0, w: 8, h: 4.5 },
} as const;

/**
 * Get preset dimensions in pixels
 */
export function getPresetPixels(
  presetName: keyof typeof PPTX_PRESETS,
  options: ConversionOptions = {}
): PixelDimensions {
  const position = PPTX_PRESETS[presetName];
  return pptxPositionToPixels(position, options);
}

/**
 * Suggest optimal ECharts grid configuration based on aspect ratio
 * This minimizes internal padding while keeping labels visible
 */
export function suggestEChartsGrid(
  position: PptxPosition,
  hasTitle = false,
  hasLegend = false
): {
  left: string;
  right: string;
  top: string;
  bottom: string;
  containLabel: boolean;
} {
  const aspectRatio = position.w / position.h;

  // Wider charts can have smaller horizontal margins
  const horizontalMargin = aspectRatio > 2 ? '5%' : aspectRatio > 1.5 ? '8%' : '10%';

  // Calculate top margin based on title and legend
  let topMargin = '8%';
  if (hasTitle && hasLegend) {
    topMargin = '18%';
  } else if (hasTitle || hasLegend) {
    topMargin = '12%';
  }

  // Bottom margin for axis labels
  const bottomMargin = '12%';

  return {
    left: horizontalMargin,
    right: horizontalMargin,
    top: topMargin,
    bottom: bottomMargin,
    containLabel: true,
  };
}

/**
 * Image dimensions result
 */
export interface ImageDimensions {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Aspect ratio (width/height) */
  aspectRatio: number;
}

/**
 * Centered position result for an image in a container
 */
export interface CenteredPosition {
  /** X position in inches (centered) */
  x: number;
  /** Y position in inches (centered) */
  y: number;
  /** Width in inches (scaled to fit) */
  w: number;
  /** Height in inches (scaled to fit) */
  h: number;
}

/**
 * Read image dimensions from a file buffer
 * Supports PNG and JPEG formats
 *
 * @param buffer - File buffer
 * @returns Image dimensions or null if format not supported
 */
export function getImageDimensions(buffer: Buffer): ImageDimensions | null {
  // Try PNG first
  const pngDims = getPngDimensions(buffer);
  if (pngDims) return pngDims;

  // Try JPEG
  const jpegDims = getJpegDimensions(buffer);
  if (jpegDims) return jpegDims;

  return null;
}

/**
 * Read PNG dimensions from buffer
 * PNG format: bytes 16-19 = width, bytes 20-23 = height (big-endian)
 */
function getPngDimensions(buffer: Buffer): ImageDimensions | null {
  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngSignature)) {
    return null;
  }

  // IHDR chunk starts at byte 8, width at 16, height at 20
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return {
    width,
    height,
    aspectRatio: width / height,
  };
}

/**
 * Read JPEG dimensions from buffer
 * JPEG uses SOF0/SOF2 markers to store dimensions
 */
function getJpegDimensions(buffer: Buffer): ImageDimensions | null {
  // Check JPEG signature: FF D8 FF
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    return null;
  }

  // Scan for SOF0 (0xFFC0) or SOF2 (0xFFC2) marker
  let offset = 2;
  while (offset < buffer.length - 9) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];

    // SOF0 (baseline) or SOF2 (progressive)
    if (marker === 0xc0 || marker === 0xc2) {
      // Skip marker (2) + length (2) + precision (1)
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return {
        width,
        height,
        aspectRatio: width / height,
      };
    }

    // Skip to next marker
    if (marker >= 0xc0 && marker <= 0xfe) {
      const segmentLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    } else {
      offset++;
    }
  }

  return null;
}

/**
 * Calculate centered position for an image within a container (contain mode)
 *
 * This calculates the actual position and size needed to center an image
 * within a container while preserving aspect ratio (like CSS background-size: contain).
 *
 * @param containerPosition - The container's position in inches (x, y, w, h)
 * @param imageDimensions - The image's actual dimensions
 * @returns The centered position with adjusted dimensions
 *
 * @example
 * // Image is 1600x900 (ratio 1.78), container is 9x4 (ratio 2.25)
 * // Image is taller than container, so it will be letterboxed horizontally
 * const centered = calculateCenteredPosition(
 *   { x: 0.5, y: 1.2, w: 9, h: 4 },
 *   { width: 1600, height: 900, aspectRatio: 1.78 }
 * );
 * // Returns: { x: 0.94, y: 1.2, w: 7.11, h: 4 }
 */
export function calculateCenteredPosition(
  containerPosition: PptxPosition,
  imageDimensions: ImageDimensions
): CenteredPosition {
  const containerRatio = containerPosition.w / containerPosition.h;
  const imageRatio = imageDimensions.aspectRatio;

  let scaledW: number;
  let scaledH: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > containerRatio) {
    // Image is wider than container (relative to their heights)
    // Image will touch left/right edges, letterboxed top/bottom
    scaledW = containerPosition.w;
    scaledH = containerPosition.w / imageRatio;
    offsetY = (containerPosition.h - scaledH) / 2;
  } else {
    // Image is taller than container (relative to their widths)
    // Image will touch top/bottom edges, letterboxed left/right
    scaledH = containerPosition.h;
    scaledW = containerPosition.h * imageRatio;
    offsetX = (containerPosition.w - scaledW) / 2;
  }

  return {
    x: containerPosition.x + offsetX,
    y: containerPosition.y + offsetY,
    w: scaledW,
    h: scaledH,
  };
}
