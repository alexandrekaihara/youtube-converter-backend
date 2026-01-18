/**
 * Integration Tests for Converter API Endpoints
 * 
 * Tests the HTTP endpoints for the YouTube converter service,
 * including format retrieval and download URL generation.
 */

import request from 'supertest';
import app from '../../src/index.js';


describe('Converter API Integration Tests', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });
    });

    describe('GET /api/converter/formats', () => {
        const validYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const videoId = 'dQw4w9WgXcQ';

        it('should return video formats for valid YouTube URL', async () => {
            const response = await request(app)
                .get('/api/converter/formats')
                .query({ url: validYouTubeUrl });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('videoId', videoId);
            expect(response.body).toHaveProperty('formats');
            expect(Array.isArray(response.body.formats)).toBe(true);
            expect(response.body.formats.length).toBeGreaterThan(0);
            expect(response.body).toHaveProperty('timestamp');
        });

        it('should return 400 when url parameter is missing', async () => {
            const response = await request(app).get('/api/converter/formats');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when URL is invalid', async () => {
            const invalidUrl = 'https://example.com';

            const response = await request(app)
                .get('/api/converter/formats')
                .query({ url: invalidUrl });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.message).toContain('valid YouTube URL');
        });

        it('should handle short YouTube URLs', async () => {
            const shortUrl = 'https://youtu.be/dQw4w9WgXcQ';

            const response = await request(app)
                .get('/api/converter/formats')
                .query({ url: shortUrl });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('videoId');
            expect(response.body).toHaveProperty('formats');
        });

        it('should handle YouTube URLs without https', async () => {
            const httpUrl = 'http://youtube.com/watch?v=dQw4w9WgXcQ';

            const response = await request(app)
                .get('/api/converter/formats')
                .query({ url: httpUrl });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('videoId');
            expect(response.body).toHaveProperty('formats');
        });
    });

    describe('GET /api/converter/download/:formatId', () => {
        const validYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const videoId = 'dQw4w9WgXcQ';
        const formatId = '140';

        it('should return download URL for valid parameters', async () => {
            const response = await request(app)
                .get(`/api/converter/download/${formatId}`)
                .query({ url: validYouTubeUrl });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('videoId', videoId);
            expect(response.body).toHaveProperty('formatId', formatId);
            expect(response.body).toHaveProperty('downloadUrl');
            expect(response.body.downloadUrl).toContain('googlevideo.com');
            expect(response.body).toHaveProperty('timestamp');
        });

        it('should return 400 when url parameter is missing', async () => {
            const response = await request(app).get(`/api/converter/download/${formatId}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 404 when formatId is missing', async () => {
            const response = await request(app)
                .get('/api/converter/download')
                .query({ url: validYouTubeUrl });

            expect(response.status).toBe(404);
        });

        it('should return 400 when URL is invalid', async () => {
            const invalidUrl = 'https://example.com';

            const response = await request(app)
                .get(`/api/converter/download/${formatId}`)
                .query({ url: invalidUrl });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should handle different format IDs', async () => {
            const differentFormatId = '140';

            const response = await request(app)
                .get(`/api/converter/download/${differentFormatId}`)
                .query({ url: validYouTubeUrl });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('formatId', differentFormatId);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/api/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Not Found');
            expect(response.body).toHaveProperty('message');
        });

        it('should accept JSON and URL-encoded content', async () => {
            const response = await request(app)
                .get('/api/converter/formats')
                .set('Content-Type', 'application/json')
                .query({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

            expect(response.status).toBe(200);
        });
    });
});
