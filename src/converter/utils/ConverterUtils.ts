import type { VideoFormat } from '../interfaces/converter.interface.js';

/**
 * YtdlpUtils - Static utility functions for yt-dlp operations
 * 
 * This class contains only static methods and cannot be instantiated.
 * It provides parsing utilities for yt-dlp CLI output.
 */
export class ConverterUtils {
    /**
     * Private constructor to prevent instantiation
     */
    private constructor() {
        throw new Error('YtdlpUtils is a utility class and cannot be instantiated');
    }

    /**
     * Parses the output from yt-dlp -F command into an array of format objects
     * 
     * Output format is a table like:
     * ID  EXT   RESOLUTION  FPS  CH  TBR  PROTO  VCODEC           ACODEC      FORMAT
     * 18  mp4   360x640     30      96  http   mpeg4            aac         360p
     * 22  mp4   1280x720    30      192 https  h264             aac         720p hd
     * 
     * @param output - Raw output from yt-dlp -F command
     * @returns Array of parsed video formats
     */
    static parseFormatOutput(output: string): VideoFormat[] {
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
            const format = ConverterUtils.parseFormatLine(trimmedLine);
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
    static parseFormatLine(line: string): VideoFormat | null {
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
            return null;
        }
    }

        /**
   * Validates YouTube URL format
   * 
   * @param url - URL to validate
   * @throws Error if URL is not valid
   */
    public static validateUrl(url: string): void {
        if (!url || typeof url !== 'string') {
            throw new Error('URL must be a non-empty string');
        }

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
    public static extractVideoId(url: string): string | null {
        let match = url.match(/[?&]v=([^&\s?]+)/);
        if (match && match[1]) {
            return match[1];
        }

        match = url.match(/youtu\.be\/([^?&\s]+)/);
        if (match && match[1]) {
            return match[1];
        }

        return null;
    }
}