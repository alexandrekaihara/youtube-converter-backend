/**
 * Video Metadata Interfaces
 * 
 * Defines the structure of video format information and metadata responses.
 */

/**
 * Represents a single video format option available for download
 */
export interface IVideoFormat {
  /** Unique identifier for the format */
  id: string;
  
  /** File extension (e.g., 'mp4', 'webm') */
  ext: string;
  
  /** Resolution information (e.g., '1920x1080', '720p') */
  resolution?: string;
  
  /** Frames per second */
  fps?: number;
  
  /** File size in bytes as string */
  filesize?: string;
  
  /** Video codec information */
  vcodec?: string;
  
  /** Audio codec information */
  acodec?: string;
  
  /** Total bitrate */
  tbr?: string;
  
  /** Protocol used (http, https, etc.) */
  protocol?: string;
  
  /** Format note/description from yt-dlp */
  format_note?: string;
}

/**
 * Response containing available video formats and metadata
 */
export interface IVideoMetadataResponse {
  /** YouTube video ID extracted from URL */
  videoId: string;
  
  /** Array of available download formats */
  formats: IVideoFormat[];
  
  /** Timestamp when metadata was fetched */
  timestamp: Date;
}
