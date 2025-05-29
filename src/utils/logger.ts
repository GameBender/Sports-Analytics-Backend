/**
 * Logger utility for the Sports Analytics Platform
 */
import winston from 'winston';
import path from 'path';
import config from '../config/env';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File transport for production
    new winston.transports.File({
      filename: config.LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

export default logger;
