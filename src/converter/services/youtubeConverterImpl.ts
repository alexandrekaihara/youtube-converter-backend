/**
 * YouTube Converter Service Implementation
 * 
 * Main converter service that orchestrates yt-dlp service and formats responses
 */

import { YtdlpService } from './ytdlp.service.js';
import { ConverterInterface } from './converter.interface.js';

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
 * Main converter service that orchestrates yt-dlp service calls
 */
export class YoutubeConverterImpl extends ConverterInterface {
  private ytdlpService: YtdlpService;
  private logger: Console;

  /**
   * Constructor that injects ytdlpService and logger
   * 
   * @param ytdlpService - The yt-dlp service instance
   * @param logger - Logger instance for debugging
   */
  constructor(ytdlpService?: YtdlpService, logger: Console = console) {
    super();
    this.ytdlpService = ytdlpService || new YtdlpService();
    this.logger = logger;
  }

  /**
   * Fetches available video formats for a given YouTube URL
   * 
   * @param url - YouTube video URL
   * @returns IVideoMetadataResponse with available formats
   * @throws Error if URL is invalid or yt-dlp execution fails
   */
  async getFormats(url: string): Promise<VideoMetadataResponse> {
    try {
      this.logger.info(`[YoutubeConverterImpl] Getting formats for URL: ${url}`);

      // Validate input URL
      this.validateUrl(url);

      // Extract video ID from URL
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Could not extract valid video ID from URL');
      }

      // Execute yt-dlp -F command
      const formats = await this.ytdlpService.getFormatOptions(url);

      // Format and return response
      const response: VideoMetadataResponse = {
        videoId,
        formats,
        timestamp: new Date(),
      };

      this.logger.info(
        `[YoutubeConverterImpl] Successfully retrieved ${formats.length} formats for video ${videoId}`
      );

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[YoutubeConverterImpl] Error getting formats: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gets the direct download URL for a specific video format
   * 
   * @param url - YouTube video URL
   * @param formatId - The format ID to download
   * @returns IDownloadUrlResponse with download URL
   * @throws Error if URL/format is invalid or yt-dlp execution fails
   */
  async getDownloadUrl(url: string, formatId: string): Promise<DownloadUrlResponse> {
    try {
      this.logger.info(
        `[YoutubeConverterImpl] Getting download URL for format ${formatId} from URL: ${url}`
      );

      // Validate input parameters
      this.validateUrl(url);
      if (!formatId || typeof formatId !== 'string') {
        throw new Error('Invalid format ID provided');
      }

      // Extract video ID from URL
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Could not extract valid video ID from URL');
      }

      // Execute yt-dlp -g command
      const downloadUrl = await this.ytdlpService.getDownloadUrl(url, formatId);

      // Format and return response
      const response: DownloadUrlResponse = {
        videoId,
        formatId,
        downloadUrl,
        timestamp: new Date(),
      };

      this.logger.info(
        `[YoutubeConverterImpl] Successfully retrieved download URL for format ${formatId}`
      );

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[YoutubeConverterImpl] Error getting download URL: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Validates YouTube URL format
   * 
   * @param url - URL to validate
   * @throws Error if URL is not valid
   */
  private validateUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }

    // Check if URL is a valid YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?youtube\.com|youtu\.be\/.+/;
    if (!youtubeRegex.test(url)) {
      throw new Error('URL must be a valid YouTube URL');
    }
  }

  /**
   * Extracts video ID from YouTube URL
   * 
   * Handles multiple YouTube URL formats:
   * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
   * - https://youtu.be/dQw4w9WgXcQ
   * - https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s
   * 
   * @param url - YouTube URL
   * @returns Extracted video ID or null if not found
   */
  private extractVideoId(url: string): string | null {
    // Match youtube.com?v=VIDEOID
    let match = url.match(/[?&]v=([^&\s?]+)/);
    if (match && match[1]) {
      return match[1];
    }

    // Match youtu.be/VIDEOID
    match = url.match(/youtu\.be\/([^?&\s]+)/);
    if (match && match[1]) {
      return match[1];
    }

    return null;
  }
}
