import type { AudioFormat, SupportedFormatType, VideoFormat } from '../interfaces/converter.interface.js';

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
    static parseFormatOutput(output: string): { videoFormats: VideoFormat[], audioFormats: AudioFormat[] } {
        const lines = output.split('\n');
        const videoFormats: VideoFormat[] = [];
        const audioFormats: AudioFormat[] = [];

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
            line.includes('audio only') ?
                audioFormats.push(ConverterUtils.parseFormatLine(trimmedLine) as AudioFormat) :
                videoFormats.push(ConverterUtils.parseFormatLine(trimmedLine) as VideoFormat);
        }

        return { videoFormats, audioFormats };
    }

    static formatTbr(tbr: string): string {
        if (tbr.match(/^\d+\.?\d*M$/i)) {
            return tbr.replace(/M$/i, ' Mbps');
        }
        return tbr.replace(/k$/i, ' kbps');
    }

    /**
     * Parses a single format line from yt-dlp output
     * 
     * @param line - Single line from yt-dlp -F output
     * @returns Parsed format object or null if parsing fails
     */
    static parseFormatLine<T extends VideoFormat | AudioFormat>(line: string): T | null {
        try {
            // Remove leading/trailing whitespace
            const cleanedLine = line.trim();
            
            // Split by pipe (|) to separate sections
            const sections = cleanedLine.split('|');
            
            if (sections.length === 0 || !sections[0]) {
                return null;
            }

            // Parse the first section (ID, EXT, RESOLUTION, FPS, CH)
            const firstSection = sections[0].trim().split(/\s+/);
            
            if (firstSection.length < 2) {
                return null;
            }

            const format: T = {
                id: firstSection[0] || '',
                ext: firstSection[1] || '',
                requiresAd: false
            } as T;

            // Parse optional fields from first section
            for (let i = 2; i < firstSection.length; i++) {
                const part = firstSection[i];
                if (!part) {
                    continue;
                }

                // Check for resolution (e.g., 1920x1080, 720p)
                if (part.match(/^\d+x\d+$/)) {
                    (format as VideoFormat).resolution = ConverterUtils.formatResolution(part);
                    (format as VideoFormat).resolutionLabel = ConverterUtils.getResolutionLabel((format as VideoFormat).resolution as string);
                }
                // Check for FPS
                else if (part.match(/^\d+fps?$/i)) {
                    (format as VideoFormat).fps = parseInt(part, 10);
                }
            }

            // Parse the second section if it exists (FILESIZE, TBR, PROTO)
            if (sections.length > 1 && sections[1]) {
                const secondSection = sections[1].trim().split(/\s+/);
                
                // Extract FILESIZE and TBR from the second section
                for (let i = 0; i < secondSection.length; i++) {
                    const part = secondSection[i];
                    if (!part) {
                        continue;
                    }

                    // Check for filesize (e.g., 2.91MiB, 100KB)
                    if (part.match(/^\d+\.?\d*\s*(MiB|KiB|GiB|KB|MB|GB)$/i)) {
                        format.filesize = ConverterUtils.formatFilesize(part);
                    }
                    // Check for TBR (e.g., 49k, 49K, 129k, 1M, 1m, 2.5M)
                    else if (part.match(/^\d+\.?\d*[km]$/i)) {
                        (format as AudioFormat).tbrLabel = ConverterUtils.getTbrLabel(part);
                        (format as AudioFormat).tbr = ConverterUtils.formatTbr(part);
                    }
                    // Check for protocol
                    else if (part.match(/^(http|https|mhtml)$/i)) {
                        format.protocol = part;
                    }
                }
            }

            // Parse the third section if it exists (VCODEC, VBR, ACODEC, ABR, etc)
            if (sections.length > 2 && sections[2]) {
                const thirdSection = sections[2].trim().split(/\s+/);
                
                for (let i = 0; i < thirdSection.length; i++) {
                    const part = thirdSection[i];
                    if (!part) {
                        continue;
                    }

                    // Check for video codec (common patterns)
                    if (part.match(/^(images|h264|h265|vp8|vp9|avc|mpeg4|av1)$/i) && !(format as VideoFormat).vcodec) {
                        (format as VideoFormat).vcodec = part;
                    }
                    // Check for audio codec
                    else if (part.match(/^(mp4a|opus|aac|vorbis|flac)$/i) && !(format as AudioFormat).acodec) {
                        (format as AudioFormat).acodec = part;
                    }
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


    /**
     * Formats resolution string from "WIDTHxHEIGHT" format to "HEIGHTp" format
     * Supports common video resolutions with ranges:
     * - 144p: height <= 144
     * - 240p: 145 <= height <= 288
     * - 360p: 289 <= height <= 432
     * - 480p: 433 <= height <= 576
     * - 720p: 577 <= height <= 864
     * - 1080p: 865 <= height <= 1296
     * - 1440p: 1297 <= height <= 2016
     * - 2160p (4K): 2017 <= height <= 3024
     * - 4320p (8K): height > 3024
     * 
     * @param resolution - Resolution string in format "WIDTHxHEIGHT" (e.g., "1920x1080")
     * @returns Formatted resolution string (e.g., "1080p") or original string if format is invalid
     */
    static formatResolution(resolution: string): string {
        const match = resolution.match(/^(\d+)x(\d+)$/i);
        if (!match || !match[2]) {
            return resolution;
        }

        const height = parseInt(match[2], 10);

        if (height <= 144) {
            return '144p';
        } else if (height <= 288) {
            return '240p';
        } else if (height <= 432) {
            return '360p';
        } else if (height <= 576) {
            return '480p';
        } else if (height <= 864) {
            return '720p';
        } else if (height <= 1296) {
            return '1080p';
        } else if (height <= 2016) {
            return '1440p';
        } else if (height <= 3024) {
            return '2160p';
        } else {
            return '4320p';
        }
    }

    /**
     * Returns a friendly human-readable description for a given resolution label
     * 
     * @param resolution - Resolution label (e.g., "1080p", "720p")
     * @returns Friendly description string (e.g., "Full HD", "HD Ready")
     */
    static getResolutionLabel(resolution: string): string {
        const resolutionMap: Record<string, string> = {
            '144p': 'Low Quality',
            '240p': 'Low Quality',
            '360p': 'Standard',
            '480p': 'SD Quality',
            '720p': 'HD Ready',
            '1080p': 'Full HD',
            '1440p': '2K Quality',
            '2160p': '4K Quality',
            '4320p': '8K Quality'
        };

        return resolutionMap[resolution] || resolution;
    }

    /**
     * Determines supported format types based on available video and audio formats
     * 
     * @param videoFormats - Array of available video formats
     * @param audioFormats - Array of available audio formats
     * @returns Array of supported format types
     */
    static getSupportedTypes(videoFormats: VideoFormat[], audioFormats: AudioFormat[]): SupportedFormatType[] {
        const supportedTypes: SupportedFormatType[] = [];
        const hasAudio = audioFormats.length > 0;
        const hasVideo = videoFormats.length > 0;
        const hasMp4Video = videoFormats.some(format => format.ext === 'mp4');
        const hasWebmVideo = videoFormats.some(format => format.ext === 'webm');
        const hasM4aAudio = audioFormats.some(format => format.ext === 'm4a');

        if (hasAudio) { supportedTypes.push({ id: 'mp3', label: 'MP3', description: 'Audio only', popular: true }); }
        if (hasVideo && hasMp4Video) { supportedTypes.push({ id: 'mp4', label: 'MP4', description: 'Video + Audio', popular: true }); }
        if (hasVideo) { supportedTypes.push({ id: 'advanced', label: 'Advanced', description: 'Custom quality settings', badge: 'Advanced' }); }
        if (hasVideo && hasWebmVideo) { supportedTypes.push({ id: 'webm', label: 'WebM', description: 'Web optimized' }); }
        if (hasM4aAudio) { supportedTypes.push({ id: 'm4a', label: 'M4A', description: 'Audio only' }); }

        return supportedTypes;
    }


    /**
     * Converts file size format from binary units (MiB, KiB, GiB) to decimal units (MB, KB, GB)
     * 
     * @param filesize - File size string in format "1.41MiB" or "100KiB"
     * @returns Formatted file size string with space (e.g., "1.48 MB", "102.4 KB")
     */
    static formatFilesize(filesize: string): string {
        const match = filesize.match(/^(\d+\.?\d*)\s*(MiB|KiB|GiB)$/i);
        if (!match || !match[1] || !match[2]) { return filesize; }

        let size = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        // Convert binary to decimal units
        const conversionMap: Record<string, { multiplier: number; unit: string }> = {
            'MIB': { multiplier: 1.048576, unit: 'MB' },
            'KIB': { multiplier: 1.024, unit: 'KB' },
            'GIB': { multiplier: 1.073741824, unit: 'GB' }
        };

        const conversion = conversionMap[unit];
        if (conversion) {
            size = size * conversion.multiplier;
            return `${size.toFixed(2)} ${conversion.unit}`;
        }

        return filesize;
    }

    /**
     * Returns a friendly human-readable description for a given bitrate
     * 
     * @param tbr - Bitrate string (e.g., "49k", "129k", "256k", "1M", "2.5M")
     * @returns Friendly description string (e.g., "Standard", "High", "Best")
     */
    static getTbrLabel(tbr: string): string {
        const matchK = tbr.match(/^(\d+\.?\d*)k$/i);
        const matchM = tbr.match(/^(\d+\.?\d*)M$/i);
        
        let kbps: number;
        
        if (matchK && matchK[1]) {
            kbps = parseFloat(matchK[1]);
        } else if (matchM && matchM[1]) {
            kbps = parseFloat(matchM[1]) * 1000; // Convert Mbps to kbps
        } else {
            return 'Unknown';
        }

        if (kbps < 100) {
            return 'Standard';
        } else {
            return 'High';
        }
    }
}