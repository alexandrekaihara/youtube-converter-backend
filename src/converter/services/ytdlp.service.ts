/**
 * yt-dlp Service
 * 
 * Wrapper service for executing yt-dlp CLI commands and parsing their output.
 * Handles format listing and direct download URL retrieval.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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

/**
 * Service that wraps yt-dlp CLI for video format and URL operations
 */
export class YtdlpService {
  private readonly COMMAND_TIMEOUT = 30000;
  private logger: Console = console;

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

      // Execute yt-dlp -F command with timeout
      const { stdout } = await execPromise(
        `yt-dlp -F "${url}"`,
        { timeout: this.COMMAND_TIMEOUT }
      );

      // Parse the output
      const formats = this.parseFormatOutput(stdout);
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

      // Execute yt-dlp -g command with specific format
      const { stdout } = await execPromise(
        `yt-dlp -g -f "${formatId}" "${url}"`,
        { timeout: this.COMMAND_TIMEOUT }
      );

      // Extract the URL (usually first line of output)
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

  /**
   * Parses the yt-dlp -F table format output into array of formats
   * 
   * Output format is a table like:
   * ID  EXT   RESOLUTION  FPS  CH  TBR  PROTO  VCODEC           ACODEC      FORMAT
   * 18  mp4   360x640     30      96  http   mpeg4            aac         360p
   * 22  mp4   1280x720    30      192 https  h264             aac         720p hd
   * 
   * @param output - Raw output from yt-dlp -F command
   * @returns Array of parsed video formats
   */
  private parseFormatOutput(output: string): VideoFormat[] {
    const lines = output.split('\n');
    const formats: VideoFormat[] = [];

    // Skip header lines (lines that don't start with a format ID)
    let dataStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.match(/^\s*\d+\s+/)) {
        dataStartIndex = i;
        break;
      }
    }

    // Parse each format line
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        continue;
      }

      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        continue;
      }

      // Parse the line
      const format = this.parseFormatLine(trimmedLine);
      if (format) {
        formats.push(format);
      }
    }

    return formats;
  }

  /**
   * Parses a single format line from yt-dlp output
   * 
   * @param line - Single line from yt-dlp -F output
   * @returns Parsed format object or null if parsing fails
   */
  private parseFormatLine(line: string): VideoFormat | null {
    try {
      // Split by whitespace
      const parts = line.split(/\s+/);

      if (parts.length < 2) {
        return null;
      }

      const format: VideoFormat = {
        id: parts[0] || '',
        ext: parts[1] || '',
      };

      // Parse optional fields based on their position and content
      for (let i = 2; i < parts.length; i++) {
        const part = parts[i];
        if (!part) {
          continue;
        }

        // Check for resolution (e.g., 1920x1080, 720p)
        if (part.match(/^\d+x\d+$/) || part.match(/^\d+p$/)) {
          format.resolution = part;
        }
        // Check for FPS
        else if (part.match(/^\d+fps?$/i)) {
          format.fps = parseInt(part, 10);
        }
      }

      return format;
    } catch (error) {
      this.logger.error(`[YtdlpService] Error parsing format line: ${line}`);
      return null;
    }
  }
}
