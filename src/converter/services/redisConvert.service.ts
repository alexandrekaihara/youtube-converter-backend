/**
 * Redis Convert Cache Service
 *
 * Implementation of IConvertCache using Redis as the cache backend
 */

import { createClient, type RedisClientType } from 'redis';
import type { CacheService } from '../interfaces/cache.interface.js';

export class RedisConvertService implements CacheService {
    private client: RedisClientType;
    private isConnected: boolean = false;
    private logger: Console;
    private host: string;
    private port: number;
    private password: string;

    /**
     * Constructor that initializes Redis connection parameters
     *
     * @param options - Redis configuration options
     * @param options.host - Redis host (default: localhost)
     * @param options.port - Redis port (default: 6379)
     * @param options.password - Redis password (optional)
     * @param logger - Logger instance for debugging
     */
    constructor(
        options: {
            host?: string;
            port?: number;
            password?: string;
        } = {},
        logger: Console = console
    ) {
        this.host = options.host || 'localhost';
        this.port = options.port || 6379;
        this.password = options.password as string;
        this.logger = logger;

        // Create Redis client
        this.client = createClient({
            host: this.host,
            port: this.port,
            password: this.password,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        this.logger.error(
                            '[RedisConvertService] Max reconnection attempts reached'
                        );
                        return new Error('Max reconnection attempts reached');
                    }
                    return retries * 100;
                },
            },
        });

        this.setupEventHandlers();
    }

    /**
     * Setup Redis client event handlers
     */
    private setupEventHandlers(): void {
        this.client.on('connect', () => {
            this.isConnected = true;
            this.logger.info('[RedisConvertService] Successfully connected to Redis');
        });

        this.client.on('error', (error) => {
            this.isConnected = false;
            this.logger.error(`[RedisConvertService] Redis error: ${error.message}`);
        });

        this.client.on('disconnect', () => {
            this.isConnected = false;
            this.logger.warn('[RedisConvertService] Disconnected from Redis');
        });
    }

    /**
     * Connect to Redis server
     *
     * @returns Promise resolving when connected
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            return;
        }

        try {
            await this.client.connect();
            this.logger.info(
                `[RedisConvertService] Connected to Redis at ${this.host}:${this.port}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Failed to connect to Redis: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Disconnect from Redis server
     *
     * @returns Promise resolving when disconnected
     */
    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.client.disconnect();
            this.logger.info('[RedisConvertService] Disconnected from Redis');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Error disconnecting: ${errorMessage}`);
        }
    }

    /**
     * Retrieve a value from cache by key
     *
     * @template T - Type of the cached value
     * @param key - Cache key
     * @returns Promise resolving to cached value or null if not found
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            if (!this.isConnected) {
                this.logger.warn('[RedisConvertService] Redis not connected, returning null');
                return null;
            }

            const value = await this.client.get(key);

            if (!value) {
                return null;
            }

            return JSON.parse(value) as T;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Error getting key "${key}": ${errorMessage}`);
            return null;
        }
    }

    /**
     * Store a value in cache with optional time-to-live
     *
     * @template T - Type of the value to cache
     * @param key - Cache key
     * @param value - Value to store
     * @param ttl - Time-to-live in seconds (optional)
     * @returns Promise resolving when value is stored
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            if (!this.isConnected) {
                this.logger.warn('[RedisConvertService] Redis not connected, skipping set operation');
                return;
            }

            const serializedValue = JSON.stringify(value);

            if (ttl) {
                await this.client.setEx(key, ttl, serializedValue);
                this.logger.debug(
                    `[RedisConvertService] Set key "${key}" with TTL ${ttl}s`
                );
            } else {
                await this.client.set(key, serializedValue);
                this.logger.debug(`[RedisConvertService] Set key "${key}"`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Error setting key "${key}": ${errorMessage}`);
        }
    }

    /**
     * Delete a value from cache by key
     *
     * @param key - Cache key
     * @returns Promise resolving when key is deleted
     */
    async delete(key: string): Promise<void> {
        try {
            if (!this.isConnected) {
                this.logger.warn('[RedisConvertService] Redis not connected, skipping delete operation');
                return;
            }

            await this.client.del(key);
            this.logger.debug(`[RedisConvertService] Deleted key "${key}"`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Error deleting key "${key}": ${errorMessage}`);
        }
    }

    /**
     * Check if a key exists in cache
     *
     * @param key - Cache key
     * @returns Promise resolving to boolean indicating existence
     */
    async exists(key: string): Promise<boolean> {
        try {
            if (!this.isConnected) {
                return false;
            }

            const exists = await this.client.exists(key);
            return exists > 0;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Error checking existence of key "${key}": ${errorMessage}`);
            return false;
        }
    }

    /**
     * Clear all cache data
     *
     * @returns Promise resolving when cache is cleared
     */
    async clear(): Promise<void> {
        try {
            if (!this.isConnected) {
                this.logger.warn('[RedisConvertService] Redis not connected, skipping clear operation');
                return;
            }

            await this.client.flushDb();
            this.logger.info('[RedisConvertService] Cleared all cache data');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[RedisConvertService] Error clearing cache: ${errorMessage}`);
        }
    }

    /**
     * Get connection status
     *
     * @returns boolean indicating if connected
     */
    isReady(): boolean {
        return this.isConnected;
    }
}
