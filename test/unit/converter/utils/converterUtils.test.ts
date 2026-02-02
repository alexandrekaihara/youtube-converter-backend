/**
 * ConverterUtils Unit Tests
 * 
 * Tests for parsing yt-dlp format output including filesize and TBR extraction
 */

import { ConverterUtils } from '../../../../src/converter/utils/ConverterUtils.js';

describe('ConverterUtils', () => {
    describe('parseFormatLine', () => {
        it('should extract filesize and tbr from audio format', () => {
            const line = '139 m4a   audio only      2 |   2.91MiB   49k https | audio only          mp4a.40.5   49k 22k low, m4a_dash';
            const format = ConverterUtils.parseFormatLine(line);

            expect(format).not.toBeNull();
            expect(format?.id).toBe('139');
            expect(format?.ext).toBe('m4a');
            expect(format?.filesize).toBe('2.91MiB');
            expect(format?.tbr).toBe('49k');
            expect(format?.protocol).toBe('https');
            expect(format?.acodec).toBe('mp4a');
        });

        it('should extract filesize and tbr from video format', () => {
            const line = '160 mp4   256x144     24    |   2.51MiB   42k https | avc1.4d400c     42k video only          144p, mp4_dash';
            const format = ConverterUtils.parseFormatLine(line);

            expect(format).not.toBeNull();
            expect(format?.id).toBe('160');
            expect(format?.ext).toBe('mp4');
            expect(format?.resolution).toBe('256x144');
            expect(format?.fps).toBe(24);
            expect(format?.filesize).toBe('2.51MiB');
            expect(format?.tbr).toBe('42k');
            expect(format?.protocol).toBe('https');
            expect(format?.vcodec).toBe('avc1');
        });

        it('should handle webm format with opus audio', () => {
            const line = '251 webm  audio only      2 |   7.58MiB  127k https | audio only          opus       127k 48k medium, webm_dash';
            const format = ConverterUtils.parseFormatLine(line);

            expect(format).not.toBeNull();
            expect(format?.id).toBe('251');
            expect(format?.ext).toBe('webm');
            expect(format?.filesize).toBe('7.58MiB');
            expect(format?.tbr).toBe('127k');
            expect(format?.protocol).toBe('https');
            expect(format?.acodec).toBe('opus');
        });

        it('should handle vp9 video format', () => {
            const line = '278 webm  256x144     24    |   4.78MiB   80k https | vp9             80k video only          144p, webm_dash';
            const format = ConverterUtils.parseFormatLine(line);

            expect(format).not.toBeNull();
            expect(format?.id).toBe('278');
            expect(format?.ext).toBe('webm');
            expect(format?.resolution).toBe('256x144');
            expect(format?.filesize).toBe('4.78MiB');
            expect(format?.tbr).toBe('80k');
            expect(format?.vcodec).toBe('vp9');
        });

        it('should handle storyboard format without filesize', () => {
            const line = 'sb0 mhtml 320x180      0    |                 mhtml | images                                  storyboard';
            const format = ConverterUtils.parseFormatLine(line);

            expect(format).not.toBeNull();
            expect(format?.id).toBe('sb0');
            expect(format?.ext).toBe('mhtml');
            expect(format?.resolution).toBe('320x180');
            expect(format?.protocol).toBe('mhtml');
        });

        it('should extract filesize with different units', () => {
            const line = '18 mp4   1920x1080    30    |   150.5MB  500k https | h264            500k aac         128k 48k hd, mp4_dash';
            const format = ConverterUtils.parseFormatLine(line);

            expect(format).not.toBeNull();
            expect(format?.filesize).toBe('150.5MB');
            expect(format?.tbr).toBe('500k');
        });

        it('should return null for invalid format lines', () => {
            const format = ConverterUtils.parseFormatLine('invalid format line');
            expect(format).toBeNull();
        });

        it('should return null for empty lines', () => {
            const format = ConverterUtils.parseFormatLine('   ');
            expect(format).toBeNull();
        });
    });

    describe('parseFormatOutput', () => {
        it('should parse multiple formats from yt-dlp output', () => {
            const output = `ID  EXT   RESOLUTION FPS CH |  FILESIZE   TBR PROTO | VCODEC          VBR ACODEC      ABR ASR MORE INFO
---------------------------------------------------------------------------------------------------------------
139 m4a   audio only      2 |   2.91MiB   49k https | audio only          mp4a.40.5   49k 22k low, m4a_dash
160 mp4   256x144     24    |   2.51MiB   42k https | avc1.4d400c     42k video only          144p, mp4_dash
251 webm  audio only      2 |   7.58MiB  127k https | audio only          opus       127k 48k medium, webm_dash`;

            const formats = ConverterUtils.parseFormatOutput(output);

            expect(formats).toHaveLength(3);
            expect(formats[0].id).toBe('139');
            expect(formats[0].filesize).toBe('2.91MiB');
            expect(formats[0].tbr).toBe('49k');
            expect(formats[1].id).toBe('160');
            expect(formats[1].filesize).toBe('2.51MiB');
            expect(formats[1].tbr).toBe('42k');
            expect(formats[2].id).toBe('251');
            expect(formats[2].filesize).toBe('7.58MiB');
            expect(formats[2].tbr).toBe('127k');
        });
    });

    describe('validateUrl', () => {
        it('should validate correct YouTube URLs', () => {
            expect(() => ConverterUtils.validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).not.toThrow();
            expect(() => ConverterUtils.validateUrl('https://youtu.be/dQw4w9WgXcQ')).not.toThrow();
        });

        it('should throw for invalid URLs', () => {
            expect(() => ConverterUtils.validateUrl('')).toThrow();
            expect(() => ConverterUtils.validateUrl('https://google.com')).toThrow();
        });
    });

    describe('extractVideoId', () => {
        it('should extract video ID from different URL formats', () => {
            expect(ConverterUtils.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
            expect(ConverterUtils.extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
            expect(ConverterUtils.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s')).toBe('dQw4w9WgXcQ');
        });

        it('should return null for invalid URLs', () => {
            expect(ConverterUtils.extractVideoId('https://google.com')).toBeNull();
        });
    });
});
