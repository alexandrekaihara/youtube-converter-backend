/**
 * Convert Cache Service Inteface
 *
 * Generic cache interface for storing and retrieving converter-related data
 */

export interface CacheService {
    /**
     * Retrieve a value from cache by key
     *
     * @template T - Type of the cached value
     * @param key - Cache key
     * @returns Promise resolving to cached value or null if not found
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Store a value in cache with optional time-to-live
     *
     * @template T - Type of the value to cache
     * @param key - Cache key
     * @param value - Value to store
     * @param ttl - Time-to-live in seconds (optional)
     * @returns Promise resolving when value is stored
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;

    /**
     * Delete a value from cache by key
     *
     * @param key - Cache key
     * @returns Promise resolving when key is deleted
     */
    delete(key: string): Promise<void>;

    /**
     * Check if a key exists in cache
     *
     * @param key - Cache key
     * @returns Promise resolving to boolean indicating existence
     */
    exists(key: string): Promise<boolean>;

    /**
     * Clear all cache data
     *
     * @returns Promise resolving when cache is cleared
     */
    clear(): Promise<void>;
}
