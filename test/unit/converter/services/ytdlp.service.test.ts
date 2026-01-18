/**
 * YtdlpService Unit Tests
 */

import { YtdlpService } from '../../../../src/converter/services/ytdlp.service.js';

describe('YtdlpService', () => {
    let service: YtdlpService;

    beforeEach(() => {
        service = new YtdlpService(console);
    });

    describe('getFormatOptions', () => {
        it('should return a Promise', () => {
            const result = service.getFormatOptions('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            expect(result).toBeInstanceOf(Promise);
        });
    });

    describe('getDownloadUrl', () => {
        it('should return a Promise', () => {
            const result = service.getDownloadUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '22');
            expect(result).toBeInstanceOf(Promise);
        });
    });
});
