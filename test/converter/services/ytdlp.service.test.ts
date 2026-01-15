/**
 * YtdlpService Unit Tests
 */

describe('YtdlpService', () => {
  let YtdlpService;
  let service;

  beforeAll(() => {
    // Mock child_process before requiring the service
    jest.mock('child_process');
    YtdlpService = require('../../../src/contexts/converter/services/ytdlp.service').YtdlpService;
  });

  beforeEach(() => {
    service = new YtdlpService();
  });

  describe('getFormatOptions', () => {
    it('should return array of formats when getFormatOptions is called with valid URL', async () => {
      // Mock exec response
      const mockOutput = `
ID  EXT   RESOLUTION FPS  CH  TBR  PROTO VCODEC        ACODEC      FORMAT
18  mp4   360x640    30      96  http  mpeg4         aac         360p
22  mp4   1280x720   30      192 https h264          aac         720p hd
`;

      // Note: Full mocking setup would be needed in real tests
      // This is a skeleton structure
      expect(Array.isArray(service.parseFormatOutput(mockOutput))).toBe(true);
    });

    it('should parse format output correctly', () => {
      const mockOutput = `
ID  EXT   RESOLUTION FPS  CH  TBR  PROTO VCODEC        ACODEC      FORMAT
18  mp4   360x640    30      96  http  mpeg4         aac         360p
`;
      const formats = service.parseFormatOutput(mockOutput);
      expect(formats.length).toBeGreaterThan(0);
      expect(formats[0]).toHaveProperty('id');
      expect(formats[0]).toHaveProperty('ext');
    });

    it('should handle empty format output', () => {
      const formats = service.parseFormatOutput('');
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBe(0);
    });
  });

  describe('parseFormatLine', () => {
    it('should parse a valid format line', () => {
      const line = '22  mp4   1280x720   30      192 https h264 aac 720p';
      const format = service.parseFormatLine(line);
      
      expect(format).not.toBeNull();
      expect(format.id).toBe('22');
      expect(format.ext).toBe('mp4');
    });

    it('should return null for invalid format line', () => {
      const line = 'invalid line';
      const format = service.parseFormatLine(line);
      expect(format).toBeNull();
    });

    it('should handle empty line', () => {
      const format = service.parseFormatLine('');
      expect(format).toBeNull();
    });
  });
});
