import type { CacheService } from "./interfaces/cache.interface";
import { YoutubeConverterImpl } from "./services/youtubeConverterImpl.service";
import { YtdlpService } from "./services/ytdlp.service";
import { env } from '../config/env.js';
import { RedisConvertService } from "./services/redisConvert.service";
import { ConverterController } from "./controllers/converter.controller";

export class ConverterFactory {
    constructor() {
        throw new Error('Shouldn\'t instantiate a Utils class');
    }

    static createConverterController(logger: Console) {
        const ytdlpService = this.createYtdlpService(logger);
        const redisConverterService = this.createRedisConvertService(logger);
        const youtubeConverterService = this.createConverterService(ytdlpService, redisConverterService, logger);
        return new ConverterController(youtubeConverterService, logger);
    }

    static createConverterService(ytdlpService: YtdlpService, cacheService: CacheService, logger: Console) {
        return new YoutubeConverterImpl(ytdlpService, cacheService, logger);
    }

    static createYtdlpService(logger: Console): YtdlpService {
        return new YtdlpService(logger);
    }

    static createRedisConvertService(logger: Console) {
        const credentials = {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
        };
        const cacheService = new RedisConvertService(credentials, logger);
        cacheService.connect().catch((error) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(
                `[ConverterRoutes] Failed to connect to Redis: ${errorMessage}. Continuing without caching.`
            );
        });

        return cacheService;
    }
}