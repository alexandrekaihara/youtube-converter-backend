/**
 * Converter Service Interface Definition
 * 
 * Defines the contract for the converter service
 */

interface VideoFormat {
  id: string;
  ext: string;
  resolution?: string;
  fps?: number;
  filesize?: string;
  vcodec?: string;
  acodec?: string;
  tbr?: string;
  protocol?: string;
  format_note?: string;
}

interface VideoMetadataResponse {
  videoId: string;
  formats: VideoFormat[];
  timestamp: Date;
}

interface DownloadUrlResponse {
  videoId: string;
  formatId: string;
  downloadUrl: string;
  timestamp: Date;
}

/**
 * Service interface for YouTube video conversion operations
 */
export abstract class ConverterInterface {
  /**
   * Fetches available video formats for a given YouTube URL
   * 
   * @param url - YouTube video URL
   * @returns Promise resolving to video metadata with available formats
   * @throws Error if URL is invalid or yt-dlp execution fails
   */
  abstract getFormats(url: string): Promise<VideoMetadataResponse>;

  /**
   * Gets the direct download URL for a specific video format
   * 
   * @param url - YouTube video URL
   * @param formatId - The format ID to download (from getFormats)
   * @returns Promise resolving to download URL response
   * @throws Error if URL/format is invalid or yt-dlp execution fails
   */
  abstract getDownloadUrl(url: string, formatId: string): Promise<DownloadUrlResponse>;
}
