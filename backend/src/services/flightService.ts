import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface FlightData {
  airline: string;
  price: number;
  departure: string;
  arrival: string;
  duration: string;
  flight_number: string;
}

export interface AnalysisOutput {
  average_price: number;
  flights_below_average: {
    airline: string;
    price: number;
    percent_below: number;
  }[];
}

export class FlightService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const { AMADEUS_API_KEY, AMADEUS_API_SECRET, AMADEUS_BASE_URL } = process.env;

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      throw new Error('Amadeus API credentials missing in .env');
    }

    try {
      const response = await axios.post(
        `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: AMADEUS_API_KEY,
          client_secret: AMADEUS_API_SECRET,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = now + response.data.expires_in * 1000 - 60000; // Expire 1 min early
      return this.accessToken!;
    } catch (error: any) {
      console.error('Error fetching Amadeus access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  private async fetchAmadeusFlights(from: string, to: string, quarter: string, year: number): Promise<FlightData[]> {
    const { AMADEUS_BASE_URL } = process.env;
    try {
      const token = await this.getAccessToken();
      const quarterStartDates: Record<string, string> = {
        'Q1': `${year}-01-15`,
        'Q2': `${year}-04-15`,
        'Q3': `${year}-07-15`,
        'Q4': `${year}-10-15`,
      };

      const departureDate = quarterStartDates[quarter] || `${year}-04-15`;

      const response = await axios.get(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`, {
        params: {
          originLocationCode: from,
          destinationLocationCode: to,
          departureDate,
          adults: 1,
          max: 10,
          currencyCode: 'INR',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const offers = response.data.data;
      if (!offers) return [];

      return offers.map((offer: any) => {
        const itinerary = offer.itineraries?.[0];
        const segment = itinerary?.segments?.[0];
        return {
          airline: offer.validatingCarrierCodes?.[0] || 'Unknown',
          price: parseFloat(offer.price.total),
          departure: segment?.departure?.at || 'N/A',
          arrival: segment?.arrival?.at || 'N/A',
          duration: itinerary?.duration?.replace('PT', '').toLowerCase() || 'N/A',
          flight_number: `${offer.validatingCarrierCodes?.[0] || ''}${segment?.number || ''}`,
        };
      });
    } catch (error: any) {
      console.error('Error in fetchAmadeusFlights:', error.response?.data || error.message);
      return [];
    }
  }

  async fetchKiwiFlights(from: string, to: string, quarter: string, year: number): Promise<FlightData[]> {
    const { KIWI_API_KEY, KIWI_BASE_URL } = process.env;
    if (!KIWI_API_KEY || KIWI_API_KEY === 'your_kiwi_api_key_here') {
      console.warn('Kiwi API key missing or default, skipping Kiwi search.');
      return [];
    }

    try {
      const quarterStartDates: Record<string, string> = {
        'Q1': `15/01/${year}`,
        'Q2': `15/04/${year}`,
        'Q3': `15/07/${year}`,
        'Q4': `15/10/${year}`,
      };
      const dateFrom = quarterStartDates[quarter] || `15/04/${year}`;

      const response = await axios.get(`${KIWI_BASE_URL}/v2/search`, {
        params: {
          fly_from: from,
          fly_to: to,
          date_from: dateFrom,
          date_to: dateFrom,
          curr: 'INR',
          limit: 10,
        },
        headers: {
          apikey: KIWI_API_KEY,
        },
      });

      const data = response.data.data;
      if (!data) return [];

      return data.map((flight: any) => ({
        airline: flight.airlines?.[0] || 'Unknown',
        price: flight.price,
        departure: flight.local_departure,
        arrival: flight.local_arrival,
        duration: flight.duration?.total || 'N/A',
        flight_number: `${flight.airlines?.[0] || ''}${flight.route?.[0]?.flight_no || ''}`,
      }));
    } catch (error: any) {
      console.error('Error in fetchKiwiFlights:', error.response?.data || error.message);
      return [];
    }
  }

  async fetchFlights(from: string, to: string, quarter: string, year: number): Promise<FlightData[]> {
    try {
      console.log(`Starting multi-provider search for ${from} -> ${to}...`);
      
      const [amadeusFlights, kiwiFlights] = await Promise.all([
        this.fetchAmadeusFlights(from, to, quarter, year),
        this.fetchKiwiFlights(from, to, quarter, year)
      ]);

      const allFlights = [...amadeusFlights, ...kiwiFlights];

      if (allFlights.length === 0) {
        return this.getMockFlights(from, to, quarter, year);
      }

      console.log(`Search complete. Total flights found: ${allFlights.length}`);
      return allFlights;
    } catch (error: any) {
      console.error('Error in search:', error.message);
      return this.getMockFlights(from, to, quarter, year);
    }
  }

  private getMockFlights(from: string, to: string, quarter: string, year: number): FlightData[] {
    console.log(`Using mock data for ${from} to ${to} in ${quarter} ${year}`);
    return [
      {
        airline: "Emirates",
        price: 45000,
        departure: `${year}-04-12T10:00:00`,
        arrival: `${year}-04-12T19:10:00`,
        duration: "9h 10m",
        flight_number: "EK511"
      },
      {
        airline: "British Airways",
        price: 48000,
        departure: `${year}-04-13T08:00:00`,
        arrival: `${year}-04-13T17:30:00`,
        duration: "9h 30m",
        flight_number: "BA256"
      },
      {
        airline: "Lufthansa",
        price: 60000,
        departure: `${year}-04-14T11:00:00`,
        arrival: `${year}-04-14T21:15:00`,
        duration: "10h 15m",
        flight_number: "LH761"
      },
      {
        airline: "Virgin Atlantic",
        price: 42000,
        departure: `${year}-04-15T09:00:00`,
        arrival: `${year}-04-15T18:45:00`,
        duration: "9h 45m",
        flight_number: "VS301"
      }
    ];
  }

  calculatePriceIntelligence(flights: FlightData[]): AnalysisOutput {
    if (flights.length === 0) {
      return { average_price: 0, flights_below_average: [] };
    }

    const totalPrice = flights.reduce((sum, f) => sum + f.price, 0);
    const average_price = totalPrice / flights.length;

    const flights_below_average = flights
      .filter(f => f.price < average_price)
      .map(f => ({
        airline: f.airline,
        price: f.price,
        percent_below: Number(((average_price - f.price) / average_price * 100).toFixed(1))
      }))
      .sort((a, b) => a.price - b.price);

    return {
      average_price: Math.round(average_price),
      flights_below_average
    };
  }
}

export const flightService = new FlightService();
