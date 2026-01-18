/**
 * YouTube Converter Service Implementation
 * 
 * Main converter service that orchestrates yt-dlp service and formats responses
 */

import { YtdlpService } from './ytdlp.service.js';
import { ConverterService, type DownloadUrlResponse, type VideoMetadataResponse } from '../interfaces/converter.interface.js';
import type { CacheService } from '../interfaces/cache.interface.js';
import { ConverterUtils } from '../utils/ConverterUtils.js';

/**
 * Main converter service that orchestrates yt-dlp service calls
 */
export class YoutubeConverterImpl extends ConverterService {
    private static readonly FORMAT_CACHE_TTL: number = 30 * 24 * 60 * 60;
    private ytdlpService: YtdlpService;
    private cache: CacheService;
    private logger: Console;

    /**
   * Constructor that injects ytdlpService, cache, and logger
   * 
   * @param ytdlpService - The yt-dlp service instance
   * @param cache - The cache service instance implementing CacheService
   * @param cacheTtl - Cache time-to-live in seconds
   * @param logger - Logger instance for debugging
   */
    constructor(ytdlpService: YtdlpService, cache: CacheService, logger: Console = console) {
        super();
        this.ytdlpService = ytdlpService;
        this.cache = cache;
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

            ConverterUtils.validateUrl(url);

            const videoId = ConverterUtils.extractVideoId(url);
            if (!videoId) {
                throw new Error('Could not extract valid video ID from URL');
            }

            const cacheKey = `formats:${videoId}`;
            const cachedFormats = await this.cache.get<VideoMetadataResponse>(cacheKey);
            if (cachedFormats) {
                this.logger.info(`[YoutubeConverterImpl] Cache hit for formats of video ${videoId}`);
                return cachedFormats;
            }

            const formats = await this.ytdlpService.getFormatOptions(url);

            const response: VideoMetadataResponse = {
                videoId,
                formats,
                timestamp: new Date(),
            };

            await this.cache.set<VideoMetadataResponse>(cacheKey, response, YoutubeConverterImpl.FORMAT_CACHE_TTL);

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

            ConverterUtils.validateUrl(url);
            if (!formatId || typeof formatId !== 'string') {
                throw new Error('Invalid format ID provided');
            }

            const videoId = ConverterUtils.extractVideoId(url);
            if (!videoId) {
                throw new Error('Could not extract valid video ID from URL');
            }

            const downloadUrl = await this.ytdlpService.getDownloadUrl(url, formatId);

            const response: DownloadUrlResponse = { videoId, formatId, downloadUrl, timestamp: new Date() };
            
            this.logger.info( `[YoutubeConverterImpl] Successfully retrieved download URL for format ${formatId}`);
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[YoutubeConverterImpl] Error getting download URL: ${errorMessage}`);
            throw error;
        }
    }
}
