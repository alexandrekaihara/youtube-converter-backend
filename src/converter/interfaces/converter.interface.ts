/**
 * Converter Service Interface Definition
 * 
 * Defines the contract for the converter service
 */

export interface VideoFormat {
    id: string;
    ext: string;
    resolution?: string;
    resolutionLabel?: string;
    fps?: number;
    filesize?: string;
    vcodec?: string;
    acodec?: string;
    tbr?: string;
    protocol?: string;
    format_note?: string;
    requiresAd: boolean;
}

export interface AudioFormat {
    id: string;
    ext: string;
    filesize?: string;
    acodec?: string;
    tbr?: string;
    tbrLabel?: string;
    protocol?: string;
    requiresAd: boolean;
}

export interface VideoMetadataResponse {
    videoId: string;
    formats: FormatOptions;
    timestamp: Date;
}

export interface DownloadUrlResponse {
    videoId: string;
    downloadUrls: Array<DownloadURL>;
    timestamp: Date;
}

export interface DownloadURL {
    formatNumber: number,
    fileFormat: FileFormats,
    downloadUrl: string,
    type: DownloadURLType,
    expire: number
}

export enum DownloadURLType {
    VIDEO = 'video',
    audio = 'audio'
}

export enum FileFormats {
    WEBM = 'webm',
    MP4 = 'mp4'
}

export interface SupportedFormatType {
    id: string;
    label: string;
    description: string;
    popular?: boolean;
    badge?: string;
}

export interface FormatOptions {
    videoFormats: VideoFormat[];
    audioFormats: AudioFormat[];
    supportedTypes: SupportedFormatType[];
}

/**
 * Service interface for YouTube video conversion operations
 */
export abstract class ConverterService {
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
   * @param formats - List of formats to get url to download
   * @returns Promise resolving to download URL response
   * @throws Error if URL/format is invalid or yt-dlp execution fails
   */
    abstract getDownloadUrl(url: string, formats: Array<string>): Promise<DownloadUrlResponse>;
}
