import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { origin, destination, date, returnDate, passengers, cabin } = req.query;
  
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_flights',
        departure_id: origin,
        arrival_id: destination,
        outbound_date: date,
        return_date: returnDate || '',
        adults: passengers,
        travel_class: cabin,
        currency: 'USD',
        api_key: process.env.SERPAPI_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
}
