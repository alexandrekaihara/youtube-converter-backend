/**
 * Converter Context Routes
 * 
 * Route definitions for converter API endpoints
 */

import type { Router } from 'express';
import { env } from '../config/env.js';
import { ConverterFactory } from './converterFactory.js';

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
    const controller = ConverterFactory.createConverterController(logger);

    router.get(`${env.API_PREFIX}/converter/formats`, controller.getFormats.bind(controller));
    router.get(`${env.API_PREFIX}/converter/download`, controller.getDownloadUrl.bind(controller));

    logger.info('[ConverterRoutes] Converter routes initialized');
    return router;
}

