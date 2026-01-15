/**
 * Converter Service Interface
 * 
 * Defines the contract that converter service implementations must follow
 */

import type { IVideoMetadataResponse } from './videoMetadata.interface';
import type { IDownloadUrlResponse } from './downloadUrl.interface';

/**
 * Service interface for YouTube video conversion operations
 */
export interface IConverterService {
  /**
   * Fetches available video formats for a given YouTube URL
   * 
   * @param url - YouTube video URL
   * @returns Promise resolving to video metadata with available formats
   * @throws Error if URL is invalid or yt-dlp execution fails
   * 
   * @example
   * const metadata = await converterService.getFormats('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
   * console.log(metadata.formats); // Array of available formats
   */
  getFormats(url: string): Promise<IVideoMetadataResponse>;

  /**
   * Gets the direct download URL for a specific video format
   * 
   * @param url - YouTube video URL
   * @param formatId - The format ID to download (from getFormats)
   * @returns Promise resolving to download URL response
   * @throws Error if URL/format is invalid or yt-dlp execution fails
   * 
   * @example
   * const downloadUrl = await converterService.getDownloadUrl(
   *   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   *   '22'
   * );
   * console.log(downloadUrl.downloadUrl); // Direct download URL
   */
  getDownloadUrl(url: string, formatId: string): Promise<IDownloadUrlResponse>;
}
