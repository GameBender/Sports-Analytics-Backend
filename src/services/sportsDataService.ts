/**
 * Data service for sports data
 * Handles fetching and processing sports data from APIs
 */
import theSportsDBClient from '../api/theSportsDBClient';
import footballApiClient from '../api/footballApiClient';
import logger from '../utils/logger';
import config from '../config/env';

class SportsDataService {
  /**
   * Get upcoming games for a specific sport
   * @param sport Sport name
   * @param date Optional date string (YYYY-MM-DD)
   * @returns Array of upcoming games with odds
   */
  async getUpcomingGames(sport: string, date?: string): Promise<any[]> {
    try {
      const games: any[] = [];
      
      // Use different APIs based on sport type
      if (sport === 'soccer' || sport.includes('football')) {
        const soccerGames = await this.getUpcomingSoccerGames(date);
        games.push(...soccerGames);
      } else {
        const otherGames = await this.getUpcomingGamesBySport(sport, date);
        games.push(...otherGames);
      }
      
      // Enrich games with odds and additional data
      const enrichedGames = await this.enrichGamesWithOdds(games, sport);
      
      logger.info(`Successfully fetched ${enrichedGames.length} upcoming games for ${sport}`);
      return enrichedGames;
    } catch (error) {
      logger.error(`Error fetching upcoming games for ${sport}: ${error}`);
      throw error;
    }
  }

  /**
   * Get upcoming soccer games using API-Football
   * @param date Optional date string (YYYY-MM-DD)
   * @returns Array of upcoming soccer games
   */
  private async getUpcomingSoccerGames(date?: string): Promise<any[]> {
    try {
      const currentDate = date || this.formatDate(new Date());
      const response = await footballApiClient.getFixturesByDate(currentDate);
      
      // Transform API response to standard game format
      return this.transformFootballApiGames(response.response || []);
    } catch (error) {
      logger.error(`Error fetching upcoming soccer games: ${error}`);
      return [];
    }
  }

  /**
   * Get upcoming games for non-soccer sports using TheSportsDB
   * @param sport Sport name
   * @param date Optional date string (YYYY-MM-DD)
   * @returns Array of upcoming games
   */
  private async getUpcomingGamesBySport(sport: string, date?: string): Promise<any[]> {
    try {
      const currentDate = date || this.formatDate(new Date());
      const response = await theSportsDBClient.getEventsByDate(currentDate);
      
      // Filter events by sport and transform to standard game format
      const events = response.events || [];
      const filteredEvents = events.filter((event: any) => this.matchesSport(event.strSport, sport));
      
      return this.transformSportsDBGames(filteredEvents);
    } catch (error) {
      logger.error(`Error fetching upcoming games for ${sport}: ${error}`);
      return [];
    }
  }

  /**
   * Enrich games with odds and additional data
   * @param games Array of games
   * @param sport Sport name
   * @returns Enriched games with odds
   */
  private async enrichGamesWithOdds(games: any[], sport: string): Promise<any[]> {
    const enrichedGames = [];
    
    for (const game of games) {
      try {
        // Add mock odds for now - would fetch real odds in production
        const enrichedGame = {
          ...game,
          homeMoneyline: this.generateMockOdds(true),
          awayMoneyline: this.generateMockOdds(false),
          totalLine: this.generateMockTotalLine(sport),
          overOdds: '-110',
          underOdds: '-110',
          spreadLine: this.generateMockSpreadLine(sport),
          homeSpreadOdds: '-110',
          awaySpreadOdds: '-110'
        };
        
        // Add mock situational factors
        enrichedGame.homeTeam.situationalFactors = this.generateMockSituationalFactors();
        enrichedGame.awayTeam.situationalFactors = this.generateMockSituationalFactors();
        
        // Add mock injuries
        enrichedGame.homeTeam.injuries = this.generateMockInjuries();
        enrichedGame.awayTeam.injuries = this.generateMockInjuries();
        
        // Add mock rest days
        enrichedGame.homeTeam.restDays = Math.floor(Math.random() * 5) + 1;
        enrichedGame.awayTeam.restDays = Math.floor(Math.random() * 5) + 1;
        
        // Add mock weather for outdoor sports
        if (this.isOutdoorSport(sport)) {
          enrichedGame.weather = this.generateMockWeather();
        }
        
        enrichedGames.push(enrichedGame);
      } catch (error) {
        logger.error(`Error enriching game data: ${error}`);
      }
    }
    
    return enrichedGames;
  }

  /**
   * Transform Football API games to standard format
   * @param fixtures Array of fixtures from Football API
   * @returns Standardized game objects
   */
  private transformFootballApiGames(fixtures: any[]): any[] {
    return fixtures.map(fixture => {
      return {
        id: fixture.fixture.id,
        league: fixture.league.name,
        dateTime: fixture.fixture.date,
        homeTeam: {
          id: fixture.teams.home.id,
          name: fixture.teams.home.name,
          stats: {
            winPercentage: fixture.teams.home.winner ? 0.6 : 0.4,
            pointsFor: 0,
            pointsAgainst: 0
          },
          recentForm: Math.random() * 2 - 1 // Random value between -1 and 1
        },
        awayTeam: {
          id: fixture.teams.away.id,
          name: fixture.teams.away.name,
          stats: {
            winPercentage: fixture.teams.away.winner ? 0.6 : 0.4,
            pointsFor: 0,
            pointsAgainst: 0
          },
          recentForm: Math.random() * 2 - 1 // Random value between -1 and 1
        }
      };
    });
  }

  /**
   * Transform TheSportsDB games to standard format
   * @param events Array of events from TheSportsDB
   * @returns Standardized game objects
   */
  private transformSportsDBGames(events: any[]): any[] {
    return events.map(event => {
      return {
        id: event.idEvent,
        league: event.strLeague,
        dateTime: event.strTimestamp,
        homeTeam: {
          id: event.idHomeTeam,
          name: event.strHomeTeam,
          stats: {
            winPercentage: Math.random() * 0.5 + 0.25, // Random value between 0.25 and 0.75
            pointsFor: this.generateMockPoints(event.strSport),
            pointsAgainst: this.generateMockPoints(event.strSport)
          },
          recentForm: Math.random() * 2 - 1 // Random value between -1 and 1
        },
        awayTeam: {
          id: event.idAwayTeam,
          name: event.strAwayTeam,
          stats: {
            winPercentage: Math.random() * 0.5 + 0.25, // Random value between 0.25 and 0.75
            pointsFor: this.generateMockPoints(event.strSport),
            pointsAgainst: this.generateMockPoints(event.strSport)
          },
          recentForm: Math.random() * 2 - 1 // Random value between -1 and 1
        }
      };
    });
  }

  /**
   * Check if a sport from the API matches the requested sport
   * @param apiSport Sport name from API
   * @param requestedSport Requested sport name
   * @returns Boolean indicating if sports match
   */
  private matchesSport(apiSport: string, requestedSport: string): boolean {
    const sportMappings: Record<string, string[]> = {
      'soccer': ['Soccer', 'Football'],
      'basketball': ['Basketball'],
      'baseball': ['Baseball'],
      'hockey': ['Ice Hockey'],
      'american_football': ['American Football'],
      'college_football': ['American Football'],
      'college_basketball': ['Basketball']
    };
    
    const matchingSports = sportMappings[requestedSport] || [];
    return matchingSports.includes(apiSport);
  }

  /**
   * Format date to YYYY-MM-DD
   * @param date Date object
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate mock odds for testing
   * @param isHome Whether odds are for home team
   * @returns Mock American odds string
   */
  private generateMockOdds(isHome: boolean): string {
    const favoredOdds = Math.floor(Math.random() * 200) + 100;
    const underdogOdds = Math.floor(Math.random() * 200) + 100;
    
    if (Math.random() > 0.5) {
      return isHome ? `-${favoredOdds}` : `+${underdogOdds}`;
    } else {
      return isHome ? `+${underdogOdds}` : `-${favoredOdds}`;
    }
  }

  /**
   * Generate mock total line for testing
   * @param sport Sport name
   * @returns Mock total line string
   */
  private generateMockTotalLine(sport: string): string {
    const baseTotals: Record<string, number> = {
      'soccer': 2.5,
      'basketball': 220,
      'baseball': 8.5,
      'hockey': 5.5,
      'american_football': 45.5,
      'college_football': 52.5,
      'college_basketball': 145
    };
    
    const baseTotal = baseTotals[sport] || 10;
    const variation = baseTotal * 0.1;
    const total = baseTotal + (Math.random() * variation * 2 - variation);
    
    return total.toFixed(1);
  }

  /**
   * Generate mock spread line for testing
   * @param sport Sport name
   * @returns Mock spread line string
   */
  private generateMockSpreadLine(sport: string): string {
    const baseSpreads: Record<string, number> = {
      'soccer': 0.5,
      'basketball': 5.5,
      'baseball': 1.5,
      'hockey': 1.5,
      'american_football': 3.5,
      'college_football': 7.5,
      'college_basketball': 4.5
    };
    
    const baseSpread = baseSpreads[sport] || 1;
    const variation = baseSpread;
    const spread = baseSpread + (Math.random() * variation * 2 - variation);
    
    return (Math.random() > 0.5 ? '-' : '') + spread.toFixed(1);
  }

  /**
   * Generate mock points for testing
   * @param sport Sport name
   * @returns Mock points value
   */
  private generateMockPoints(sport: string): number {
    const basePoints: Record<string, number> = {
      'Soccer': 1.5,
      'Basketball': 110,
      'Baseball': 4.5,
      'Ice Hockey': 2.8,
      'American Football': 24
    };
    
    const base = basePoints[sport] || 10;
    const variation = base * 0.2;
    
    return base + (Math.random() * variation * 2 - variation);
  }

  /**
   * Generate mock situational factors for testing
   * @returns Array of mock situational factors
   */
  private generateMockSituationalFactors(): any[] {
    const factors = [
      { type: 'mustWin', description: 'Must-win game for playoff implications' },
      { type: 'revenge', description: 'Revenge game against team that won last matchup' },
      { type: 'backToBack', description: 'Second game of back-to-back' },
      { type: 'longRoadTrip', description: 'End of long road trip' },
      { type: 'newCoach', description: 'First game with new coach' },
      { type: 'playerMilestone', description: 'Star player approaching milestone' },
      { type: 'recordChase', description: 'Team chasing historical record' },
      { type: 'rivalryGame', description: 'Historic rivalry game' }
    ];
    
    // Randomly select 0-2 factors
    const numFactors = Math.floor(Math.random() * 3);
    const selectedFactors = [];
    
    for (let i = 0; i < numFactors; i++) {
      const randomIndex = Math.floor(Math.random() * factors.length);
      selectedFactors.push(factors[randomIndex]);
      factors.splice(randomIndex, 1);
    }
    
    return selectedFactors;
  }

  /**
   * Generate mock injuries for testing
   * @returns Array of mock injuries
   */
  private generateMockInjuries(): any[] {
    const injuries = [];
    const numInjuries = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numInjuries; i++) {
      injuries.push({
        playerName: `Player ${i + 1}`,
        playerRole: Math.random() > 0.5 ? 'offensive' : 'defensive',
        injuryType: 'Undisclosed',
        status: Math.random() > 0.7 ? 'Out' : 'Questionable'
      });
    }
    
    return injuries;
  }

  /**
   * Generate mock weather for testing
   * @returns Mock weather object
   */
  private generateMockWeather(): any {
    return {
      temperature: Math.floor(Math.random() * 50) + 40, // 40-90 degrees
      precipitation: Math.random() * 0.8,
      windSpeed: Math.floor(Math.random() * 25)
    };
  }

  /**
   * Check if a sport is played outdoors
   * @param sport Sport name
   * @returns Boolean indicating if sport is outdoor
   */
  private isOutdoorSport(sport: string): boolean {
    const outdoorSports = [
      'soccer', 'baseball', 'american_football', 'college_football'
    ];
    
    return outdoorSports.includes(sport);
  }
}

export default new SportsDataService();
