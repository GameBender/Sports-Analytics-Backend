/**
 * Main application entry point - Production Ready
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import predictionRoutes from './routes/predictionRoutes';
import config from './config/env';
import logger from './utils/logger';

// Create Express app
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// CORS configuration for production
const corsOptions = {
  origin: config.CORS_ORIGIN === '*' 
    ? '*' 
    : config.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) }
}));

// API Routes
app.use('/api/predictions', predictionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const PORT = parseInt(config.PORT.toString(), 10);
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

export default app;
