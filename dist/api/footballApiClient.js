"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * API client for API-Football
 * Handles fetching data from API-Football API
 */
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
class FootballApiClient {
    constructor() {
        this.baseUrl = env_1.default.FOOTBALL_API_BASE_URL;
        this.apiKey = env_1.default.FOOTBALL_API_KEY;
        this.headers = {
            'x-apisports-key': this.apiKey
        };
    }
    /**
     * Get all available leagues
     */
    async getLeagues() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/leagues`, {
                headers: this.headers
            });
            logger_1.default.info('Successfully fetched all leagues from API-Football');
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching leagues from API-Football: ${error}`);
            throw error;
        }
    }
    /**
     * Get leagues by country
     * @param country Country name
     */
    async getLeaguesByCountry(country) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/leagues`, {
                headers: this.headers,
                params: { country }
            });
            logger_1.default.info(`Successfully fetched leagues for country: ${country}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching leagues for country ${country}: ${error}`);
            throw error;
        }
    }
    /**
     * Get teams in a league
     * @param leagueId League ID
     * @param season Season (e.g., "2023")
     */
    async getTeams(leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/teams`, {
                headers: this.headers,
                params: { league: leagueId, season }
            });
            logger_1.default.info(`Successfully fetched teams for league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching teams for league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get team statistics
     * @param teamId Team ID
     * @param leagueId League ID
     * @param season Season (e.g., "2023")
     */
    async getTeamStatistics(teamId, leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/teams/statistics`, {
                headers: this.headers,
                params: { team: teamId, league: leagueId, season }
            });
            logger_1.default.info(`Successfully fetched statistics for team ID: ${teamId}, league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching statistics for team ID ${teamId}, league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixtures (matches) by date
     * @param date Date in format YYYY-MM-DD
     */
    async getFixturesByDate(date) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures`, {
                headers: this.headers,
                params: { date }
            });
            logger_1.default.info(`Successfully fetched fixtures for date: ${date}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching fixtures for date ${date}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixtures by league and season
     * @param leagueId League ID
     * @param season Season (e.g., "2023")
     */
    async getFixturesByLeague(leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures`, {
                headers: this.headers,
                params: { league: leagueId, season }
            });
            logger_1.default.info(`Successfully fetched fixtures for league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching fixtures for league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixtures by team
     * @param teamId Team ID
     * @param season Season (e.g., "2023")
     */
    async getFixturesByTeam(teamId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures`, {
                headers: this.headers,
                params: { team: teamId, season }
            });
            logger_1.default.info(`Successfully fetched fixtures for team ID: ${teamId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching fixtures for team ID ${teamId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixture statistics
     * @param fixtureId Fixture ID
     */
    async getFixtureStatistics(fixtureId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures/statistics`, {
                headers: this.headers,
                params: { fixture: fixtureId }
            });
            logger_1.default.info(`Successfully fetched statistics for fixture ID: ${fixtureId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching statistics for fixture ID ${fixtureId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixture events (goals, cards, etc.)
     * @param fixtureId Fixture ID
     */
    async getFixtureEvents(fixtureId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures/events`, {
                headers: this.headers,
                params: { fixture: fixtureId }
            });
            logger_1.default.info(`Successfully fetched events for fixture ID: ${fixtureId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching events for fixture ID ${fixtureId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixture lineups
     * @param fixtureId Fixture ID
     */
    async getFixtureLineups(fixtureId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures/lineups`, {
                headers: this.headers,
                params: { fixture: fixtureId }
            });
            logger_1.default.info(`Successfully fetched lineups for fixture ID: ${fixtureId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching lineups for fixture ID ${fixtureId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get fixture player statistics
     * @param fixtureId Fixture ID
     */
    async getFixturePlayerStats(fixtureId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/fixtures/players`, {
                headers: this.headers,
                params: { fixture: fixtureId }
            });
            logger_1.default.info(`Successfully fetched player statistics for fixture ID: ${fixtureId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching player statistics for fixture ID ${fixtureId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get league standings
     * @param leagueId League ID
     * @param season Season (e.g., "2023")
     */
    async getStandings(leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/standings`, {
                headers: this.headers,
                params: { league: leagueId, season }
            });
            logger_1.default.info(`Successfully fetched standings for league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching standings for league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get player statistics
     * @param playerId Player ID
     * @param season Season (e.g., "2023")
     */
    async getPlayerStatistics(playerId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/players`, {
                headers: this.headers,
                params: { id: playerId, season }
            });
            logger_1.default.info(`Successfully fetched statistics for player ID: ${playerId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching statistics for player ID ${playerId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get betting odds for fixtures
     * @param fixtureId Fixture ID
     */
    async getOdds(fixtureId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/odds`, {
                headers: this.headers,
                params: { fixture: fixtureId }
            });
            logger_1.default.info(`Successfully fetched odds for fixture ID: ${fixtureId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching odds for fixture ID ${fixtureId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get betting odds by league
     * @param leagueId League ID
     * @param season Season (e.g., "2023")
     */
    async getOddsByLeague(leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/odds`, {
                headers: this.headers,
                params: { league: leagueId, season }
            });
            logger_1.default.info(`Successfully fetched odds for league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching odds for league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
    /**
     * Get injuries
     * @param leagueId League ID
     * @param season Season (e.g., "2023")
     */
    async getInjuries(leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/injuries`, {
                headers: this.headers,
                params: { league: leagueId, season }
            });
            logger_1.default.info(`Successfully fetched injuries for league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching injuries for league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
}
exports.default = new FootballApiClient();
