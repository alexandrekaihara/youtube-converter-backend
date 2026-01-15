/**
 * Converter Context Routes
 * 
 * Route definitions for converter API endpoints
 */

import type { Router } from 'express';
import { ConverterController } from './controllers/converter.controller.js';
import { YoutubeConverterImpl } from './services/youtubeConverterImpl.js';
import { YtdlpService } from './services/ytdlp.service.js';

/**
 * Creates and registers converter routes
 * 
 * @param router - Express router instance
 * @param options - Configuration options
 * @returns Configured router
 */
export function createConverterRoutes(
  router: Router,
  options: { logger?: Console } = {}
): Router {
  const logger = options.logger || console;

  // Initialize services
  const ytdlpService = new YtdlpService();
  const converterService = new YoutubeConverterImpl(ytdlpService, logger);
  const controller = new ConverterController(converterService, logger);

  // Bind 'this' context for controller methods
  const getFormats = controller.getFormats.bind(controller);
  const getDownloadUrl = controller.getDownloadUrl.bind(controller);

  /**
   * GET /api/converter/formats
   * 
   * Retrieve available video formats for a YouTube URL
   * 
   * Query Parameters:
   *   - url (required): YouTube video URL
   * 
   * Response (200):
   *   {
   *     "videoId": "string",
   *     "formats": [ ... ],
   *     "timestamp": "ISO8601 date string"
   *   }
   * 
   * Error Responses:
   *   - 400: Missing or invalid parameters
   *   - 500: Server error
   */
  router.get('/api/converter/formats', getFormats);

  /**
   * GET /api/converter/download/:formatId
   * 
   * Retrieve direct download URL for a specific video format
   * 
   * Path Parameters:
   *   - formatId (required): Format ID from getFormats endpoint
   * 
   * Query Parameters:
   *   - url (required): YouTube video URL
   * 
   * Response (200):
   *   {
   *     "videoId": "string",
   *     "formatId": "string",
   *     "downloadUrl": "string",
   *     "timestamp": "ISO8601 date string"
   *   }
   * 
   * Error Responses:
   *   - 400: Missing or invalid parameters
   *   - 500: Server error
   */
  router.get('/api/converter/download/:formatId', getDownloadUrl);

  logger.info('[ConverterRoutes] Converter routes initialized');

  return router;
}
