/**
 * Environment Configuration
 * 
 * Centralized environment variable management using class-based approach
 */

import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * EnvProcessor class for managing application environment variables
 */
export class EnvProcessor {
    private static instance: EnvProcessor;

    readonly NODE_ENV: string;
    readonly PORT: number;
    readonly LOG_LEVEL: string;
    readonly YTDLP_TIMEOUT: number;
    readonly YTDLP_PATH: string;
    readonly API_PREFIX: string;
    readonly REDIS_HOST: string;
    readonly REDIS_PORT: number;
    readonly REDIS_PASSWORD: string;
    readonly DEFAULT_CACHE_TTL: number;

    private constructor() {
        this.NODE_ENV = process.env['NODE_ENV'] || 'development';
        this.PORT = parseInt(process.env['PORT'] || '3000', 10);
        this.LOG_LEVEL = process.env['LOG_LEVEL'] || 'info';
        this.YTDLP_TIMEOUT = parseInt(process.env['YTDLP_TIMEOUT'] || '30000', 10);
        this.YTDLP_PATH = process.env['YTDLP_PATH'] || 'yt-dlp';
        this.API_PREFIX = process.env['API_PREFIX'] || '/api';
        this.REDIS_HOST = process.env['REDIS_HOST'] || 'localhost';
        this.REDIS_PORT = parseInt(process.env['REDIS_PORT'] || '6379', 10);
        this.REDIS_PASSWORD = process.env['REDIS_PASSWORD'] as string;
        this.DEFAULT_CACHE_TTL = parseInt(process.env['CACHE_TTL'] || '3600', 10);
        this.validate();
    }

    static getInstance(): EnvProcessor {
        if (!EnvProcessor.instance) {
            EnvProcessor.instance = new EnvProcessor();
        }
        return EnvProcessor.instance;
    }

    isDevelopment(): boolean {
        return this.NODE_ENV === 'development';
    }

    isProduction(): boolean {
        return this.NODE_ENV === 'production';
    }

    isTest(): boolean {
        return this.NODE_ENV === 'test';
    }

    private validate(): void {
        const requiredEnvs = ['PORT'];

        if (this.isDevelopment()) {
            requiredEnvs.push('REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD');
        }

        const missing = requiredEnvs.filter(envName => !process.env[envName]);

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    toObject(): Record<string, string | number> {
        return {
            NODE_ENV: this.NODE_ENV,
            PORT: this.PORT,
            LOG_LEVEL: this.LOG_LEVEL,
            YTDLP_TIMEOUT: this.YTDLP_TIMEOUT,
            YTDLP_PATH: this.YTDLP_PATH,
            API_PREFIX: this.API_PREFIX,
            REDIS_HOST: this.REDIS_HOST,
            REDIS_PORT: this.REDIS_PORT,
            DEFAULT_CACHE_TTL: this.DEFAULT_CACHE_TTL,
        };
    }
}

export const env = EnvProcessor.getInstance();
