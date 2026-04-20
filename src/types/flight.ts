export interface FlightResult {
  id: string;
  airline: {
    name: string;
    iataCode: string;
    logoUrl: string | null;
  };
  origin: { city: string; iata: string; time: string; date: string };
  destination: { city: string; iata: string; time: string; date: string };
  legs: FlightLeg[];
  stops: number;
  totalDuration: string;
  cabin: string;
  price: { amount: number; currency: string };
  tripType: 'ONE WAY' | 'RETURN';
}

export interface FlightLeg {
  flightNumber: string;
  airline: { name: string; iataCode: string; logoUrl: string | null };
  departure: { city: string; iata: string; time: string };
  arrival: { city: string; iata: string; time: string };
  duration: string;
  layoverAfter?: string;
}

export interface TicketData {
  platform: { name: string; tagline: string; logoBase64?: string };
  passenger: { name: string; dob: string; ticketNumber: string; ffd: string };
  itinerary: {
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    tripType: 'ONE WAY' | 'RETURN' | 'MULTI-CITY';
    origin: { city: string; iata: string };
    destination: { city: string; iata: string };
    date: string;
    totalDuration: string;
    legs: Array<{
      airline: { name: string; iataCode: string; logoUrl?: string; logoBase64?: string };
      flightNumber: string;
      origin: { city: string; iata: string; time: string };
      destination: { city: string; iata: string; time: string };
      cabin: string;
      layoverAfter?: string;
    }>;
  };
  pricing: {
    baseFare: number;
    taxes: number;
    bookingFee: number;
    currency: string;
    adultCount: number;
  };
}
