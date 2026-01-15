/**
 * Download URL Response Interface
 * 
 * Defines the structure of the download URL response
 */

/**
 * Response containing the direct download URL for a specific format
 */
export interface IDownloadUrlResponse {
  /** YouTube video ID */
  videoId: string;
  
  /** Format ID selected for download */
  formatId: string;
  
  /** Direct download URL for the specified format */
  downloadUrl: string;
  
  /** Timestamp when the URL was generated */
  timestamp: Date;
}
