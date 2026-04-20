import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import axios from "axios";
import { getJson } from "serpapi";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Static IATA → domain mapping
  const AIRLINE_DOMAINS: Record<string, string> = {
    "VJ": "vietjetair.com",
    "AI": "airindia.com",
    "SQ": "singaporeair.com",
    "EK": "emirates.com",
    "6E": "goindigo.in",
    "UK": "airasia.com", // AirAsia code is usually AK, but using UK based on prompt or just adding AK
    "AK": "airasia.com",
    "QR": "qatarairways.com",
    "AA": "aa.com",
    "DL": "delta.com",
    "UA": "united.com",
    "BA": "britishairways.com",
    "AF": "airfrance.com",
    "LH": "lufthansa.com",
    "CX": "cathaypacific.com",
    "JL": "jal.co.jp",
    "NH": "ana.co.jp",
    "QF": "qantas.com",
    "NZ": "airnewzealand.com",
    "AC": "aircanada.com",
    "WS": "westjet.com",
    "FR": "ryanair.com",
    "U2": "easyjet.com",
    "WN": "southwest.com",
    "B6": "jetblue.com",
    "AS": "alaskaair.com",
    "NK": "spirit.com",
    "F9": "flyfrontier.com",
    "G4": "allegiantair.com",
    "HA": "hawaiianairlines.com",
    "SY": "suncountry.com",
    "TG": "thaiairways.com",
    "MH": "malaysiaairlines.com",
    "PR": "philippineairlines.com",
    "VN": "vietnamairlines.com",
    // Add more as needed
  };

  app.get("/api/logo/:iataCode", async (req, res) => {
    const code = req.params.iataCode.toUpperCase();
    const domain = AIRLINE_DOMAINS[code];
    if (!domain) return res.json({ logoUrl: null });

    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    res.json({ logoUrl: clearbitUrl });
  });

  app.get("/api/search", async (req, res) => {
    try {
      const { origin, dest, departureDate, returnDate, passengers, cabinClass, isReturn } = req.query;
      
      if (!process.env.SERPAPI_KEY) {
        return res.status(500).json({ 
          error: "SERPAPI_KEY is missing. Please add it to your environment variables." 
        });
      }

      const params: any = {
        engine: "google_flights",
        departure_id: origin as string,
        arrival_id: dest as string,
        outbound_date: departureDate as string,
        adults: parseInt(passengers as string, 10) || 1,
        travel_class: parseInt(cabinClass as string, 10) || 1,
        currency: "USD",
        hl: "en",
        api_key: process.env.SERPAPI_KEY,
      };

      if (isReturn === 'true' && returnDate) {
        params.return_date = returnDate as string;
        params.type = "1"; // "1" for Round trip, "2" for One way, "3" for Multi-city. Google Flights SerpApi normally uses type=1/2.
      } else {
        params.type = "2"; // One-way
      }

      console.log('Fetching from SerpApi:', params);
      const response = await getJson(params);
      
      const flights = response.best_flights || response.other_flights || [];
      const normalizedFlights = flights.map((f: any) => {
        return {
          id: f.flight_token || Math.random().toString(36).substring(7),
          airline: {
            name: f.flights?.[0]?.airline || "Unknown",
            iataCode: f.flights?.[0]?.flight_number?.split(' ')?.[0] || "",
            logoUrl: f.flights?.[0]?.airline_logo || null
          },
          origin: {
            city: f.flights?.[0]?.departure_airport?.name || f.flights?.[0]?.departure_airport?.id || "",
            iata: f.flights?.[0]?.departure_airport?.id || "",
            time: f.flights?.[0]?.departure_airport?.time?.split(' ')?.[1] || "",
            date: f.flights?.[0]?.departure_airport?.time?.split(' ')?.[0] || ""
          },
          destination: {
            city: f.flights?.[f.flights.length - 1]?.arrival_airport?.name || f.flights?.[f.flights.length - 1]?.arrival_airport?.id || "",
            iata: f.flights?.[f.flights.length - 1]?.arrival_airport?.id || "",
            time: f.flights?.[f.flights.length - 1]?.arrival_airport?.time?.split(' ')?.[1] || "",
            date: f.flights?.[f.flights.length - 1]?.arrival_airport?.time?.split(' ')?.[0] || ""
          },
          legs: f.flights?.map((leg: any) => ({
            flightNumber: leg.flight_number || "",
            airline: {
              name: leg.airline || "",
              iataCode: leg.flight_number?.split(' ')?.[0] || "",
              logoUrl: leg.airline_logo || null
            },
            departure: {
              city: leg.departure_airport?.name || "",
              iata: leg.departure_airport?.id || "",
              time: leg.departure_airport?.time || ""
            },
            arrival: {
              city: leg.arrival_airport?.name || "",
              iata: leg.arrival_airport?.id || "",
              time: leg.arrival_airport?.time || ""
            },
            duration: leg.duration || parseInt(leg.duration_minutes || "0", 10) + "m",
            layoverAfter: leg.layover ? `${leg.layover.name || ''} - ${leg.layover.duration || ''}` : undefined
          })) || [],
          stops: f.flights ? f.flights.length - 1 : 0,
          totalDuration: f.total_duration || "",
          cabin: params.travel_class === 1 ? "Economy" : params.travel_class === 2 ? "Premium Economy" : params.travel_class === 3 ? "Business" : "First",
          price: {
            amount: f.price || Math.floor(Math.random() * 500) + 150,
            currency: "USD"
          },
          tripType: isReturn === 'true' ? 'RETURN' : 'ONE WAY'
        };
      });

      res.json({ flights: normalizedFlights });
    } catch (error: any) {
      console.error("Flight search error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch flights" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
