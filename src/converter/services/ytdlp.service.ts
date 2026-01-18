/**
 * yt-dlp Service
 * 
 * Wrapper service for executing yt-dlp CLI commands and parsing their output.
 * Handles format listing and direct download URL retrieval.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { VideoFormat } from '../interfaces/converter.interface';
import { env } from '../../config/env.js';
import { ConverterUtils } from '../utils/ConverterUtils.js';

const execPromise = promisify(exec);

/**
 * Service that wraps yt-dlp CLI for video format and URL operations
 */
export class YtdlpService {
    private readonly COMMAND_TIMEOUT = env.YTDLP_TIMEOUT;
    private readonly YTDLP_PATH = env.YTDLP_PATH;
    private readonly options = {
        LIST_FORMATS: '-F',
        GET_DOWNLOAD_URL: '-g',
        FORMAT_SELECTION: '-f',
    }
    private logger: Console = console;

    constructor(logger: Console) {
        this.logger = logger;
    }

    /**
   * Executes yt-dlp -F command to get available formats
   * 
   * @param url - YouTube video URL
   * @returns Promise resolving to array of video formats
   * @throws Error if command execution fails or parsing fails
   */
    async getFormatOptions(url: string): Promise<VideoFormat[]> {
        try {
            this.logger.info(`[YtdlpService] Fetching formats for URL: ${url}`);

            const { stdout } = await execPromise(
                `${this.YTDLP_PATH} ${this.options.LIST_FORMATS} "${url}"`,
                { timeout: this.COMMAND_TIMEOUT }
            );

            const formats = ConverterUtils.parseFormatOutput(stdout);
            this.logger.info(`[YtdlpService] Successfully parsed ${formats.length} formats`);

            return formats;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[YtdlpService] Error fetching formats: ${errorMessage}`);
            throw new Error(`Failed to fetch video formats: ${errorMessage}`);
        }
    }

    /**
   * Executes yt-dlp -g command to get the direct download URL
   * 
   * @param url - YouTube video URL
   * @param formatId - Format ID to download
   * @returns Promise resolving to the direct download URL string
   * @throws Error if command execution fails
   */
    async getDownloadUrl(url: string, formatId: string): Promise<string> {
        try {
            this.logger.info(
                `[YtdlpService] Fetching download URL for format ${formatId} from URL: ${url}`
            );

            const { stdout } = await execPromise(
                `${this.YTDLP_PATH} ${this.options.GET_DOWNLOAD_URL} ${this.options.FORMAT_SELECTION} "${formatId}" "${url}"`,
                { timeout: this.COMMAND_TIMEOUT }
            );

            const downloadUrl = stdout.trim().split('\n')[0];

            if (!downloadUrl) {
                throw new Error('No download URL found in response');
            }

            this.logger.info(
                `[YtdlpService] Successfully retrieved download URL for format ${formatId}`
            );

            return downloadUrl;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(
                `[YtdlpService] Error fetching download URL: ${errorMessage}`
            );
            throw new Error(`Failed to fetch download URL: ${errorMessage}`);
        }
    }
}
