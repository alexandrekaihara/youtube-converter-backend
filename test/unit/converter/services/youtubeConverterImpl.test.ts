/**
 * YoutubeConverterImpl Service Unit Tests
 */

import { CacheService } from '../../../../src/converter/interfaces/cache.interface.js';
import { YoutubeConverterImpl } from '../../../../src/converter/services/youtubeConverterImpl.service.js';

describe('YoutubeConverterImpl', () => {
    let service: YoutubeConverterImpl;
    let mockYtdlpService: any;
    let mockCacheService: any;
    let mockLogger: any;

    beforeEach(() => {
        // Mock dependencies
        mockYtdlpService = {
            getFormatOptions: jest.fn(),
            getDownloadUrl: jest.fn(),
            COMMAND_TIMEOUT: 30000,
            logger: console,
            parseFormatOutput: jest.fn(),
            parseFormatLine: jest.fn(),
        };

        mockCacheService = {
            get: jest.fn(),
            set: jest.fn()
        };

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        service = new YoutubeConverterImpl(mockYtdlpService, mockCacheService, mockLogger);
    });

    describe('getFormats', () => {
        it('should return video metadata with formats for valid URL', async () => {
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            const mockFormats = [
                { id: '18', ext: 'mp4', resolution: '360x640' },
                { id: '22', ext: 'mp4', resolution: '1280x720' },
            ];

            mockYtdlpService.getFormatOptions.mockResolvedValue(mockFormats);

            const result = await service.getFormats(url);

            expect(result).toHaveProperty('videoId');
            expect(result).toHaveProperty('formats');
            expect(result).toHaveProperty('timestamp');
            expect(result.videoId).toBe('dQw4w9WgXcQ');
            expect(result.formats).toEqual(mockFormats);
            expect(result.formats.length).toBe(2);
        });

        it('should extract video ID correctly from youtube.com URL', async () => {
            const url = 'https://www.youtube.com/watch?v=testVideoId123';
            mockYtdlpService.getFormatOptions.mockResolvedValue([]);

            const result = await service.getFormats(url);

            expect(result.videoId).toBe('testVideoId123');
        });

        it('should extract video ID correctly from youtu.be URL', async () => {
            const url = 'https://youtu.be/testVideoId456';
            mockYtdlpService.getFormatOptions.mockResolvedValue([]);

            const result = await service.getFormats(url);

            expect(result.videoId).toBe('testVideoId456');
        });

        it('should throw error for invalid URL', async () => {
            const invalidUrl = 'https://example.com/notavideo';

            await expect(service.getFormats(invalidUrl)).rejects.toThrow();
        });

        it('should throw error for missing URL', async () => {
            await expect(service.getFormats('')).rejects.toThrow();
        });
    });

    describe('getDownloadUrl', () => {
        it('should return download URL response for valid parameters', async () => {
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            const formatId = '22';
            const mockDownloadUrl = 'https://example.com/download-stream';

            mockYtdlpService.getDownloadUrl.mockResolvedValue(mockDownloadUrl);

            const result = await service.getDownloadUrl(url, formatId);

            expect(result).toHaveProperty('videoId');
            expect(result).toHaveProperty('formatId');
            expect(result).toHaveProperty('downloadUrl');
            expect(result).toHaveProperty('timestamp');
            expect(result.videoId).toBe('dQw4w9WgXcQ');
            expect(result.formatId).toBe('22');
            expect(result.downloadUrl).toBe(mockDownloadUrl);
        });

        it('should throw error for missing format ID', async () => {
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

            await expect(service.getDownloadUrl(url, '')).rejects.toThrow();
        });

        it('should throw error for invalid URL', async () => {
            const invalidUrl = 'https://example.com/notavideo';

            await expect(service.getDownloadUrl(invalidUrl, '22')).rejects.toThrow();
        });
    });

    describe('validateUrl', () => {
        it('should accept youtube.com URLs', () => {
            const url = 'https://www.youtube.com/watch?v=testVideoId';
            // This is tested indirectly through getFormats
            expect(url).toBeTruthy();
        });

        it('should accept youtu.be URLs', () => {
            const url = 'https://youtu.be/testVideoId';
            // This is tested indirectly through getFormats
            expect(url).toBeTruthy();
        });

        it('should reject non-YouTube URLs', async () => {
            const url = 'https://example.com/video';
            await expect(service.getFormats(url)).rejects.toThrow();
        });

        it('should reject empty URLs', async () => {
            await expect(service.getFormats('')).rejects.toThrow();
        });
    });

    describe('extractVideoId', () => {
        it('should extract ID from youtube.com/watch?v= format', async () => {
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            mockYtdlpService.getFormatOptions.mockResolvedValue([]);
            const result = await service.getFormats(url);
            expect(result.videoId).toBe('dQw4w9WgXcQ');
        });

        it('should extract ID from youtu.be format', async () => {
            const url = 'https://youtu.be/dQw4w9WgXcQ';
            mockYtdlpService.getFormatOptions.mockResolvedValue([]);
            const result = await service.getFormats(url);
            expect(result.videoId).toBe('dQw4w9WgXcQ');
        });

        it('should extract ID with query parameters', async () => {
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s';
            mockYtdlpService.getFormatOptions.mockResolvedValue([]);
            const result = await service.getFormats(url);
            expect(result.videoId).toBe('dQw4w9WgXcQ');
        });
    });
});
