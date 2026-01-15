/**
 * Application Entry Point
 * 
 * Initializes the Express server and sets up routing for all contexts.
 */

import express from 'express';
import { createConverterRoutes } from './converter/routes.js';

// Initialize Express app
const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((_req, _res, next) => {
  console.info(`[${new Date().toISOString()}] ${_req.method} ${_req.path}`);
  next();
});

// Initialize converter routes
const router = express.Router();
createConverterRoutes(router, { logger: console });
app.use(router);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[Error] ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`YouTube Converter Backend Running on http://localhost:${PORT}`);
  console.log(`[${new Date().toISOString()}] Server started successfully`);
});

export default app;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('[SIGTERM] Shutting down gracefully...');
  server.close(() => {
    console.info('Server shut down');
    process.exit(0);
  });
});
