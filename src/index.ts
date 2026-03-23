import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import authRouter from './routes/auth';
import cardsRouter from './routes/cards';
import healthRouter from './routes/health';
import pricingRouter from './routes/pricing';
import chatRouter from './routes/chat';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { logger } from './utils/logger';
import { redisCache } from './utils/redisCache';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
logger.info('Setting up middleware...');
app.use(cors());
logger.info('CORS enabled');
app.use(express.json({ limit: '10mb' }));
logger.info('JSON body parser enabled');
app.use(requestIdMiddleware);
logger.info('Request ID middleware enabled');
app.use(clerkMiddleware());
logger.info('Clerk middleware enabled');

// Mount routes under /api prefix
app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/health', healthRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/chat', chatRouter);
app.use(errorHandler);

// Graceful shutdown handler
let isShuttingDown = false;
const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Force exit after timeout
  setTimeout(() => {
    process.exit(1);
  }, 10000);

  // Stop accepting new requests
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('HTTP server closed');
        resolve();
      });
    });
  }

  // Close Redis connections
  try {
    await redisCache.disconnect();
    logger.info('Redis disconnected');
  } catch (error) {
    logger.error('Error disconnecting Redis:', error);
  }

  // Flush logs and exit
  logger.end(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server after DB connection
let server: any;
connectDB().then(() => {
  logger.info('Starting server...');
  server = app.listen(PORT, (): void => {
    logger.info('Server started successfully');
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Auth endpoints: http://localhost:${PORT}/api/auth/*`);
    logger.info(`Cards: http://localhost:${PORT}/api/cards/analyze-card`);
    logger.info(`Pricing: http://localhost:${PORT}/api/pricing/*`);
    logger.info(`Chat: http://localhost:${PORT}/api/chat`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  logger.error('Error connecting to MongoDB:', error);
  process.exit(1);
});
