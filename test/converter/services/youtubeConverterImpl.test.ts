/**
 * YoutubeConverterImpl Service Unit Tests
 */

describe('YoutubeConverterImpl', () => {
  let YoutubeConverterImpl;
  let service;
  let mockYtdlpService;
  let mockLogger;

  beforeEach(() => {
    YoutubeConverterImpl = require('../../../src/contexts/converter/services/youtubeConverterImpl').YoutubeConverterImpl;
    
    // Mock dependencies
    mockYtdlpService = {
      getFormatOptions: jest.fn(),
      getDownloadUrl: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    service = new YoutubeConverterImpl(mockYtdlpService, mockLogger);
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
      expect(() => service.validateUrl(url)).not.toThrow();
    });

    it('should accept youtu.be URLs', () => {
      const url = 'https://youtu.be/testVideoId';
      expect(() => service.validateUrl(url)).not.toThrow();
    });

    it('should reject non-YouTube URLs', () => {
      const url = 'https://example.com/video';
      expect(() => service.validateUrl(url)).toThrow();
    });

    it('should reject empty URLs', () => {
      expect(() => service.validateUrl('')).toThrow();
    });
  });

  describe('extractVideoId', () => {
    it('should extract ID from youtube.com/watch?v= format', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const id = service.extractVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from youtu.be format', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const id = service.extractVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID with query parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s';
      const id = service.extractVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/notavideo';
      const id = service.extractVideoId(url);
      expect(id).toBeNull();
    });
  });
});
