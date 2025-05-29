"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVPredictionEngine = void 0;
/**
 * EV Prediction Engine
 * Core logic for calculating Expected Value and making betting recommendations
 */
const math = __importStar(require("mathjs"));
const baselineStats_1 = require("./baselineStats");
const logger_1 = __importDefault(require("./logger"));
class EVPredictionEngine extends baselineStats_1.BaselineStats {
    constructor() {
        super();
        logger_1.default.info('Initializing EV Prediction Engine');
    }
    /**
     * Analyze betting opportunities across multiple games
     * @param games Array of game data
     * @param bankroll User's bankroll amount
     * @returns Array of betting opportunities with EV calculations
     */
    async analyzeEVOpportunities(games, bankroll) {
        const opportunities = [];
        for (const game of games) {
            try {
                // Generate multiple betting opportunities per game
                const moneylineOpp = await this.analyzeMoneylineEV(game, bankroll);
                const totalOpp = await this.analyzeTotalEV(game, bankroll);
                const spreadOpp = await this.analyzeSpreadEV(game, bankroll);
                if (moneylineOpp)
                    opportunities.push(moneylineOpp);
                if (totalOpp)
                    opportunities.push(totalOpp);
                if (spreadOpp)
                    opportunities.push(spreadOpp);
                // Player props analysis
                const playerProps = await this.analyzePlayerPropsEV(game, bankroll);
                opportunities.push(...playerProps);
            }
            catch (error) {
                logger_1.default.error(`Error analyzing EV for game ${game.id}:`, error);
            }
        }
        return this.rankAndTierOpportunities(opportunities);
    }
    /**
     * Analyze moneyline betting opportunities
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Moneyline betting opportunity with EV calculation
     */
    async analyzeMoneylineEV(game, bankroll) {
        // Extract market lines
        const homeOdds = this.parseAmericanOdds(game.homeMoneyline || '+100');
        const awayOdds = this.parseAmericanOdds(game.awayMoneyline || '+100');
        // Calculate model probabilities using advanced factors
        const modelProb = await this.calculateAdvancedGameProbability(game);
        // Check both sides for value
        const homeEV = this.calculateEV(modelProb.homeProbability, homeOdds);
        const awayEV = this.calculateEV(modelProb.awayProbability, awayOdds);
        let bestSide = null;
        let bestEV = 0;
        let bestOdds = 0;
        let bestModelProb = 0;
        if (homeEV > awayEV && homeEV > 0.02) { // Minimum 2% EV threshold
            bestSide = 'home';
            bestEV = homeEV;
            bestOdds = homeOdds;
            bestModelProb = modelProb.homeProbability;
        }
        else if (awayEV > 0.02) {
            bestSide = 'away';
            bestEV = awayEV;
            bestOdds = awayOdds;
            bestModelProb = modelProb.awayProbability;
        }
        if (!bestSide)
            return null;
        const factors = await this.getEVFactors(game, bestSide);
        const confidence = this.calculateConfidenceLevel(factors, modelProb.dataQuality);
        return {
            gameId: game.id,
            bookmakerLine: bestOdds,
            impliedProbability: this.oddsToImpliedProbability(bestOdds),
            modelProbability: bestModelProb,
            expectedValue: bestEV,
            confidence,
            tier: this.assignTier(bestEV, confidence),
            betType: 'moneyline',
            sportType: game.league || 'Unknown',
            recommendation: this.calculateKellyBetSize(bestEV, bestOdds, bankroll, confidence),
            factors,
            gameInfo: {
                homeTeam: game.homeTeam?.name || 'Home Team',
                awayTeam: game.awayTeam?.name || 'Away Team',
                dateTime: game.dateTime || new Date().toISOString(),
                league: game.league || 'Unknown'
            }
        };
    }
    /**
     * Analyze total (over/under) betting opportunities
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Total betting opportunity with EV calculation
     */
    async analyzeTotalEV(game, bankroll) {
        const totalLine = parseFloat(game.totalLine || '0');
        const overOdds = this.parseAmericanOdds(game.overOdds || '-110');
        const underOdds = this.parseAmericanOdds(game.underOdds || '-110');
        if (!totalLine)
            return null;
        // Advanced total prediction with weather, pace, and situational factors
        const totalPrediction = await this.calculateAdvancedTotalPrediction(game);
        const overProb = totalPrediction.overProbability;
        const underProb = 1 - overProb;
        const overEV = this.calculateEV(overProb, overOdds);
        const underEV = this.calculateEV(underProb, underOdds);
        let bestBet = null;
        let bestEV = 0;
        let bestOdds = 0;
        let bestProb = 0;
        if (overEV > underEV && overEV > 0.02) {
            bestBet = 'over';
            bestEV = overEV;
            bestOdds = overOdds;
            bestProb = overProb;
        }
        else if (underEV > 0.02) {
            bestBet = 'under';
            bestEV = underEV;
            bestOdds = underOdds;
            bestProb = underProb;
        }
        if (!bestBet)
            return null;
        const factors = await this.getTotalEVFactors(game, totalPrediction, bestBet);
        const confidence = this.calculateConfidenceLevel(factors, totalPrediction.dataQuality);
        return {
            gameId: game.id,
            bookmakerLine: bestOdds,
            impliedProbability: this.oddsToImpliedProbability(bestOdds),
            modelProbability: bestProb,
            expectedValue: bestEV,
            confidence,
            tier: this.assignTier(bestEV, confidence),
            betType: 'total',
            sportType: game.league || 'Unknown',
            recommendation: this.calculateKellyBetSize(bestEV, bestOdds, bankroll, confidence),
            factors,
            gameInfo: {
                homeTeam: game.homeTeam?.name || 'Home Team',
                awayTeam: game.awayTeam?.name || 'Away Team',
                dateTime: game.dateTime || new Date().toISOString(),
                league: game.league || 'Unknown'
            }
        };
    }
    /**
     * Analyze spread betting opportunities
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Spread betting opportunity with EV calculation
     */
    async analyzeSpreadEV(game, bankroll) {
        const spreadLine = parseFloat(game.spreadLine || '0');
        const homeSpreadOdds = this.parseAmericanOdds(game.homeSpreadOdds || '-110');
        const awaySpreadOdds = this.parseAmericanOdds(game.awaySpreadOdds || '-110');
        if (!spreadLine)
            return null;
        // Calculate spread probabilities
        const spreadPrediction = await this.calculateAdvancedSpreadPrediction(game);
        const homeCoverProb = spreadPrediction.homeCoverProbability;
        const awayCoverProb = 1 - homeCoverProb;
        const homeEV = this.calculateEV(homeCoverProb, homeSpreadOdds);
        const awayEV = this.calculateEV(awayCoverProb, awaySpreadOdds);
        let bestSide = null;
        let bestEV = 0;
        let bestOdds = 0;
        let bestProb = 0;
        if (homeEV > awayEV && homeEV > 0.02) {
            bestSide = 'home';
            bestEV = homeEV;
            bestOdds = homeSpreadOdds;
            bestProb = homeCoverProb;
        }
        else if (awayEV > 0.02) {
            bestSide = 'away';
            bestEV = awayEV;
            bestOdds = awaySpreadOdds;
            bestProb = awayCoverProb;
        }
        if (!bestSide)
            return null;
        const factors = await this.getSpreadEVFactors(game, spreadPrediction, bestSide);
        const confidence = this.calculateConfidenceLevel(factors, spreadPrediction.dataQuality);
        return {
            gameId: game.id,
            bookmakerLine: bestOdds,
            impliedProbability: this.oddsToImpliedProbability(bestOdds),
            modelProbability: bestProb,
            expectedValue: bestEV,
            confidence,
            tier: this.assignTier(bestEV, confidence),
            betType: 'spread',
            sportType: game.league || 'Unknown',
            recommendation: this.calculateKellyBetSize(bestEV, bestOdds, bankroll, confidence),
            factors,
            gameInfo: {
                homeTeam: game.homeTeam?.name || 'Home Team',
                awayTeam: game.awayTeam?.name || 'Away Team',
                dateTime: game.dateTime || new Date().toISOString(),
                league: game.league || 'Unknown'
            }
        };
    }
    /**
     * Analyze player prop betting opportunities
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Array of player prop betting opportunities with EV calculations
     */
    async analyzePlayerPropsEV(game, bankroll) {
        const opportunities = [];
        // Different prop analysis based on sport type
        if (game.league === 'MLB') {
            const pitcherProps = await this.analyzePitcherProps(game, bankroll);
            const hitterProps = await this.analyzeHitterProps(game, bankroll);
            opportunities.push(...pitcherProps);
            opportunities.push(...hitterProps);
        }
        else if (game.league === 'NBA' || game.league === 'NCAA Basketball') {
            const basketballProps = await this.analyzeBasketballPlayerProps(game, bankroll);
            opportunities.push(...basketballProps);
        }
        else if (game.league === 'NFL' || game.league === 'NCAA Football') {
            const footballProps = await this.analyzeFootballPlayerProps(game, bankroll);
            opportunities.push(...footballProps);
        }
        return opportunities.filter(opp => opp.expectedValue > 0.03); // Higher threshold for props
    }
    /**
     * Analyze pitcher prop betting opportunities (MLB)
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Array of pitcher prop betting opportunities
     */
    async analyzePitcherProps(game, bankroll) {
        const opportunities = [];
        // Example implementation for pitcher strikeout props
        if (game.homePitcher) {
            const strikeoutProps = this.analyzePitcherStrikeoutProps(game, 'home', bankroll);
            if (strikeoutProps)
                opportunities.push(strikeoutProps);
        }
        if (game.awayPitcher) {
            const strikeoutProps = this.analyzePitcherStrikeoutProps(game, 'away', bankroll);
            if (strikeoutProps)
                opportunities.push(strikeoutProps);
        }
        return opportunities;
    }
    /**
     * Analyze pitcher strikeout prop betting opportunities
     * @param game Game data
     * @param side 'home' or 'away'
     * @param bankroll User's bankroll amount
     * @returns Pitcher strikeout prop betting opportunity
     */
    analyzePitcherStrikeoutProps(game, side, bankroll) {
        const pitcher = side === 'home' ? game.homePitcher : game.awayPitcher;
        if (!pitcher)
            return null;
        const strikeoutLine = pitcher.strikeoutLine || 5.5;
        const overOdds = this.parseAmericanOdds(pitcher.strikeoutOverOdds || '-110');
        const underOdds = this.parseAmericanOdds(pitcher.strikeoutUnderOdds || '-110');
        // Calculate model probability based on pitcher data
        const overProb = this.calculatePitcherStrikeoutProbability(pitcher, game, strikeoutLine);
        const underProb = 1 - overProb;
        const overEV = this.calculateEV(overProb, overOdds);
        const underEV = this.calculateEV(underProb, underOdds);
        let bestBet = null;
        let bestEV = 0;
        let bestOdds = 0;
        let bestProb = 0;
        if (overEV > underEV && overEV > 0.03) {
            bestBet = 'over';
            bestEV = overEV;
            bestOdds = overOdds;
            bestProb = overProb;
        }
        else if (underEV > 0.03) {
            bestBet = 'under';
            bestEV = underEV;
            bestOdds = underOdds;
            bestProb = underProb;
        }
        if (!bestBet)
            return null;
        const factors = this.getPitcherStrikeoutFactors(pitcher, game, bestBet);
        const confidence = this.calculateConfidenceLevel(factors, 75);
        return {
            gameId: game.id,
            bookmakerLine: bestOdds,
            impliedProbability: this.oddsToImpliedProbability(bestOdds),
            modelProbability: bestProb,
            expectedValue: bestEV,
            confidence,
            tier: this.assignTier(bestEV, confidence),
            betType: 'player_prop',
            sportType: 'MLB',
            recommendation: this.calculateKellyBetSize(bestEV, bestOdds, bankroll, confidence),
            factors,
            gameInfo: {
                homeTeam: game.homeTeam?.name || 'Home Team',
                awayTeam: game.awayTeam?.name || 'Away Team',
                dateTime: game.dateTime || new Date().toISOString(),
                league: game.league || 'MLB'
            }
        };
    }
    /**
     * Calculate pitcher strikeout probability
     * @param pitcher Pitcher data
     * @param game Game data
     * @param line Strikeout line
     * @returns Probability of going over the line
     */
    calculatePitcherStrikeoutProbability(pitcher, game, line) {
        // Simplified implementation - would be more complex in real system
        const strikeoutRate = pitcher.strikeoutRate || 0.22;
        const opposingTeamK = (side) => {
            const team = side === 'home' ? game.awayTeam : game.homeTeam;
            return team?.stats?.strikeoutRate || 0.22;
        };
        const expectedInnings = pitcher.expectedInnings || 5.5;
        const expectedBattersFaced = expectedInnings * 4.3; // Average batters per inning
        const expectedStrikeouts = expectedBattersFaced * strikeoutRate * (opposingTeamK(pitcher === game.homePitcher ? 'home' : 'away') / 0.22);
        // Use Poisson distribution to calculate probability of exceeding the line
        let probability = 0;
        for (let k = Math.ceil(line); k < 20; k++) {
            probability += math.exp(-expectedStrikeouts) * Math.pow(expectedStrikeouts, k) / math.factorial(k);
        }
        return probability;
    }
    /**
     * Get pitcher strikeout factors
     * @param pitcher Pitcher data
     * @param game Game data
     * @param betType 'over' or 'under'
     * @returns Array of factors affecting the bet
     */
    getPitcherStrikeoutFactors(pitcher, game, betType) {
        const factors = [];
        // Pitcher's strikeout rate
        const strikeoutRate = pitcher.strikeoutRate || 0.22;
        const leagueAvgK = 0.22;
        factors.push({
            name: 'Pitcher Strikeout Rate',
            impact: (strikeoutRate - leagueAvgK) * 5,
            weight: 0.3,
            description: `Pitcher K rate: ${(strikeoutRate * 100).toFixed(1)}% vs league avg ${(leagueAvgK * 100).toFixed(1)}%`,
            confidence: 85
        });
        // Opposing team's strikeout tendency
        const opposingTeam = pitcher === game.homePitcher ? game.awayTeam : game.homeTeam;
        const opposingKRate = opposingTeam?.stats?.strikeoutRate || leagueAvgK;
        factors.push({
            name: 'Opposing Team K Rate',
            impact: (opposingKRate - leagueAvgK) * 4,
            weight: 0.25,
            description: `Opposing team K rate: ${(opposingKRate * 100).toFixed(1)}% vs league avg ${(leagueAvgK * 100).toFixed(1)}%`,
            confidence: 80
        });
        // Weather impact if applicable
        if (game.weather && this.isOutdoorSport(game.league)) {
            const windSpeed = game.weather.windSpeed || 0;
            if (windSpeed > 10) {
                factors.push({
                    name: 'Wind Factor',
                    impact: betType === 'under' ? 0.05 : -0.05,
                    weight: 0.1,
                    description: `Wind speed ${windSpeed} mph may affect pitch movement`,
                    confidence: 65
                });
            }
        }
        // Recent form
        if (pitcher.recentForm) {
            factors.push({
                name: 'Recent Performance',
                impact: pitcher.recentForm * 0.1,
                weight: 0.15,
                description: `Pitcher's recent performance trend: ${pitcher.recentForm > 0 ? 'Positive' : 'Negative'}`,
                confidence: 70
            });
        }
        // Umpire factor if available
        if (game.umpire && game.umpire.strikeZoneSize) {
            const umpireImpact = (game.umpire.strikeZoneSize - 1) * 0.1;
            factors.push({
                name: 'Umpire Factor',
                impact: betType === 'over' ? umpireImpact : -umpireImpact,
                weight: 0.1,
                description: `Umpire has a ${game.umpire.strikeZoneSize > 1 ? 'larger' : 'smaller'} than average strike zone`,
                confidence: 60
            });
        }
        return factors;
    }
    /**
     * Analyze hitter prop betting opportunities (MLB)
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Array of hitter prop betting opportunities
     */
    async analyzeHitterProps(game, bankroll) {
        // Simplified implementation - would be more complex in real system
        return [];
    }
    /**
     * Analyze basketball player prop betting opportunities
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Array of basketball player prop betting opportunities
     */
    async analyzeBasketballPlayerProps(game, bankroll) {
        // Simplified implementation - would be more complex in real system
        return [];
    }
    /**
     * Analyze football player prop betting opportunities
     * @param game Game data
     * @param bankroll User's bankroll amount
     * @returns Array of football player prop betting opportunities
     */
    async analyzeFootballPlayerProps(game, bankroll) {
        // Simplified implementation - would be more complex in real system
        return [];
    }
    /**
     * Calculate advanced game probability
     * @param game Game data
     * @returns Object with home and away probabilities and data quality
     */
    calculateAdvancedGameProbability(game) {
        return new Promise((resolve) => {
            // Start with home field advantage
            let homeProb = this.getHomeFieldAdvantage(game.league);
            // Team Quality Differential
            const teamQualityDiff = this.calculateTeamQuality(game.homeTeam, game.awayTeam);
            homeProb += teamQualityDiff * 0.1;
            // Recent Form Analysis (last 10 games weighted)
            const formImpact = this.calculateFormImpact(game.homeTeam, game.awayTeam);
            homeProb += formImpact * 0.15;
            // Injury Impact
            const injuryImpact = this.calculateInjuryImpact(game.homeTeam.injuries || [], game.awayTeam.injuries || [], game.league);
            homeProb += injuryImpact * 0.12;
            // Weather Impact (if applicable)
            if (game.weather && this.isOutdoorSport(game.league)) {
                const weatherImpact = this.getWeatherImpact(game.league, game.weather);
                homeProb += weatherImpact.homeAdvantage;
            }
            // Rest Advantage
            const restImpact = this.getRestImpact(game.league, {
                home: game.homeTeam.restDays || 1,
                away: game.awayTeam.restDays || 1
            });
            homeProb += restImpact * 0.08;
            // Situational factors
            homeProb += this.calculateSituationalFactors(game);
            // Bound probabilities
            homeProb = Math.max(0.15, Math.min(0.85, homeProb));
            resolve({
                homeProbability: homeProb,
                awayProbability: 1 - homeProb,
                dataQuality: this.assessDataQuality(game)
            });
        });
    }
    /**
     * Calculate situational factors impact
     * @param game Game data
     * @returns Impact value (-0.1 to 0.1)
     */
    calculateSituationalFactors(game) {
        let impact = 0;
        // Check for special situations
        if (game.homeTeam.situationalFactors) {
            for (const factor of game.homeTeam.situationalFactors) {
                impact += this.getSituationalFactorImpact(factor, 'home');
            }
        }
        if (game.awayTeam.situationalFactors) {
            for (const factor of game.awayTeam.situationalFactors) {
                impact -= this.getSituationalFactorImpact(factor, 'away');
            }
        }
        return Math.max(-0.1, Math.min(0.1, impact));
    }
    /**
     * Get impact of a situational factor
     * @param factor Situational factor
     * @param side 'home' or 'away'
     * @returns Impact value
     */
    getSituationalFactorImpact(factor, side) {
        // Simplified implementation - would be more complex in real system
        const factorImpacts = {
            'mustWin': 0.03,
            'eliminationGame': 0.04,
            'revenge': 0.02,
            'backToBack': -0.03,
            'longRoadTrip': -0.02,
            'newCoach': 0.01,
            'playerMilestone': 0.01,
            'recordChase': 0.02,
            'retirement': 0.03,
            'tragedy': 0.02,
            'celebration': 0.01,
            'rivalryGame': 0.01
        };
        return factorImpacts[factor.type] || 0;
    }
    /**
     * Calculate advanced total prediction
     * @param game Game data
     * @returns Object with predicted total, over probability, and data quality
     */
    calculateAdvancedTotalPrediction(game) {
        return new Promise((resolve) => {
            let predictedTotal = this.getAverageTotal(game.league);
            // Team offensive/defensive strength
            const offensiveImpact = (game.homeTeam.stats?.pointsFor + game.awayTeam.stats?.pointsFor) / 2;
            const defensiveImpact = (game.homeTeam.stats?.pointsAgainst + game.awayTeam.stats?.pointsAgainst) / 2;
            const leagueAverage = this.getAverageTotal(game.league);
            predictedTotal += (offensiveImpact - leagueAverage) * 0.3;
            predictedTotal += (defensiveImpact - leagueAverage) * 0.2;
            // Weather impact on scoring
            if (game.weather && this.isOutdoorSport(game.league)) {
                const weatherImpact = this.getWeatherImpact(game.league, game.weather);
                predictedTotal += weatherImpact.scoring;
            }
            // Pace and situational factors
            const paceImpact = this.calculatePaceImpact(game);
            predictedTotal += paceImpact;
            // Injury impact on scoring
            const injuryImpact = this.calculateInjuryImpactOnScoring(game);
            predictedTotal += injuryImpact;
            const marketTotal = parseFloat(game.totalLine || predictedTotal.toString());
            // Calculate over probability based on difference between predicted and market total
            const difference = predictedTotal - marketTotal;
            const adjustedOverProb = 0.5 + (difference * 0.02);
            resolve({
                predictedTotal,
                overProbability: Math.max(0.2, Math.min(0.8, adjustedOverProb)),
                dataQuality: this.assessDataQuality(game)
            });
        });
    }
    /**
     * Calculate injury impact on scoring
     * @param game Game data
     * @returns Impact value
     */
    calculateInjuryImpactOnScoring(game) {
        // Simplified implementation - would be more complex in real system
        let impact = 0;
        const homeInjuries = game.homeTeam.injuries || [];
        const awayInjuries = game.awayTeam.injuries || [];
        // Check for key offensive players injured
        const homeOffensiveInjuries = homeInjuries.filter((injury) => injury.playerRole === 'offensive');
        const awayOffensiveInjuries = awayInjuries.filter((injury) => injury.playerRole === 'offensive');
        impact -= homeOffensiveInjuries.length * 0.5;
        impact -= awayOffensiveInjuries.length * 0.5;
        // Check for key defensive players injured
        const homeDefensiveInjuries = homeInjuries.filter((injury) => injury.playerRole === 'defensive');
        const awayDefensiveInjuries = awayInjuries.filter((injury) => injury.playerRole === 'defensive');
        impact += homeDefensiveInjuries.length * 0.3;
        impact += awayDefensiveInjuries.length * 0.3;
        return impact;
    }
    /**
     * Calculate advanced spread prediction
     * @param game Game data
     * @returns Object with home cover probability and data quality
     */
    calculateAdvancedSpreadPrediction(game) {
        return new Promise(async (resolve) => {
            // Get game probability first
            const gameProb = await this.calculateAdvancedGameProbability(game);
            // Get predicted margin
            const predictedMargin = this.calculatePredictedMargin(game, gameProb.homeProbability);
            // Calculate probability of covering the spread
            const spreadLine = parseFloat(game.spreadLine || '0');
            const homeCoverProb = this.calculateSpreadCoverProbability(predictedMargin, spreadLine, game.league);
            resolve({
                homeCoverProbability: homeCoverProb,
                dataQuality: gameProb.dataQuality
            });
        });
    }
    /**
     * Calculate predicted margin of victory
     * @param game Game data
     * @param homeProbability Probability of home team winning
     * @returns Predicted margin (positive for home team, negative for away team)
     */
    calculatePredictedMargin(game, homeProbability) {
        // Convert win probability to expected margin using league-specific formula
        const probDiff = homeProbability - 0.5;
        const marginMultipliers = {
            'NFL': 13.5,
            'NBA': 12.0,
            'MLB': 3.5,
            'NHL': 2.0,
            'NCAA Football': 17.0,
            'NCAA Basketball': 14.0
        };
        const multiplier = marginMultipliers[game.league] || 10;
        return probDiff * multiplier;
    }
    /**
     * Calculate probability of covering the spread
     * @param predictedMargin Predicted margin of victory
     * @param spreadLine Spread line (negative for home favorite)
     * @param league League name
     * @returns Probability of home team covering the spread
     */
    calculateSpreadCoverProbability(predictedMargin, spreadLine, league) {
        // Adjust predicted margin by the spread line
        const adjustedMargin = predictedMargin - spreadLine;
        // Standard deviations by league
        const stdDevs = {
            'NFL': 13.5,
            'NBA': 10.0,
            'MLB': 4.0,
            'NHL': 2.5,
            'NCAA Football': 16.0,
            'NCAA Basketball': 12.0
        };
        const stdDev = stdDevs[league] || 10;
        // Use normal distribution to calculate probability
        // Simplified implementation - would use proper normal CDF in real system
        const z = adjustedMargin / stdDev;
        const probability = 0.5 + 0.5 * math.erf(z / Math.sqrt(2));
        return probability;
    }
    /**
     * Get factors affecting EV for moneyline bets
     * @param game Game data
     * @param side 'home' or 'away'
     * @returns Array of factors
     */
    async getEVFactors(game, side) {
        const factors = [];
        // Team quality
        const teamQualityDiff = this.calculateTeamQuality(game.homeTeam, game.awayTeam);
        factors.push({
            name: 'Team Quality',
            impact: side === 'home' ? teamQualityDiff : -teamQualityDiff,
            weight: 0.25,
            description: `${side === 'home' ? 'Home' : 'Away'} team quality differential: ${(teamQualityDiff * 100).toFixed(1)}%`,
            confidence: 80
        });
        // Recent form
        const formImpact = this.calculateFormImpact(game.homeTeam, game.awayTeam);
        factors.push({
            name: 'Recent Form',
            impact: side === 'home' ? formImpact : -formImpact,
            weight: 0.2,
            description: `${side === 'home' ? 'Home' : 'Away'} team recent form impact: ${(formImpact * 100).toFixed(1)}%`,
            confidence: 75
        });
        // Home field advantage
        const homeAdvantage = this.getHomeFieldAdvantage(game.league);
        factors.push({
            name: 'Home Field Advantage',
            impact: side === 'home' ? homeAdvantage - 0.5 : 0.5 - homeAdvantage,
            weight: 0.15,
            description: `Home field advantage for ${game.league}: ${(homeAdvantage * 100).toFixed(1)}%`,
            confidence: 85
        });
        // Injuries
        const injuryImpact = this.calculateInjuryImpact(game.homeTeam.injuries || [], game.awayTeam.injuries || [], game.league);
        factors.push({
            name: 'Injuries',
            impact: side === 'home' ? injuryImpact : -injuryImpact,
            weight: 0.15,
            description: `Injury impact: ${(injuryImpact * 100).toFixed(1)}%`,
            confidence: 70
        });
        // Rest advantage
        const restImpact = this.getRestImpact(game.league, {
            home: game.homeTeam.restDays || 1,
            away: game.awayTeam.restDays || 1
        });
        factors.push({
            name: 'Rest Advantage',
            impact: side === 'home' ? restImpact : -restImpact,
            weight: 0.1,
            description: `Rest advantage impact: ${(restImpact * 100).toFixed(1)}%`,
            confidence: 80
        });
        // Situational factors
        const situationalImpact = this.calculateSituationalFactors(game);
        factors.push({
            name: 'Situational Factors',
            impact: side === 'home' ? situationalImpact : -situationalImpact,
            weight: 0.1,
            description: `Situational factors impact: ${(situationalImpact * 100).toFixed(1)}%`,
            confidence: 65
        });
        // Weather (if applicable)
        if (game.weather && this.isOutdoorSport(game.league)) {
            const weatherImpact = this.getWeatherImpact(game.league, game.weather);
            factors.push({
                name: 'Weather',
                impact: side === 'home' ? weatherImpact.homeAdvantage : -weatherImpact.homeAdvantage,
                weight: 0.05,
                description: `Weather impact: ${(weatherImpact.homeAdvantage * 100).toFixed(1)}%`,
                confidence: 60
            });
        }
        return factors;
    }
    /**
     * Get factors affecting EV for total bets
     * @param game Game data
     * @param totalPrediction Total prediction data
     * @param betType 'over' or 'under'
     * @returns Array of factors
     */
    async getTotalEVFactors(game, totalPrediction, betType) {
        const factors = [];
        // Team offensive strength
        const homeOffense = game.homeTeam.stats?.pointsFor || 0;
        const awayOffense = game.awayTeam.stats?.pointsFor || 0;
        const leagueAvgOffense = this.getAverageTotal(game.league) / 2;
        const offensiveImpact = ((homeOffense + awayOffense) / 2 - leagueAvgOffense) / leagueAvgOffense;
        factors.push({
            name: 'Offensive Strength',
            impact: betType === 'over' ? offensiveImpact : -offensiveImpact,
            weight: 0.25,
            description: `Combined offensive strength: ${(offensiveImpact * 100).toFixed(1)}% vs league average`,
            confidence: 80
        });
        // Team defensive strength
        const homeDefense = game.homeTeam.stats?.pointsAgainst || 0;
        const awayDefense = game.awayTeam.stats?.pointsAgainst || 0;
        const leagueAvgDefense = this.getAverageTotal(game.league) / 2;
        const defensiveImpact = ((homeDefense + awayDefense) / 2 - leagueAvgDefense) / leagueAvgDefense;
        factors.push({
            name: 'Defensive Strength',
            impact: betType === 'over' ? defensiveImpact : -defensiveImpact,
            weight: 0.2,
            description: `Combined defensive strength: ${(defensiveImpact * 100).toFixed(1)}% vs league average`,
            confidence: 75
        });
        // Pace
        const paceImpact = this.calculatePaceImpact(game) / this.getAverageTotal(game.league);
        factors.push({
            name: 'Game Pace',
            impact: betType === 'over' ? paceImpact : -paceImpact,
            weight: 0.15,
            description: `Game pace impact: ${(paceImpact * 100).toFixed(1)}%`,
            confidence: 70
        });
        // Weather (if applicable)
        if (game.weather && this.isOutdoorSport(game.league)) {
            const weatherImpact = this.getWeatherImpact(game.league, game.weather);
            const normalizedWeatherImpact = weatherImpact.scoring / this.getAverageTotal(game.league);
            factors.push({
                name: 'Weather',
                impact: betType === 'over' ? normalizedWeatherImpact : -normalizedWeatherImpact,
                weight: 0.1,
                description: `Weather impact on scoring: ${weatherImpact.scoring > 0 ? '+' : ''}${weatherImpact.scoring.toFixed(1)} points`,
                confidence: 65
            });
        }
        // Injuries
        const injuryImpact = this.calculateInjuryImpactOnScoring(game) / this.getAverageTotal(game.league);
        factors.push({
            name: 'Injuries',
            impact: betType === 'over' ? injuryImpact : -injuryImpact,
            weight: 0.15,
            description: `Injury impact on scoring: ${injuryImpact > 0 ? '+' : ''}${(injuryImpact * 100).toFixed(1)}%`,
            confidence: 70
        });
        // Rest impact on scoring
        const restDaysImpact = (game.homeTeam.restDays + game.awayTeam.restDays) / 2 - 3;
        const restScoringImpact = restDaysImpact * 0.01;
        factors.push({
            name: 'Rest Impact',
            impact: betType === 'over' ? restScoringImpact : -restScoringImpact,
            weight: 0.05,
            description: `Rest impact on scoring: ${restScoringImpact > 0 ? '+' : ''}${(restScoringImpact * 100).toFixed(1)}%`,
            confidence: 60
        });
        // Line value
        const marketTotal = parseFloat(game.totalLine || '0');
        const lineValue = (totalPrediction.predictedTotal - marketTotal) / marketTotal;
        factors.push({
            name: 'Line Value',
            impact: betType === 'over' ? lineValue : -lineValue,
            weight: 0.1,
            description: `Model predicts ${lineValue > 0 ? 'higher' : 'lower'} total by ${Math.abs(totalPrediction.predictedTotal - marketTotal).toFixed(1)} points`,
            confidence: 75
        });
        return factors;
    }
    /**
     * Get factors affecting EV for spread bets
     * @param game Game data
     * @param spreadPrediction Spread prediction data
     * @param side 'home' or 'away'
     * @returns Array of factors
     */
    async getSpreadEVFactors(game, spreadPrediction, side) {
        // Simplified implementation - would be more complex in real system
        return [];
    }
    /**
     * Calculate confidence level based on factors and data quality
     * @param factors Array of factors
     * @param dataQuality Data quality score
     * @returns Confidence level (0-100)
     */
    calculateConfidenceLevel(factors, dataQuality) {
        if (factors.length === 0)
            return 50;
        // Calculate weighted average of factor confidences
        let totalWeight = 0;
        let weightedConfidence = 0;
        for (const factor of factors) {
            weightedConfidence += factor.confidence * factor.weight;
            totalWeight += factor.weight;
        }
        const factorConfidence = weightedConfidence / totalWeight;
        // Combine factor confidence with data quality
        return Math.round((factorConfidence * 0.7) + (dataQuality * 0.3));
    }
    /**
     * Assign tier based on EV and confidence
     * @param ev Expected value
     * @param confidence Confidence level
     * @returns Tier classification
     */
    assignTier(ev, confidence) {
        if (ev > 0.08 && confidence > 75)
            return 'Tier1';
        if (ev > 0.05 && confidence > 65)
            return 'Tier2';
        if (ev > 0.03 && confidence > 55)
            return 'Tier3';
        return 'Avoid';
    }
    /**
     * Calculate Kelly bet size
     * @param ev Expected value
     * @param odds American odds
     * @param bankroll Bankroll amount
     * @param confidence Confidence level
     * @returns Bet size recommendation
     */
    calculateKellyBetSize(ev, odds, bankroll, confidence) {
        // Kelly Criterion: f = (bp - q) / b
        // Where b = decimal odds - 1, p = probability, q = 1-p
        const decimalOdds = this.americanToDecimal(odds);
        const b = decimalOdds - 1;
        const p = ev + this.oddsToImpliedProbability(odds); // Approximate true probability
        const q = 1 - p;
        const fullKelly = Math.max(0, (b * p - q) / b);
        // Use 25% Kelly (fractional Kelly for reduced variance)
        const fractionalKelly = fullKelly * 0.25;
        // Apply confidence scaling
        const confidenceMultiplier = confidence / 100;
        const finalKelly = fractionalKelly * confidenceMultiplier;
        // Calculate bet amounts based on tiers
        let recommendedPercent;
        if (ev > 0.1 && confidence > 80) {
            recommendedPercent = Math.min(finalKelly, 0.05); // Max 5% for Tier 1
        }
        else if (ev > 0.05 && confidence > 65) {
            recommendedPercent = Math.min(finalKelly, 0.03); // Max 3% for Tier 2
        }
        else {
            recommendedPercent = Math.min(finalKelly, 0.01); // Max 1% for Tier 3
        }
        const betAmount = Math.floor(bankroll * recommendedPercent);
        const maxBetAmount = Math.floor(bankroll * 0.05); // Never exceed 5%
        const reasoning = [
            `EV: ${(ev * 100).toFixed(1)}%`,
            `Confidence: ${confidence}%`,
            `Kelly suggests: ${(fullKelly * 100).toFixed(1)}% of bankroll`,
            `Recommended: ${(recommendedPercent * 100).toFixed(1)}% (fractional Kelly with confidence scaling)`
        ];
        return {
            betAmount: Math.min(betAmount, maxBetAmount),
            maxBetAmount,
            kellyFraction: fractionalKelly,
            confidence,
            reasoning
        };
    }
    /**
     * Rank and tier betting opportunities
     * @param opportunities Array of betting opportunities
     * @returns Ranked and tiered opportunities
     */
    rankAndTierOpportunities(opportunities) {
        // Sort by EV and confidence
        return opportunities.sort((a, b) => {
            // First sort by tier
            const tierOrder = { 'Tier1': 0, 'Tier2': 1, 'Tier3': 2, 'Avoid': 3 };
            if (tierOrder[a.tier] !== tierOrder[b.tier]) {
                return tierOrder[a.tier] - tierOrder[b.tier];
            }
            // Then by EV
            return b.expectedValue - a.expectedValue;
        });
    }
}
exports.EVPredictionEngine = EVPredictionEngine;
