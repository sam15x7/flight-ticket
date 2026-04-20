import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plane, ArrowRight } from 'lucide-react';
import { FlightResult } from '../types/flight';
import { getAirlineLogoUrl } from '../lib/airlineDomains';

const AirlineLogo = ({ iata, name }: { iata: string, name: string }) => {
  const url = getAirlineLogoUrl(iata);
  const [error, setError] = React.useState(false);
  if (!url || error) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded flex items-center justify-center text-white font-bold text-xs">
        {iata || name.substring(0, 2)}
      </div>
    );
  }
  return <img src={url} alt={name} className="w-8 h-8 object-contain" onError={() => setError(true)} />;
};

export function ResultsGrid() {
  const { searchResults, setSelectedFlight, setStep } = useAppStore();

  const handleSelect = async (flight: FlightResult) => {
    // We already use standard <img> tags for HTML display.
    // For the PDF component we can set the URL so PDF renderer can fetch it.
    const flightWithLogos = { ...flight };
    
    // Attempt mapping
    flightWithLogos.airline.logoUrl = getAirlineLogoUrl(flight.airline.iataCode);
    flightWithLogos.legs.forEach(leg => {
      leg.airline.logoUrl = getAirlineLogoUrl(leg.airline.iataCode);
    });
    
    setSelectedFlight(flightWithLogos);
    setStep(3); // Go to Customise Panel
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Select Departure Flight</h2>
        <p className="text-gray-400 text-sm">{searchResults.length} results found</p>
      </div>

      <div className="space-y-4">
        {searchResults.length === 0 ? (
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-12 text-center">
            <Plane className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">No flights found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search dates or destinations.</p>
            <button onClick={() => setStep(1)} className="px-6 py-2 bg-[#1f2937] hover:bg-[#374151] rounded-lg text-white font-medium transition-colors">
              Go Back
            </button>
          </div>
        ) : (
          searchResults.map((flight, i) => (
            <div 
              key={flight.id} 
              className="bg-[#111827] border border-[#1f2937] hover:border-[#374151] rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl flex flex-col sm:flex-row gap-6 animate-in slide-in-from-bottom-4 fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Airline Info */}
              <div className="flex items-start sm:w-1/4 gap-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
                  <AirlineLogo iata={flight.airline.iataCode} name={flight.airline.name} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{flight.airline.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{flight.legs.map(l => l.flightNumber).join(', ')}</p>
                </div>
              </div>

              {/* Time & Route Info */}
              <div className="flex-1 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xl font-bold text-white mb-1">{flight.origin.time.padStart(5, '0')}</p>
                  <p className="text-sm font-medium text-gray-400">{flight.origin.iata}</p>
                </div>

                <div className="flex-1 px-8 flex flex-col items-center">
                  <p className="text-xs text-gray-400 font-medium mb-2">{flight.totalDuration}</p>
                  <div className="w-full flex items-center">
                    <div className="h-[2px] bg-[#374151] flex-1"></div>
                    <Plane className="w-4 h-4 text-[#374151] mx-2" />
                    <div className="h-[2px] bg-[#374151] flex-1"></div>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mt-2 tracking-wider">
                    {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-white mb-1">{flight.destination.time.padStart(5, '0')}</p>
                  <p className="text-sm font-medium text-gray-400">{flight.destination.iata}</p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="sm:border-l border-[#1f2937] sm:pl-6 flex flex-row sm:flex-col items-center justify-between sm:w-48 shrink-0">
                <div className="text-left sm:text-right w-full mb-0 sm:mb-4">
                  <p className="text-gray-400 text-xs mb-1">{flight.cabin}</p>
                  <p className="text-2xl font-bold text-white">
                    {flight.price.currency === 'USD' ? '$' : ''}{flight.price.amount}
                  </p>
                </div>
                <button 
                  onClick={() => handleSelect(flight)}
                  className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold rounded-lg text-sm w-full transition-colors flex items-center justify-center gap-2 group"
                >
                  Select <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
