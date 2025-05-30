/**
 * API routes for predictions
 */
import express, { Request, Response } from 'express';
import predictionService from '../services/predictionService';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/predictions/:sport
 * Get betting opportunities for a specific sport
 */
router.get('/:sport', async (req: Request, res: Response) => {
  try {
    const { sport } = req.params;
    const { date, bankroll } = req.query;
    
    const opportunities = await predictionService.getBettingOpportunities(
      sport,
      date as string | undefined,
      bankroll ? parseInt(bankroll as string) : 1000
    );
    
    res.json({ success: true, data: opportunities });
  } catch (error) {
    logger.error(`Error in GET /api/predictions/${req.params.sport}: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to get predictions' });
  }
});

/**
 * GET /api/predictions
 * Get all betting opportunities across multiple sports
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sports, date, bankroll } = req.query;
    
    // Parse sports parameter
    const sportsArray = sports ? (sports as string).split(',') : [
      'soccer', 'basketball', 'baseball', 'hockey', 'american_football',
      'college_football', 'college_basketball'
    ];
    
    const opportunities = await predictionService.getAllBettingOpportunities(
      sportsArray,
      date as string | undefined,
      bankroll ? parseInt(bankroll as string) : 1000
    );
    
    res.json({ success: true, data: opportunities });
  } catch (error) {
    logger.error(`Error in GET /api/predictions: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to get predictions' });
  }
});

/**
 * GET /api/predictions/:sport/player-props
 * Get player prop betting opportunities for a specific sport
 */
router.get('/:sport/player-props', async (req: Request, res: Response) => {
  try {
    const { sport } = req.params;
    const { date, bankroll } = req.query;
    
    const opportunities = await predictionService.getPlayerPropOpportunities(
      sport,
      date as string | undefined,
      bankroll ? parseInt(bankroll as string) : 1000
    );
    
    res.json({ success: true, data: opportunities });
  } catch (error) {
    logger.error(`Error in GET /api/predictions/${req.params.sport}/player-props: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to get player prop predictions' });
  }
});

export default router;
