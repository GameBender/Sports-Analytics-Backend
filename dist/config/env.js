"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Production-ready environment configuration
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const config = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    // API keys and URLs
    SPORTS_DB_API_KEY: process.env.SPORTS_DB_API_KEY || 'demo_key',
    SPORTS_DB_BASE_URL: process.env.SPORTS_DB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json',
    FOOTBALL_API_KEY: process.env.FOOTBALL_API_KEY || 'demo_key',
    FOOTBALL_API_BASE_URL: process.env.FOOTBALL_API_BASE_URL || 'https://api-football-v1.p.rapidapi.com/v3',
    // CORS settings
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
    // Database
    DB_URL: process.env.DATABASE_URL || 'sqlite::memory:',
    // JWT for authentication (if implemented)
    JWT_SECRET: process.env.JWT_SECRET || 'development_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};
exports.default = config;
