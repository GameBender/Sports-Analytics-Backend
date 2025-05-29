"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * API client for TheSportsDB
 * Handles fetching data from TheSportsDB API
 */
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
class TheSportsDBClient {
    constructor() {
        this.baseUrl = env_1.default.SPORTS_DB_BASE_URL;
        this.apiKey = env_1.default.SPORTS_DB_API_KEY;
    }
    /**
     * Get all leagues
     */
    async getAllLeagues() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/all_leagues.php`);
            logger_1.default.info('Successfully fetched all leagues from TheSportsDB');
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching leagues from TheSportsDB: ${error}`);
            throw error;
        }
    }
    /**
     * Search for teams by name
     * @param teamName Team name to search for
     */
    async searchTeams(teamName) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/searchteams.php`, {
                params: { t: teamName }
            });
            logger_1.default.info(`Successfully searched for team: ${teamName}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error searching for team ${teamName}: ${error}`);
            throw error;
        }
    }
    /**
     * Get all teams in a league
     * @param leagueName League name
     */
    async getTeamsByLeague(leagueName) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/search_all_teams.php`, {
                params: { l: leagueName }
            });
            logger_1.default.info(`Successfully fetched teams for league: ${leagueName}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching teams for league ${leagueName}: ${error}`);
            throw error;
        }
    }
    /**
     * Get team details by ID
     * @param teamId Team ID
     */
    async getTeamDetails(teamId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookupteam.php`, {
                params: { id: teamId }
            });
            logger_1.default.info(`Successfully fetched details for team ID: ${teamId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching details for team ID ${teamId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get all players in a team
     * @param teamId Team ID
     */
    async getPlayersByTeam(teamId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookup_all_players.php`, {
                params: { id: teamId }
            });
            logger_1.default.info(`Successfully fetched players for team ID: ${teamId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching players for team ID ${teamId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get player details by ID
     * @param playerId Player ID
     */
    async getPlayerDetails(playerId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookupplayer.php`, {
                params: { id: playerId }
            });
            logger_1.default.info(`Successfully fetched details for player ID: ${playerId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching details for player ID ${playerId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get upcoming events for a team
     * @param teamId Team ID
     */
    async getUpcomingEvents(teamId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/eventsnext.php`, {
                params: { id: teamId }
            });
            logger_1.default.info(`Successfully fetched upcoming events for team ID: ${teamId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching upcoming events for team ID ${teamId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get past events for a team
     * @param teamId Team ID
     */
    async getPastEvents(teamId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/eventslast.php`, {
                params: { id: teamId }
            });
            logger_1.default.info(`Successfully fetched past events for team ID: ${teamId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching past events for team ID ${teamId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get event details by ID
     * @param eventId Event ID
     */
    async getEventDetails(eventId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookupevent.php`, {
                params: { id: eventId }
            });
            logger_1.default.info(`Successfully fetched details for event ID: ${eventId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching details for event ID ${eventId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get events on a specific date
     * @param date Date in format YYYY-MM-DD
     */
    async getEventsByDate(date) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/eventsday.php`, {
                params: { d: date, s: 'all' }
            });
            logger_1.default.info(`Successfully fetched events for date: ${date}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching events for date ${date}: ${error}`);
            throw error;
        }
    }
    /**
     * Get league details by ID
     * @param leagueId League ID
     */
    async getLeagueDetails(leagueId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookupleague.php`, {
                params: { id: leagueId }
            });
            logger_1.default.info(`Successfully fetched details for league ID: ${leagueId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching details for league ID ${leagueId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get league seasons
     * @param leagueId League ID
     */
    async getLeagueSeasons(leagueId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookupleague.php`, {
                params: { id: leagueId, s: 'all' }
            });
            logger_1.default.info(`Successfully fetched seasons for league ID: ${leagueId}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching seasons for league ID ${leagueId}: ${error}`);
            throw error;
        }
    }
    /**
     * Get league table/standings
     * @param leagueId League ID
     * @param season Season (e.g., "2023-2024")
     */
    async getLeagueTable(leagueId, season) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiKey}/lookuptable.php`, {
                params: { l: leagueId, s: season }
            });
            logger_1.default.info(`Successfully fetched table for league ID: ${leagueId}, season: ${season}`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error fetching table for league ID ${leagueId}, season ${season}: ${error}`);
            throw error;
        }
    }
}
exports.default = new TheSportsDBClient();
