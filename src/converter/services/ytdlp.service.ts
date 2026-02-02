/**
 * yt-dlp Service
 * 
 * Wrapper service for executing yt-dlp CLI commands and parsing their output.
 * Handles format listing and direct download URL retrieval.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { DownloadURL, DownloadURLType, FileFormats, FormatOptions } from '../interfaces/converter.interface';
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
   * @returns Promise resolving to format options with video formats, audio formats, and supported types
   * @throws Error if command execution fails or parsing fails
   */
    async getFormatOptions(url: string): Promise<FormatOptions> {
        try {
            this.logger.info(`[YtdlpService] Fetching formats for URL: ${url}`);

            const { stdout } = await execPromise(
                `${this.YTDLP_PATH} ${this.options.LIST_FORMATS} "${url}"`,
                { timeout: this.COMMAND_TIMEOUT }
            );

            let { videoFormats, audioFormats } = ConverterUtils.parseFormatOutput(stdout);
            const supportedTypes = ConverterUtils.getSupportedTypes(videoFormats, audioFormats);
            this.logger.info(`[YtdlpService] Successfully parsed ${videoFormats.length} video formats and ${audioFormats.length} audio formats`);

            return { videoFormats, audioFormats, supportedTypes };
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
   * @param formats - Array of formats to get url to download
   * @returns Promise resolving to the direct download URL string
   * @throws Error if command execution fails
   */
    async getDownloadUrl(url: string, formats: Array<string>): Promise<Array<DownloadURL>> {
        try {
            this.logger.info(
                `[YtdlpService] Fetching download URL for formats ${formats} from URL: ${url}`
            );

            const { stdout } = await execPromise(
                `${this.YTDLP_PATH} ${this.options.GET_DOWNLOAD_URL} ${this.options.FORMAT_SELECTION} "${formats.join('+')}" "${url}"`,
                { timeout: this.COMMAND_TIMEOUT }
            );

            const downloadUrlList = stdout.trim().split('\n').map(url => this.formatDownloadUrl(url));
            if (!downloadUrlList || downloadUrlList.length === 0) {
                throw new Error('No download URL found in response');
            }

            this.logger.info(
                `[YtdlpService] Successfully retrieved download URL for format ${formats}`
            );

            return downloadUrlList;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(
                `[YtdlpService] Error fetching download URL: ${errorMessage}`
            );
            throw new Error(`Failed to fetch download URL: ${errorMessage}`);
        }
    }

    private formatDownloadUrl(url: string): DownloadURL {
        const oUrl = new URL(url);
        const searchParams = oUrl.searchParams;

        const mime = searchParams.get('mime') as string;
        const type = mime.split('/')[0];
        const format = mime.split('/')[1];
        return {
            formatNumber: Number(searchParams.get('itag') as string),
            fileFormat: format as FileFormats,
            downloadUrl: url,
            type: type as DownloadURLType,
            expire: Number(searchParams.get('expire') as string)
        } as DownloadURL;
    }
}
