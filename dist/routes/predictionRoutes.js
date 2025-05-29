"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * API routes for predictions
 */
const express_1 = __importDefault(require("express"));
const predictionService_1 = __importDefault(require("../services/predictionService"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
/**
 * GET /api/predictions/:sport
 * Get betting opportunities for a specific sport
 */
router.get('/:sport', async (req, res) => {
    try {
        const { sport } = req.params;
        const { date, bankroll } = req.query;
        const opportunities = await predictionService_1.default.getBettingOpportunities(sport, date, bankroll ? parseInt(bankroll) : 1000);
        res.json({ success: true, data: opportunities });
    }
    catch (error) {
        logger_1.default.error(`Error in GET /api/predictions/${req.params.sport}: ${error}`);
        res.status(500).json({ success: false, error: 'Failed to get predictions' });
    }
});
/**
 * GET /api/predictions
 * Get all betting opportunities across multiple sports
 */
router.get('/', async (req, res) => {
    try {
        const { sports, date, bankroll } = req.query;
        // Parse sports parameter
        const sportsArray = sports ? sports.split(',') : [
            'soccer', 'basketball', 'baseball', 'hockey', 'american_football',
            'college_football', 'college_basketball'
        ];
        const opportunities = await predictionService_1.default.getAllBettingOpportunities(sportsArray, date, bankroll ? parseInt(bankroll) : 1000);
        res.json({ success: true, data: opportunities });
    }
    catch (error) {
        logger_1.default.error(`Error in GET /api/predictions: ${error}`);
        res.status(500).json({ success: false, error: 'Failed to get predictions' });
    }
});
/**
 * GET /api/predictions/:sport/player-props
 * Get player prop betting opportunities for a specific sport
 */
router.get('/:sport/player-props', async (req, res) => {
    try {
        const { sport } = req.params;
        const { date, bankroll } = req.query;
        const opportunities = await predictionService_1.default.getPlayerPropOpportunities(sport, date, bankroll ? parseInt(bankroll) : 1000);
        res.json({ success: true, data: opportunities });
    }
    catch (error) {
        logger_1.default.error(`Error in GET /api/predictions/${req.params.sport}/player-props: ${error}`);
        res.status(500).json({ success: false, error: 'Failed to get player prop predictions' });
    }
});
exports.default = router;
