"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main application entry point - Production Ready
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const predictionRoutes_1 = __importDefault(require("./routes/predictionRoutes"));
const env_1 = __importDefault(require("./config/env"));
const logger_1 = __importDefault(require("./utils/logger"));
// Create Express app
const app = (0, express_1.default)();
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// CORS configuration for production
const corsOptions = {
    origin: env_1.default.CORS_ORIGIN === '*'
        ? '*'
        : env_1.default.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', {
    stream: { write: (message) => logger_1.default.info(message.trim()) }
}));
// API Routes
app.use('/api/predictions', predictionRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Internal server error' });
});
// Start server
const PORT = parseInt(env_1.default.PORT.toString(), 10);
app.listen(PORT, '0.0.0.0', () => {
    logger_1.default.info(`Server running in ${env_1.default.NODE_ENV} mode on port ${PORT}`);
});
exports.default = app;
