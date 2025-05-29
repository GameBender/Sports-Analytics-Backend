"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Logger utility for the Sports Analytics Platform
 */
const winston_1 = __importDefault(require("winston"));
const env_1 = __importDefault(require("../config/env"));
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
}));
// Create logger instance
const logger = winston_1.default.createLogger({
    level: env_1.default.LOG_LEVEL,
    format: logFormat,
    transports: [
        // Console transport for development
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
        }),
        // File transport for production
        new winston_1.default.transports.File({
            filename: env_1.default.LOG_FILE,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
exports.default = logger;
