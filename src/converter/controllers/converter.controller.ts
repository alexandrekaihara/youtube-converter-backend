/**
 * Converter Controller
 * 
 * HTTP request handlers for converter endpoints
 */

import type { Request, Response } from 'express';
import type { ConverterService } from '../interfaces/converter.interface.js';

/**
* Controller class for handling converter-related HTTP requests
*/
export class ConverterController {
    private converterService: ConverterService;
    private logger: Console;

    /**
    * Constructor that injects converter service and logger
    * 
    * @param converterService - The converter service instance
    * @param logger - Logger instance for debugging
    */
    constructor(converterService: ConverterService, logger: Console = console) {
        this.converterService = converterService;
         this.logger = logger;
    }

    /**
    * GET /api/converter/formats
    * 
    * Retrieves available video formats for a YouTube URL
    * 
    * @param req - Express request object
    * @param res - Express response object
    * @returns void
    */
    async getFormats(req: Request, res: Response): Promise<void> {
        try {
            const { url } = req.query;
            this.logger.info(`[ConverterController] GET /api/converter/formats - URL: ${url}`);

            if (!url) {
                this.logger.warn('[ConverterController] Missing required URL parameter');
                res.status(400).json({
                    error: 'Missing required parameter: url',
                });
                return;
            }

            const response = await this.converterService.getFormats(url as string);

            this.logger.info('[ConverterController] Successfully retrieved formats');
            res.status(200).json(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[ConverterController] Error in getFormats: ${errorMessage}`);

            // Determine appropriate status code
            const statusCode = errorMessage.includes('valid YouTube URL')
                ? 400
                : 500;

            res.status(statusCode).json({
                error: 'Failed to retrieve video formats',
                message: errorMessage,
            });
        }
    }

    /**
    * GET /api/converter/download/:formatId
    * 
    * Retrieves the direct download URL for a specific format
    * 
    * @param req - Express request object
    * @param res - Express response object
    * @returns void
    */
    async getDownloadUrl(req: Request, res: Response): Promise<void> {
        try {
            const { url } = req.query;
            const { formatId } = req.params;

            this.logger.info(
                `[ConverterController] GET /api/converter/download/${formatId} - URL: ${url}`
            );

            // Validate required parameters
            if (!url) {
                this.logger.warn('[ConverterController] Missing required URL parameter');
                res.status(400).json({
                    error: 'Missing required parameter: url',
                });
                return;
            }

            if (!formatId) {
                this.logger.warn('[ConverterController] Missing required formatId parameter');
                res.status(400).json({
                    error: 'Missing required parameter: formatId',
                });
                return;
            }

            const urlStr = typeof url === 'string' ? url : (Array.isArray(url) ? url[0] : '');
            const formatIdStr = Array.isArray(formatId) ? formatId[0] : formatId;
            const response = await this.converterService.getDownloadUrl(
                urlStr as string,
                formatIdStr as string
            );

            this.logger.info('[ConverterController] Successfully retrieved download URL');
            res.status(200).json(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[ConverterController] Error in getDownloadUrl: ${errorMessage}`);

            // Determine appropriate status code
            const statusCode = errorMessage.includes('valid YouTube URL') ||
                errorMessage.includes('Invalid format')
                ? 400
                : 500;

            res.status(statusCode).json({
                error: 'Failed to retrieve download URL',
                message: errorMessage,
            });
        }
    }
}
