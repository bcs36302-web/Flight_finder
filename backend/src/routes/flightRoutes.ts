import { Router, Request, Response } from 'express';
import { flightService } from '../services/flightService';

const router = Router();

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { from, to, quarter, year } = req.body;
    
    if (!from || !to || !quarter || !year) {
      return res.status(400).json({ error: 'Missing required search parameters' });
    }

    const flights = await flightService.fetchFlights(from, to, quarter, year);
    const analysis = flightService.calculatePriceIntelligence(flights);

    res.json(analysis);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

export default router;
