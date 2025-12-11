/**
 * StockPhotoService - Search and download stock photos from Pexels
 *
 * Pexels API Documentation: https://www.pexels.com/api/documentation/
 *
 * Features:
 *   - Search photos by keyword
 *   - Get curated/featured photos
 *   - Download photos in various sizes
 *   - Automatic attribution generation
 *
 * Usage:
 *   const service = new StockPhotoService();
 *   const results = await service.search('mountain landscape');
 *   await service.download(results.photos[0], 'output.jpg');
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  StockPhoto,
  PhotoSearchOptions,
  PhotoSearchResult,
  PhotoDownloadOptions,
  PhotoDownloadResult,
  PhotoSources,
  StockPhotoConfig,
  CuratedPhotosOptions,
  ImageSize,
} from '../../types/images.js';

/**
 * Pexels API response types
 */
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/**
 * Environment variable names for API keys
 */
const ENV_KEYS = {
  pexels: 'PEXELS_API_KEY',
  unsplash: 'UNSPLASH_ACCESS_KEY',
  pixabay: 'PIXABAY_API_KEY',
} as const;

/**
 * Stock Photo Service - Currently supports Pexels
 */
export class StockPhotoService {
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/v1';
  private timeout: number;
  private defaultOptions: Partial<PhotoSearchOptions>;

  constructor(config: StockPhotoConfig = {}) {
    const envKey = process.env[ENV_KEYS.pexels];
    this.apiKey = config.apiKey || envKey || '';
    this.timeout = config.timeout || 15000;
    this.defaultOptions = config.defaultSearchOptions || {};

    if (!this.apiKey) {
      throw new Error(
        `API key required. Set ${ENV_KEYS.pexels} environment variable or pass apiKey in config.`
      );
    }
  }

  /**
   * Search photos by keyword
   */
  async search(query: string, options: PhotoSearchOptions = {}): Promise<PhotoSearchResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const url = new URL(`${this.baseUrl}/search`);

    url.searchParams.append('query', query);
    url.searchParams.append('per_page', String(mergedOptions.perPage || 15));
    url.searchParams.append('page', String(mergedOptions.page || 1));

    if (mergedOptions.orientation) {
      url.searchParams.append('orientation', mergedOptions.orientation);
    }
    if (mergedOptions.size) {
      url.searchParams.append('size', mergedOptions.size);
    }
    if (mergedOptions.color) {
      url.searchParams.append('color', mergedOptions.color);
    }
    if (mergedOptions.locale) {
      url.searchParams.append('locale', mergedOptions.locale);
    }

    const response = await this.request<PexelsSearchResponse>(url.toString());
    return this.mapSearchResponse(response);
  }

  /**
   * Get curated/featured photos
   */
  async getCurated(options: CuratedPhotosOptions = {}): Promise<PhotoSearchResult> {
    const url = new URL(`${this.baseUrl}/curated`);

    url.searchParams.append('per_page', String(options.perPage || 15));
    url.searchParams.append('page', String(options.page || 1));

    const response = await this.request<PexelsSearchResponse>(url.toString());
    return this.mapSearchResponse(response);
  }

  /**
   * Get a specific photo by ID
   */
  async getPhoto(photoId: string): Promise<StockPhoto> {
    const url = `${this.baseUrl}/photos/${photoId}`;
    const response = await this.request<PexelsPhoto>(url);
    return this.mapPhoto(response);
  }

  /**
   * Download a photo to disk
   */
  async download(
    photo: StockPhoto,
    outputPath: string,
    options: PhotoDownloadOptions = {}
  ): Promise<PhotoDownloadResult> {
    const size = options.size || 'large';
    const downloadUrl = this.getDownloadUrl(photo.sources, size, options);

    const response = await fetch(downloadUrl, {
      signal: AbortSignal.timeout(this.timeout * 2), // Longer timeout for downloads
    });

    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Ensure directory exists
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, buffer);

    return {
      photoId: photo.id,
      outputPath,
      width: photo.width,
      height: photo.height,
      fileSize: buffer.length,
      attribution: this.getAttribution(photo),
    };
  }

  /**
   * Download a photo by ID
   */
  async downloadById(
    photoId: string,
    outputPath: string,
    options: PhotoDownloadOptions = {}
  ): Promise<PhotoDownloadResult> {
    const photo = await this.getPhoto(photoId);
    return this.download(photo, outputPath, options);
  }

  /**
   * Generate attribution text for a photo
   */
  getAttribution(photo: StockPhoto): string {
    return `Photo by ${photo.photographer.name} on Pexels`;
  }

  /**
   * Generate full attribution with link
   */
  getAttributionHtml(photo: StockPhoto): string {
    return `Photo by <a href="${photo.photographer.url}">${photo.photographer.name}</a> on <a href="${photo.url}">Pexels</a>`;
  }

  /**
   * Get download URL based on size preference
   */
  private getDownloadUrl(
    sources: PhotoSources,
    size: ImageSize,
    options: PhotoDownloadOptions
  ): string {
    // If custom dimensions requested, use original and let caller resize
    if (options.width || options.height) {
      return sources.original;
    }

    switch (size) {
      case 'original':
        return sources.original;
      case 'large':
        return sources.large;
      case 'medium':
        return sources.medium;
      case 'small':
        return sources.small;
      default:
        return sources.large;
    }
  }

  /**
   * Make authenticated request to Pexels API
   */
  private async request<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');

      if (response.status === 401) {
        throw new Error('Invalid API key. Check your PEXELS_API_KEY.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Pexels allows 200 requests/hour.');
      }

      throw new Error(`Pexels API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Map Pexels response to our types
   */
  private mapSearchResponse(response: PexelsSearchResponse): PhotoSearchResult {
    return {
      totalResults: response.total_results,
      page: response.page,
      perPage: response.per_page,
      hasMore: !!response.next_page,
      photos: response.photos.map((p) => this.mapPhoto(p)),
      nextPage: response.next_page,
    };
  }

  /**
   * Map Pexels photo to our type
   */
  private mapPhoto(photo: PexelsPhoto): StockPhoto {
    return {
      id: String(photo.id),
      provider: 'pexels',
      url: photo.url,
      description: photo.alt || '',
      photographer: {
        id: String(photo.photographer_id),
        name: photo.photographer,
        url: photo.photographer_url,
      },
      width: photo.width,
      height: photo.height,
      aspectRatio: photo.width / photo.height,
      avgColor: photo.avg_color,
      sources: {
        original: photo.src.original,
        large: photo.src.large2x,
        medium: photo.src.large,
        small: photo.src.medium,
        thumbnail: photo.src.small,
        portrait: photo.src.portrait,
        landscape: photo.src.landscape,
        tiny: photo.src.tiny,
      },
      license: 'free',
      attributionRequired: false, // Pexels doesn't require attribution (but appreciates it)
    };
  }

  /**
   * Check if API key is valid
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getCurated({ perPage: 1 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get API rate limit info (from response headers)
   */
  static getRateLimitInfo(): { limit: number; resetTime: string } {
    return {
      limit: 200, // Pexels allows 200 requests per hour
      resetTime: 'hourly',
    };
  }
}

/**
 * Default service instance (requires PEXELS_API_KEY env var)
 */
export const createStockPhotoService = (config?: StockPhotoConfig): StockPhotoService => {
  return new StockPhotoService(config);
};
