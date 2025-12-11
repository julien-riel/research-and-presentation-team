/**
 * Types for stock photo integration
 *
 * Supports multiple providers: Pexels, Unsplash, Pixabay
 */

/**
 * Supported stock photo providers
 */
export type StockPhotoProvider = 'pexels' | 'unsplash' | 'pixabay';

/**
 * Image orientation filter
 */
export type ImageOrientation = 'landscape' | 'portrait' | 'square';

/**
 * Image size preset
 */
export type ImageSize = 'small' | 'medium' | 'large' | 'original';

/**
 * Search options for stock photos
 */
export interface PhotoSearchOptions {
  /** Number of results per page (default: 15, max: 80 for Pexels) */
  perPage?: number;
  /** Page number (default: 1) */
  page?: number;
  /** Filter by orientation */
  orientation?: ImageOrientation;
  /** Filter by size */
  size?: ImageSize;
  /** Filter by color (hex without #, e.g., "FF0000") */
  color?: string;
  /** Locale for search (e.g., "en-US", "fr-FR") */
  locale?: string;
}

/**
 * Available image URLs at different sizes
 */
export interface PhotoSources {
  /** Original resolution */
  original: string;
  /** Large size (max 2x resolution) */
  large: string;
  /** Medium size (~1280px) */
  medium: string;
  /** Small size (~640px) */
  small: string;
  /** Thumbnail (~280px) */
  thumbnail: string;
  /** Portrait crop */
  portrait?: string;
  /** Landscape crop */
  landscape?: string;
  /** Tiny size for previews */
  tiny?: string;
}

/**
 * Photographer/author information
 */
export interface PhotoAuthor {
  id: string;
  name: string;
  url: string;
}

/**
 * Stock photo result
 */
export interface StockPhoto {
  /** Unique photo ID */
  id: string;
  /** Provider source */
  provider: StockPhotoProvider;
  /** Photo page URL on provider's website */
  url: string;
  /** Photo description/alt text */
  description: string;
  /** Photographer information */
  photographer: PhotoAuthor;
  /** Original dimensions */
  width: number;
  /** Original dimensions */
  height: number;
  /** Aspect ratio (width/height) */
  aspectRatio: number;
  /** Average color (hex) */
  avgColor?: string;
  /** Available image URLs */
  sources: PhotoSources;
  /** License type */
  license: 'free' | 'commercial' | 'editorial';
  /** Attribution required? */
  attributionRequired: boolean;
  /** Tags/keywords */
  tags?: string[];
}

/**
 * Search result with pagination
 */
export interface PhotoSearchResult {
  /** Total results available */
  totalResults: number;
  /** Current page */
  page: number;
  /** Results per page */
  perPage: number;
  /** Has more pages? */
  hasMore: boolean;
  /** Photo results */
  photos: StockPhoto[];
  /** Next page URL (if available) */
  nextPage?: string;
}

/**
 * Download options
 */
export interface PhotoDownloadOptions {
  /** Size to download */
  size?: ImageSize;
  /** Custom width (provider will scale proportionally) */
  width?: number;
  /** Custom height (provider will scale proportionally) */
  height?: number;
}

/**
 * Download result
 */
export interface PhotoDownloadResult {
  /** Photo ID */
  photoId: string;
  /** Output file path */
  outputPath: string;
  /** Downloaded dimensions */
  width: number;
  height: number;
  /** File size in bytes */
  fileSize: number;
  /** Attribution text (if required) */
  attribution?: string;
}

/**
 * Curated/featured photos options
 */
export interface CuratedPhotosOptions {
  /** Number of results per page */
  perPage?: number;
  /** Page number */
  page?: number;
}

/**
 * Service configuration
 */
export interface StockPhotoConfig {
  /** API key (or use environment variable) */
  apiKey?: string;
  /** Provider to use */
  provider?: StockPhotoProvider;
  /** Request timeout in ms (default: 15000) */
  timeout?: number;
  /** Default search options */
  defaultSearchOptions?: Partial<PhotoSearchOptions>;
}
