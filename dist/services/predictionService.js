"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Prediction service
 * Handles prediction requests and integrates with the EV prediction engine
 */
const evPredictionEngine_1 = require("../utils/evPredictionEngine");
const sportsDataService_1 = __importDefault(require("./sportsDataService"));
const logger_1 = __importDefault(require("../utils/logger"));
class PredictionService {
    constructor() {
        this.evEngine = new evPredictionEngine_1.EVPredictionEngine();
        logger_1.default.info('Prediction Service initialized');
    }
    /**
     * Get betting opportunities for a specific sport
     * @param sport Sport name
     * @param date Optional date string (YYYY-MM-DD)
     * @param bankroll User's bankroll amount
     * @returns Array of betting opportunities with EV calculations
     */
    async getBettingOpportunities(sport, date, bankroll = 1000) {
        try {
            // Get upcoming games for the sport
            const games = await sportsDataService_1.default.getUpcomingGames(sport, date);
            if (!games || games.length === 0) {
                logger_1.default.warn(`No games found for ${sport} on ${date || 'today'}`);
                return [];
            }
            // Analyze games for betting opportunities
            const opportunities = await this.evEngine.analyzeEVOpportunities(games, bankroll);
            logger_1.default.info(`Found ${opportunities.length} betting opportunities for ${sport}`);
            return opportunities;
        }
        catch (error) {
            logger_1.default.error(`Error getting betting opportunities for ${sport}: ${error}`);
            throw error;
        }
    }
    /**
     * Get all betting opportunities across multiple sports
     * @param sports Array of sport names
     * @param date Optional date string (YYYY-MM-DD)
     * @param bankroll User's bankroll amount
     * @returns Array of betting opportunities with EV calculations
     */
    async getAllBettingOpportunities(sports, date, bankroll = 1000) {
        try {
            const allOpportunities = [];
            // Process each sport in parallel
            const opportunityPromises = sports.map(sport => this.getBettingOpportunities(sport, date, bankroll));
            const opportunitiesBySport = await Promise.all(opportunityPromises);
            // Combine and flatten results
            opportunitiesBySport.forEach(opportunities => {
                allOpportunities.push(...opportunities);
            });
            // Sort by tier and EV
            const sortedOpportunities = allOpportunities.sort((a, b) => {
                const tierOrder = { 'Tier1': 0, 'Tier2': 1, 'Tier3': 2, 'Avoid': 3 };
                if (tierOrder[a.tier] !== tierOrder[b.tier]) {
                    return tierOrder[a.tier] - tierOrder[b.tier];
                }
                return b.expectedValue - a.expectedValue;
            });
            logger_1.default.info(`Found ${sortedOpportunities.length} total betting opportunities across all sports`);
            return sortedOpportunities;
        }
        catch (error) {
            logger_1.default.error(`Error getting all betting opportunities: ${error}`);
            throw error;
        }
    }
    /**
     * Get player prop betting opportunities
     * @param sport Sport name
     * @param date Optional date string (YYYY-MM-DD)
     * @param bankroll User's bankroll amount
     * @returns Array of player prop betting opportunities
     */
    async getPlayerPropOpportunities(sport, date, bankroll = 1000) {
        try {
            const allOpportunities = await this.getBettingOpportunities(sport, date, bankroll);
            // Filter for player props only
            const playerPropOpportunities = allOpportunities.filter(opp => opp.betType === 'player_prop');
            logger_1.default.info(`Found ${playerPropOpportunities.length} player prop opportunities for ${sport}`);
            return playerPropOpportunities;
        }
        catch (error) {
            logger_1.default.error(`Error getting player prop opportunities for ${sport}: ${error}`);
            throw error;
        }
    }
}
exports.default = new PredictionService();
