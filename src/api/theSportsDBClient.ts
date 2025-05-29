/**
 * API client for TheSportsDB
 * Handles fetching data from TheSportsDB API
 */
import axios from 'axios';
import config from '../config/env';
import logger from '../utils/logger';

class TheSportsDBClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.SPORTS_DB_BASE_URL;
    this.apiKey = config.SPORTS_DB_API_KEY;
  }

  /**
   * Get all leagues
   */
  async getAllLeagues(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/all_leagues.php`);
      logger.info('Successfully fetched all leagues from TheSportsDB');
      return response.data;
    } catch (error) {
      logger.error(`Error fetching leagues from TheSportsDB: ${error}`);
      throw error;
    }
  }

  /**
   * Search for teams by name
   * @param teamName Team name to search for
   */
  async searchTeams(teamName: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/searchteams.php`, {
        params: { t: teamName }
      });
      logger.info(`Successfully searched for team: ${teamName}`);
      return response.data;
    } catch (error) {
      logger.error(`Error searching for team ${teamName}: ${error}`);
      throw error;
    }
  }

  /**
   * Get all teams in a league
   * @param leagueName League name
   */
  async getTeamsByLeague(leagueName: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/search_all_teams.php`, {
        params: { l: leagueName }
      });
      logger.info(`Successfully fetched teams for league: ${leagueName}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching teams for league ${leagueName}: ${error}`);
      throw error;
    }
  }

  /**
   * Get team details by ID
   * @param teamId Team ID
   */
  async getTeamDetails(teamId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookupteam.php`, {
        params: { id: teamId }
      });
      logger.info(`Successfully fetched details for team ID: ${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching details for team ID ${teamId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get all players in a team
   * @param teamId Team ID
   */
  async getPlayersByTeam(teamId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookup_all_players.php`, {
        params: { id: teamId }
      });
      logger.info(`Successfully fetched players for team ID: ${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching players for team ID ${teamId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get player details by ID
   * @param playerId Player ID
   */
  async getPlayerDetails(playerId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookupplayer.php`, {
        params: { id: playerId }
      });
      logger.info(`Successfully fetched details for player ID: ${playerId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching details for player ID ${playerId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get upcoming events for a team
   * @param teamId Team ID
   */
  async getUpcomingEvents(teamId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/eventsnext.php`, {
        params: { id: teamId }
      });
      logger.info(`Successfully fetched upcoming events for team ID: ${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching upcoming events for team ID ${teamId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get past events for a team
   * @param teamId Team ID
   */
  async getPastEvents(teamId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/eventslast.php`, {
        params: { id: teamId }
      });
      logger.info(`Successfully fetched past events for team ID: ${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching past events for team ID ${teamId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get event details by ID
   * @param eventId Event ID
   */
  async getEventDetails(eventId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookupevent.php`, {
        params: { id: eventId }
      });
      logger.info(`Successfully fetched details for event ID: ${eventId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching details for event ID ${eventId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get events on a specific date
   * @param date Date in format YYYY-MM-DD
   */
  async getEventsByDate(date: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/eventsday.php`, {
        params: { d: date, s: 'all' }
      });
      logger.info(`Successfully fetched events for date: ${date}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching events for date ${date}: ${error}`);
      throw error;
    }
  }

  /**
   * Get league details by ID
   * @param leagueId League ID
   */
  async getLeagueDetails(leagueId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookupleague.php`, {
        params: { id: leagueId }
      });
      logger.info(`Successfully fetched details for league ID: ${leagueId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching details for league ID ${leagueId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get league seasons
   * @param leagueId League ID
   */
  async getLeagueSeasons(leagueId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookupleague.php`, {
        params: { id: leagueId, s: 'all' }
      });
      logger.info(`Successfully fetched seasons for league ID: ${leagueId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching seasons for league ID ${leagueId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get league table/standings
   * @param leagueId League ID
   * @param season Season (e.g., "2023-2024")
   */
  async getLeagueTable(leagueId: string, season: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/lookuptable.php`, {
        params: { l: leagueId, s: season }
      });
      logger.info(`Successfully fetched table for league ID: ${leagueId}, season: ${season}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching table for league ID ${leagueId}, season ${season}: ${error}`);
      throw error;
    }
  }
}

export default new TheSportsDBClient();
