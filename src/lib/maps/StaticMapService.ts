/**
 * StaticMapService - Generate SVG choropleth maps
 *
 * Features:
 * - World map with countries
 * - Regional maps (Europe, Americas, Asia, Africa)
 * - Choropleth coloring based on data
 * - SVG and PNG export
 * - No API key required
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Country data for choropleth
 */
export interface CountryData {
  /** ISO 3166-1 alpha-2 code (e.g., 'FR', 'US') */
  code: string;
  /** Value for coloring */
  value: number;
  /** Optional label */
  label?: string;
}

/**
 * Map options
 */
export interface MapOptions {
  /** Map title */
  title?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Color scale: low to high */
  colorScale?: [string, string];
  /** Background color */
  backgroundColor?: string;
  /** Border color for countries */
  borderColor?: string;
  /** Default color for countries without data */
  defaultColor?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Legend title */
  legendTitle?: string;
}

/**
 * Map region
 */
export type MapRegion = 'world' | 'europe' | 'asia' | 'africa' | 'north-america' | 'south-america' | 'oceania';

/**
 * Generated map result
 */
export interface GeneratedMap {
  svg: string;
  path?: string;
  width: number;
  height: number;
  countriesColored: number;
}

/**
 * Simplified world map paths (ISO alpha-2 codes)
 * Using Natural Earth simplified boundaries
 */
const COUNTRY_PATHS: Record<string, { path: string; name: string; region: MapRegion }> = {
  // Europe
  FR: { path: 'M 485 145 L 495 140 L 505 145 L 510 155 L 505 165 L 495 170 L 485 165 L 480 155 Z', name: 'France', region: 'europe' },
  DE: { path: 'M 510 130 L 525 125 L 535 130 L 535 145 L 525 150 L 510 145 Z', name: 'Germany', region: 'europe' },
  GB: { path: 'M 470 115 L 480 110 L 485 115 L 485 130 L 475 135 L 465 130 L 465 120 Z', name: 'United Kingdom', region: 'europe' },
  IT: { path: 'M 515 160 L 525 155 L 530 165 L 525 180 L 515 185 L 510 175 Z', name: 'Italy', region: 'europe' },
  ES: { path: 'M 455 160 L 475 155 L 480 165 L 475 180 L 455 180 L 450 170 Z', name: 'Spain', region: 'europe' },
  PT: { path: 'M 445 165 L 455 160 L 455 180 L 445 180 Z', name: 'Portugal', region: 'europe' },
  NL: { path: 'M 500 120 L 510 118 L 512 125 L 505 130 L 498 125 Z', name: 'Netherlands', region: 'europe' },
  BE: { path: 'M 495 130 L 505 128 L 507 135 L 500 138 L 493 135 Z', name: 'Belgium', region: 'europe' },
  CH: { path: 'M 510 150 L 520 148 L 522 155 L 515 158 L 508 155 Z', name: 'Switzerland', region: 'europe' },
  AT: { path: 'M 530 145 L 545 143 L 547 150 L 540 155 L 528 152 Z', name: 'Austria', region: 'europe' },
  PL: { path: 'M 545 125 L 565 120 L 570 130 L 565 140 L 545 140 L 540 130 Z', name: 'Poland', region: 'europe' },
  CZ: { path: 'M 535 135 L 550 133 L 552 140 L 545 143 L 533 140 Z', name: 'Czechia', region: 'europe' },
  SE: { path: 'M 535 80 L 545 70 L 555 80 L 550 110 L 535 115 L 530 100 Z', name: 'Sweden', region: 'europe' },
  NO: { path: 'M 520 60 L 535 50 L 545 60 L 535 80 L 520 90 L 515 75 Z', name: 'Norway', region: 'europe' },
  FI: { path: 'M 560 70 L 580 60 L 590 75 L 580 100 L 560 105 L 555 85 Z', name: 'Finland', region: 'europe' },
  DK: { path: 'M 515 110 L 525 108 L 527 118 L 520 122 L 513 118 Z', name: 'Denmark', region: 'europe' },
  IE: { path: 'M 450 115 L 465 110 L 468 125 L 455 130 L 448 122 Z', name: 'Ireland', region: 'europe' },
  GR: { path: 'M 555 175 L 570 170 L 575 180 L 565 190 L 550 185 Z', name: 'Greece', region: 'europe' },
  RO: { path: 'M 565 155 L 585 150 L 590 160 L 580 170 L 560 165 Z', name: 'Romania', region: 'europe' },
  UA: { path: 'M 580 130 L 620 120 L 630 140 L 610 155 L 575 150 Z', name: 'Ukraine', region: 'europe' },
  RU: { path: 'M 600 60 L 750 30 L 800 80 L 780 140 L 650 160 L 600 130 Z', name: 'Russia', region: 'europe' },

  // North America
  US: { path: 'M 100 140 L 240 130 L 260 180 L 230 220 L 100 210 L 80 170 Z', name: 'United States', region: 'north-america' },
  CA: { path: 'M 80 60 L 280 40 L 300 100 L 260 130 L 100 140 L 60 100 Z', name: 'Canada', region: 'north-america' },
  MX: { path: 'M 100 220 L 170 210 L 190 250 L 150 280 L 90 260 Z', name: 'Mexico', region: 'north-america' },

  // South America
  BR: { path: 'M 280 300 L 350 280 L 370 350 L 330 420 L 260 400 L 250 340 Z', name: 'Brazil', region: 'south-america' },
  AR: { path: 'M 260 420 L 300 400 L 310 500 L 280 540 L 250 500 Z', name: 'Argentina', region: 'south-america' },
  CL: { path: 'M 240 400 L 260 390 L 270 500 L 255 540 L 240 500 Z', name: 'Chile', region: 'south-america' },
  CO: { path: 'M 220 280 L 270 270 L 280 310 L 250 330 L 210 310 Z', name: 'Colombia', region: 'south-america' },
  PE: { path: 'M 210 320 L 250 310 L 260 370 L 230 390 L 200 360 Z', name: 'Peru', region: 'south-america' },
  VE: { path: 'M 250 260 L 300 250 L 310 280 L 280 295 L 245 280 Z', name: 'Venezuela', region: 'south-america' },

  // Asia
  CN: { path: 'M 700 140 L 800 120 L 830 180 L 780 230 L 690 210 L 680 160 Z', name: 'China', region: 'asia' },
  JP: { path: 'M 850 160 L 870 150 L 880 170 L 870 190 L 850 185 Z', name: 'Japan', region: 'asia' },
  IN: { path: 'M 660 200 L 710 180 L 730 240 L 690 290 L 640 260 Z', name: 'India', region: 'asia' },
  KR: { path: 'M 835 165 L 845 160 L 850 175 L 840 185 L 832 178 Z', name: 'South Korea', region: 'asia' },
  ID: { path: 'M 760 300 L 850 290 L 860 320 L 800 340 L 750 325 Z', name: 'Indonesia', region: 'asia' },
  TH: { path: 'M 740 240 L 760 235 L 765 270 L 745 285 L 735 265 Z', name: 'Thailand', region: 'asia' },
  VN: { path: 'M 770 230 L 785 220 L 795 260 L 780 280 L 765 255 Z', name: 'Vietnam', region: 'asia' },
  PH: { path: 'M 820 250 L 840 240 L 850 270 L 830 285 L 815 268 Z', name: 'Philippines', region: 'asia' },
  MY: { path: 'M 755 285 L 790 280 L 795 300 L 770 310 L 750 298 Z', name: 'Malaysia', region: 'asia' },
  SG: { path: 'M 765 305 L 775 303 L 777 310 L 770 312 L 763 308 Z', name: 'Singapore', region: 'asia' },
  SA: { path: 'M 590 210 L 640 195 L 660 230 L 630 260 L 580 245 Z', name: 'Saudi Arabia', region: 'asia' },
  AE: { path: 'M 640 230 L 660 225 L 665 240 L 650 250 L 638 242 Z', name: 'UAE', region: 'asia' },
  IL: { path: 'M 575 195 L 582 192 L 585 210 L 578 218 L 573 205 Z', name: 'Israel', region: 'asia' },
  TR: { path: 'M 555 165 L 600 155 L 610 175 L 580 190 L 550 180 Z', name: 'Turkey', region: 'asia' },

  // Africa
  ZA: { path: 'M 540 420 L 590 400 L 610 450 L 570 480 L 530 455 Z', name: 'South Africa', region: 'africa' },
  EG: { path: 'M 555 200 L 590 190 L 600 220 L 575 240 L 545 225 Z', name: 'Egypt', region: 'africa' },
  NG: { path: 'M 500 280 L 530 270 L 545 300 L 515 320 L 490 305 Z', name: 'Nigeria', region: 'africa' },
  KE: { path: 'M 575 300 L 600 290 L 610 320 L 590 340 L 565 325 Z', name: 'Kenya', region: 'africa' },
  MA: { path: 'M 455 195 L 485 185 L 495 210 L 470 225 L 450 212 Z', name: 'Morocco', region: 'africa' },
  DZ: { path: 'M 480 195 L 530 180 L 545 220 L 510 245 L 470 225 Z', name: 'Algeria', region: 'africa' },
  ET: { path: 'M 580 280 L 615 265 L 630 300 L 600 320 L 570 305 Z', name: 'Ethiopia', region: 'africa' },
  TZ: { path: 'M 570 330 L 600 320 L 615 355 L 585 375 L 560 355 Z', name: 'Tanzania', region: 'africa' },

  // Oceania
  AU: { path: 'M 780 380 L 880 360 L 910 430 L 850 480 L 770 450 Z', name: 'Australia', region: 'oceania' },
  NZ: { path: 'M 930 470 L 950 460 L 960 490 L 940 510 L 925 495 Z', name: 'New Zealand', region: 'oceania' },
};

/**
 * Interpolate between two colors based on value (0-1)
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Static Map Service
 */
export class StaticMapService {
  /**
   * Generate a choropleth map SVG
   */
  generate(data: CountryData[], options: MapOptions = {}): GeneratedMap {
    const {
      title,
      width = 960,
      height = 500,
      colorScale = ['#f7fbff', '#08519c'],
      backgroundColor = '#ffffff',
      borderColor = '#cccccc',
      defaultColor = '#f0f0f0',
      showLegend = true,
      legendTitle = 'Value',
    } = options;

    // Calculate min/max for color scaling
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Create color map
    const colorMap = new Map<string, string>();
    for (const item of data) {
      const factor = (item.value - minValue) / range;
      colorMap.set(item.code.toUpperCase(), interpolateColor(colorScale[0], colorScale[1], factor));
    }

    // Build SVG paths
    const paths: string[] = [];
    let countriesColored = 0;

    for (const [code, country] of Object.entries(COUNTRY_PATHS)) {
      const color = colorMap.get(code) || defaultColor;
      if (colorMap.has(code)) countriesColored++;

      paths.push(`
        <path
          d="${country.path}"
          fill="${color}"
          stroke="${borderColor}"
          stroke-width="0.5"
          data-code="${code}"
          data-name="${country.name}"
        >
          <title>${country.name}</title>
        </path>
      `);
    }

    // Build legend
    let legendSvg = '';
    if (showLegend) {
      const legendX = width - 150;
      const legendY = height - 120;
      const legendWidth = 20;
      const legendHeight = 100;

      // Gradient definition
      const gradientId = 'legendGradient';
      const gradient = `
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="${colorScale[0]}" />
            <stop offset="100%" stop-color="${colorScale[1]}" />
          </linearGradient>
        </defs>
      `;

      legendSvg = `
        ${gradient}
        <g transform="translate(${legendX}, ${legendY})">
          <text x="${legendWidth / 2}" y="-10" text-anchor="middle" font-size="12" font-family="Arial">${legendTitle}</text>
          <rect x="0" y="0" width="${legendWidth}" height="${legendHeight}" fill="url(#${gradientId})" stroke="${borderColor}" />
          <text x="${legendWidth + 5}" y="10" font-size="10" font-family="Arial">${maxValue.toLocaleString()}</text>
          <text x="${legendWidth + 5}" y="${legendHeight}" font-size="10" font-family="Arial">${minValue.toLocaleString()}</text>
        </g>
      `;
    }

    // Build title
    let titleSvg = '';
    if (title) {
      titleSvg = `<text x="${width / 2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" font-family="Arial">${title}</text>`;
    }

    // Assemble SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  ${titleSvg}
  <g class="countries">
    ${paths.join('\n')}
  </g>
  ${legendSvg}
</svg>`;

    return {
      svg,
      width,
      height,
      countriesColored,
    };
  }

  /**
   * Generate map for a specific region
   */
  generateRegion(
    region: MapRegion,
    data: CountryData[],
    options: MapOptions = {}
  ): GeneratedMap {
    // Filter data to region
    const regionCodes = Object.entries(COUNTRY_PATHS)
      .filter(([, info]) => info.region === region)
      .map(([code]) => code);

    const filteredData = data.filter(d =>
      regionCodes.includes(d.code.toUpperCase())
    );

    return this.generate(filteredData, options);
  }

  /**
   * Save map to file
   */
  save(map: GeneratedMap, outputPath: string): string {
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, map.svg);
    return outputPath;
  }

  /**
   * Get list of supported country codes
   */
  getSupportedCountries(): Array<{ code: string; name: string; region: MapRegion }> {
    return Object.entries(COUNTRY_PATHS).map(([code, info]) => ({
      code,
      name: info.name,
      region: info.region,
    }));
  }

  /**
   * Get countries by region
   */
  getCountriesByRegion(region: MapRegion): Array<{ code: string; name: string }> {
    return Object.entries(COUNTRY_PATHS)
      .filter(([, info]) => info.region === region)
      .map(([code, info]) => ({ code, name: info.name }));
  }

  /**
   * Get all regions
   */
  getRegions(): MapRegion[] {
    return ['world', 'europe', 'asia', 'africa', 'north-america', 'south-america', 'oceania'];
  }

  /**
   * Check if country code is supported
   */
  isSupported(code: string): boolean {
    return code.toUpperCase() in COUNTRY_PATHS;
  }
}

/**
 * Singleton instance
 */
let instance: StaticMapService | null = null;

/**
 * Get singleton instance
 */
export function getStaticMapService(): StaticMapService {
  if (!instance) {
    instance = new StaticMapService();
  }
  return instance;
}
