import type { CacheService } from "./interfaces/cache.interface.js";
import { YoutubeConverterImpl } from "./services/youtubeConverterImpl.service.js";
import { YtdlpService } from "./services/ytdlp.service.js";
import { env } from '../config/env.js';
import { RedisConvertService } from "./services/redisConvert.service.js";
import { ConverterController } from "./controllers/converter.controller.js";

export class ConverterFactory {
    constructor() {
        throw new Error('Shouldn\'t instantiate a Utils class');
    }

    static createConverterController(logger: Console) {
        logger.info('[Factory] Creating ConverterController instance');
        const ytdlpService = this.createYtdlpService(logger);
        const redisConverterService = this.createRedisConvertService(logger);
        const youtubeConverterService = this.createConverterService(ytdlpService, redisConverterService, logger);
        return new ConverterController(youtubeConverterService, logger);
    }

    static createConverterService(ytdlpService: YtdlpService, cacheService: CacheService, logger: Console) {
        logger.info('[Factory] Creating YoutubeConverterImpl instance');
        return new YoutubeConverterImpl(ytdlpService, cacheService, logger);
    }

    static createYtdlpService(logger: Console): YtdlpService {
        logger.info('[Factory] Creating YtdlpService instance');
        return new YtdlpService(logger);
    }

    static createRedisConvertService(logger: Console) {
        logger.info('[Factory] Creating RedisConvertService instance');
        const credentials = {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
        };
        const cacheService = new RedisConvertService(credentials, logger);
        cacheService.connect().catch((error) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(
                `[Factory] Failed to connect to Redis: ${errorMessage}. Continuing without caching.`
            );
        });

        return cacheService;
    }
}