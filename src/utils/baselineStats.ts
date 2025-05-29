/**
 * Base class for statistical models and calculations
 * Provides common utility functions for sports analytics
 */
import * as math from 'mathjs';
import logger from './logger';

export class BaselineStats {
  /**
   * Convert American odds to decimal odds
   * @param americanOdds American odds (e.g., +150, -200)
   * @returns Decimal odds
   */
  protected americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return 1 + (americanOdds / 100);
    } else {
      return 1 + (100 / Math.abs(americanOdds));
    }
  }

  /**
   * Convert decimal odds to American odds
   * @param decimalOdds Decimal odds (e.g., 2.5, 1.5)
   * @returns American odds
   */
  protected decimalToAmerican(decimalOdds: number): number {
    if (decimalOdds >= 2) {
      return Math.round((decimalOdds - 1) * 100);
    } else {
      return Math.round(-100 / (decimalOdds - 1));
    }
  }

  /**
   * Convert American odds to implied probability
   * @param americanOdds American odds (e.g., +150, -200)
   * @returns Implied probability (0-1)
   */
  protected oddsToImpliedProbability(americanOdds: number): number {
    const decimalOdds = this.americanToDecimal(americanOdds);
    return 1 / decimalOdds;
  }

  /**
   * Parse American odds from string
   * @param oddsString Odds string (e.g., "+150", "-200")
   * @returns American odds as number
   */
  protected parseAmericanOdds(oddsString: string): number {
    return parseInt(oddsString, 10);
  }

  /**
   * Calculate Expected Value (EV) for a bet
   * @param modelProbability Model's estimated probability (0-1)
   * @param americanOdds American odds (e.g., +150, -200)
   * @returns Expected value (e.g., 0.05 for 5% EV)
   */
  protected calculateEV(modelProbability: number, americanOdds: number): number {
    const impliedProbability = this.oddsToImpliedProbability(americanOdds);
    return (modelProbability * (this.americanToDecimal(americanOdds) - 1)) - (1 - modelProbability);
  }

  /**
   * Get home field advantage factor by league
   * @param league League name
   * @returns Home field advantage factor (0-1)
   */
  protected getHomeFieldAdvantage(league: string): number {
    const advantages: Record<string, number> = {
      'NFL': 0.57,
      'NBA': 0.60,
      'MLB': 0.54,
      'NHL': 0.55,
      'MLS': 0.58,
      'Premier League': 0.59,
      'La Liga': 0.58,
      'Bundesliga': 0.57,
      'Serie A': 0.58,
      'Ligue 1': 0.58,
      'NCAA Football': 0.62,
      'NCAA Basketball': 0.65
    };

    return advantages[league] || 0.56; // Default if league not found
  }

  /**
   * Get average total points/goals for a league
   * @param league League name
   * @returns Average total
   */
  protected getAverageTotal(league: string): number {
    const averages: Record<string, number> = {
      'NFL': 44.5,
      'NBA': 224.0,
      'MLB': 8.5,
      'NHL': 5.5,
      'MLS': 2.7,
      'Premier League': 2.6,
      'La Liga': 2.5,
      'Bundesliga': 3.0,
      'Serie A': 2.7,
      'Ligue 1': 2.6,
      'NCAA Football': 51.0,
      'NCAA Basketball': 145.0
    };

    return averages[league] || 0;
  }

  /**
   * Check if a sport is played outdoors
   * @param league League name
   * @returns Boolean indicating if sport is outdoor
   */
  protected isOutdoorSport(league: string): boolean {
    const outdoorSports = [
      'NFL', 'MLB', 'MLS', 'Premier League', 'La Liga', 
      'Bundesliga', 'Serie A', 'Ligue 1', 'NCAA Football'
    ];
    
    return outdoorSports.includes(league);
  }

  /**
   * Calculate team quality differential
   * @param homeTeam Home team data
   * @param awayTeam Away team data
   * @returns Quality differential factor (-1 to 1)
   */
  protected calculateTeamQuality(homeTeam: any, awayTeam: any): number {
    // Simplified implementation - would be more complex in real system
    const homeWinPct = homeTeam.stats?.winPercentage || 0.5;
    const awayWinPct = awayTeam.stats?.winPercentage || 0.5;
    
    return homeWinPct - awayWinPct;
  }

  /**
   * Calculate impact of team form (recent performance)
   * @param homeTeam Home team data
   * @param awayTeam Away team data
   * @returns Form impact factor (-0.2 to 0.2)
   */
  protected calculateFormImpact(homeTeam: any, awayTeam: any): number {
    // Simplified implementation - would analyze last N games
    const homeForm = homeTeam.recentForm || 0;
    const awayForm = awayTeam.recentForm || 0;
    
    return Math.max(-0.2, Math.min(0.2, (homeForm - awayForm) * 0.05));
  }

  /**
   * Calculate impact of injuries on team performance
   * @param homeInjuries Home team injuries
   * @param awayInjuries Away team injuries
   * @param league League name
   * @returns Injury impact factor (-0.15 to 0.15)
   */
  protected calculateInjuryImpact(homeInjuries: any[], awayInjuries: any[], league: string): number {
    // Simplified implementation - would consider player importance
    const homeImpact = this.calculateTeamInjuryImpact(homeInjuries);
    const awayImpact = this.calculateTeamInjuryImpact(awayInjuries);
    
    return Math.max(-0.15, Math.min(0.15, awayImpact - homeImpact));
  }

  /**
   * Calculate injury impact for a single team
   * @param injuries Array of injuries
   * @returns Injury impact value (0-1)
   */
  private calculateTeamInjuryImpact(injuries: any[]): number {
    if (!injuries || injuries.length === 0) return 0;
    
    // Simplified - would consider player importance, position, etc.
    return Math.min(1, injuries.length * 0.02);
  }

  /**
   * Get weather impact on game
   * @param league League name
   * @param weather Weather data
   * @returns Weather impact object
   */
  protected getWeatherImpact(league: string, weather: any): { homeAdvantage: number; scoring: number } {
    // Default no impact
    const result = { homeAdvantage: 0, scoring: 0 };
    
    if (!weather) return result;
    
    // Simplified implementation - would be more complex in real system
    const temp = weather.temperature || 70;
    const precipitation = weather.precipitation || 0;
    const windSpeed = weather.windSpeed || 0;
    
    // Extreme weather gives home team advantage
    if (temp < 32 || temp > 90 || precipitation > 0.5 || windSpeed > 20) {
      result.homeAdvantage = 0.05;
    }
    
    // Weather impact on scoring
    if (league === 'NFL' || league === 'NCAA Football') {
      if (precipitation > 0.5 || windSpeed > 15) {
        result.scoring = -3.5; // Lower scoring in bad weather
      }
    } else if (league === 'MLB') {
      if (temp > 80 && windSpeed < 10) {
        result.scoring = 0.8; // Higher scoring in hot, still weather
      } else if (windSpeed > 15) {
        result.scoring = -0.5; // Lower scoring in windy conditions
      }
    }
    
    return result;
  }

  /**
   * Calculate impact of rest days
   * @param league League name
   * @param restDays Rest days for each team
   * @returns Rest impact factor (-0.1 to 0.1)
   */
  protected getRestImpact(league: string, restDays: { home: number; away: number }): number {
    const restDiff = restDays.home - restDays.away;
    
    // Different sports have different rest impacts
    const multiplier = league === 'NBA' || league === 'NHL' ? 0.03 : 0.02;
    
    return Math.max(-0.1, Math.min(0.1, restDiff * multiplier));
  }

  /**
   * Calculate impact of game pace on scoring
   * @param game Game data
   * @returns Pace impact on total scoring
   */
  protected calculatePaceImpact(game: any): number {
    // Simplified implementation - would consider team pace stats
    const homePace = game.homeTeam.stats?.pace || 0;
    const awayPace = game.awayTeam.stats?.pace || 0;
    
    const leagueAvgPace = this.getLeagueAveragePace(game.league);
    const gamePace = (homePace + awayPace) / 2;
    
    return (gamePace - leagueAvgPace) * this.getPaceMultiplier(game.league);
  }

  /**
   * Get league average pace
   * @param league League name
   * @returns Average pace value
   */
  private getLeagueAveragePace(league: string): number {
    const paces: Record<string, number> = {
      'NBA': 100,
      'NCAA Basketball': 70,
      'NFL': 65,
      'MLB': 0, // Not applicable
      'NHL': 0, // Not applicable
      'Premier League': 0 // Not applicable
    };
    
    return paces[league] || 0;
  }

  /**
   * Get pace multiplier for scoring impact
   * @param league League name
   * @returns Pace multiplier
   */
  private getPaceMultiplier(league: string): number {
    const multipliers: Record<string, number> = {
      'NBA': 0.2,
      'NCAA Basketball': 0.15,
      'NFL': 0.1,
      'MLB': 0,
      'NHL': 0,
      'Premier League': 0
    };
    
    return multipliers[league] || 0;
  }

  /**
   * Assess data quality for a game
   * @param game Game data
   * @returns Data quality score (0-100)
   */
  protected assessDataQuality(game: any): number {
    // Simplified implementation - would be more complex in real system
    let quality = 70; // Base quality
    
    // Check for key data points
    if (game.homeTeam?.stats && game.awayTeam?.stats) quality += 10;
    if (game.weather && this.isOutdoorSport(game.league)) quality += 5;
    if (game.homeTeam?.injuries && game.awayTeam?.injuries) quality += 5;
    if (game.homeTeam?.recentForm && game.awayTeam?.recentForm) quality += 10;
    
    return Math.min(100, quality);
  }
}
