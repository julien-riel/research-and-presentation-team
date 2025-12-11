/**
 * Stock Photo Module
 *
 * Provides integration with stock photo providers (Pexels, Unsplash, Pixabay)
 */

export { StockPhotoService, createStockPhotoService } from './StockPhotoService.js';

export type {
  StockPhoto,
  PhotoSearchOptions,
  PhotoSearchResult,
  PhotoDownloadOptions,
  PhotoDownloadResult,
  PhotoSources,
  PhotoAuthor,
  StockPhotoConfig,
  StockPhotoProvider,
  ImageOrientation,
  ImageSize,
  CuratedPhotosOptions,
} from '../../types/images.js';
