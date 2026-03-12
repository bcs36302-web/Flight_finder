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

    if (flights.length === 0) {
      return res.json({ average_price: 0, all_flights: [], flights_below_average: [] });
    }

    // Calculate average
    const totalPrice = flights.reduce((sum, f) => sum + f.price, 0);
    const average_price = Math.round(totalPrice / flights.length);

    // Return ALL flights sorted cheapest first, with percent vs average annotated
    const all_flights = [...flights]
      .sort((a, b) => a.price - b.price)
      .map(f => ({
        ...f,
        percent_vs_avg: Number(((f.price - average_price) / average_price * 100).toFixed(1))
      }));

    const flights_below_average = all_flights.filter(f => f.percent_vs_avg < 0);

    console.log(`Returning ${all_flights.length} flights, avg ₹${average_price}, ${flights_below_average.length} below avg`);

    res.json({ average_price, all_flights, flights_below_average });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

export default router;
