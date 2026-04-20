import React from 'react';
import { TicketData } from '../types/flight';
import { getAirlineLogoUrl } from '../lib/airlineDomains';

// This is the HTML representation of the ticket, styled to look close to the PDF equivalent
export const TicketPreview: React.FC<{ data: TicketData }> = ({ data }) => {
  return (
    <div className="w-full h-full text-gray-900 font-sans bg-white relative">
      {/* ── HEADER ── */}
      <div className="flex items-center mb-8 gap-3">
        {data.platform.logoBase64 ? (
          <img src={data.platform.logoBase64} alt="Platform Logo" className="w-12 h-12 object-contain" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" className="h-10 w-auto">
            <text x="10" y="85" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="90" fill="#FF4B55" letterSpacing="-4">mytr</text>
            {/* Exclamation point tilted as the i */}
            <g transform="translate(195, 85) rotate(-15)">
              <rect x="0" y="-65" width="18" height="42" rx="4" fill="#FF4B55" />
              <circle cx="9" cy="-10" r="10" fill="#FF4B55" />
            </g>
            <text x="220" y="85" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="90" fill="#FF4B55" letterSpacing="-4">p</text>
          </svg>
        )}
        <div>
          <h1 className="text-xl font-black tracking-tight m-0 uppercase">{data.platform.name}</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{data.platform.tagline}</p>
        </div>
      </div>

      {/* ── TITLE BAR ── */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Itinerary / Booking Confirmation</p>
        <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">#{data.passenger.ticketNumber}</h2>
        <p className="text-xs text-gray-700 mt-2 font-bold uppercase">
          {data.itinerary.date} <span className="text-gray-300 mx-2">|</span> {data.itinerary.destination.city}
        </p>
      </div>

      {/* ── PASSENGER TABLE ── */}
      <div className="border border-gray-200 shadow-sm rounded-xl p-5 mb-6 bg-white overflow-hidden">
        <h3 className="text-sm font-black mb-3 uppercase tracking-wider text-gray-800">Passenger Information</h3>
        <div className="grid grid-cols-4 border-b border-gray-100 pb-2 mb-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div>Name</div>
          <div>Birthdate</div>
          <div>Ticketnumber</div>
          <div>FFD</div>
        </div>
        <div className="grid grid-cols-4 text-xs font-bold text-gray-900">
          <div>{data.passenger.name}</div>
          <div>{data.passenger.dob}</div>
          <div className="font-mono"># {data.passenger.ticketNumber}</div>
          <div>{data.passenger.ffd}</div>
        </div>
        <p className="text-[9px] text-gray-400 mt-5 leading-relaxed">
          Seat assignments, special meals, frequent flyer point awards and special assistance requests should be confirmed directly with the airline.
        </p>
      </div>

      {/* ── FLIGHT BLOCK ── */}
      <div className="flex gap-6">
        
        {/* Left: Itinerary Panel */}
        <div className="flex-[3] border border-gray-200 shadow-sm rounded-xl p-5 bg-white">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm font-black uppercase tracking-tight">
              {data.itinerary.origin.city} ({data.itinerary.origin.iata}) → {data.itinerary.destination.city} ({data.itinerary.destination.iata})
            </div>
            <div className="px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[9px] font-black uppercase tracking-widest">
              {data.itinerary.status}
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mb-5 uppercase font-bold tracking-wide">
            {data.itinerary.date}, {data.itinerary.tripType} ticket
          </p>

          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 mb-6">
            <p className="text-[10px] font-black mb-2 text-gray-800">
              Your reservation is booked and confirmed. There is no need to call us to reconfirm this reservation
            </p>
            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
              <span>{data.itinerary.date} - Departure {data.itinerary.legs.length > 1 ? `${data.itinerary.legs.length - 1} stop` : 'Direct'}</span>
              <span>Total travel time: {data.itinerary.totalDuration}</span>
            </div>
          </div>

          {data.itinerary.legs.map((leg, i) => (
              <div key={i} className="mb-5 text-sm relative border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <img
                      src={leg.airline.logoUrl || getAirlineLogoUrl(leg.airline.iataCode)}
                      alt={leg.airline.name}
                      width={48}
                      height={48}
                      style={{ objectFit: "contain", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "4px", background: "#fff" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  <div className="flex-1 flex justify-between">
                    <div>
                      <div className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-1">{leg.origin.city}</div>
                      <div className="text-lg font-black">{leg.origin.time || 'TBD'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-1">{leg.destination.city}</div>
                      <div className="text-lg font-black">{leg.destination.time || 'TBD'}</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 pl-[68px]">
                  <div className="font-bold text-gray-900 mb-0.5">{leg.flightNumber}</div>
                  <div>{leg.cabin} | Confirm seats with the airline*</div>
                </div>
                
                {leg.layoverAfter && (
                  <div className="mt-4 py-2 border-y border-dashed border-gray-200 text-center text-[9px] uppercase tracking-widest text-gray-500 font-bold bg-white relative z-10 mx-[68px]">
                    Layover: {leg.layoverAfter}
                  </div>
                )}
              </div>
          ))}

          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-[10px] font-black mb-3 uppercase tracking-wider">Airline Rules & Regulations</p>
            <ul className="text-[9px] text-gray-500 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
              <li>This price includes a non-refundable booking fee.</li>
              <li>Please read the complete penalty rules for changes and cancellations.</li>
              <li>Please read important information regarding airline liability limitations.</li>
            </ul>
          </div>
        </div>

        {/* Right: Price Panel */}
        <div className="flex-[2] flex flex-col gap-6">
          <div className="border border-gray-200 shadow-sm rounded-xl p-5 bg-white">
            <h3 className="text-sm font-black mb-5 uppercase tracking-wider text-gray-800">Price summary</h3>
            
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span>Traveller {data.pricing.adultCount}: Adult</span>
                <span className="font-bold">{data.pricing.currency} {data.pricing.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-[11px]">Flight</span>
                <span className="text-gray-900 font-bold text-[11px]">{data.pricing.currency} {data.pricing.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-[11px]">Taxes & Fees</span>
                <span className="text-gray-900 font-bold text-[11px]">{data.pricing.currency} {data.pricing.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-[11px]">Booking Fee</span>
                <span className="text-gray-900 font-bold text-[11px]">{data.pricing.currency} {data.pricing.bookingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black pt-2 text-sm text-gray-900">
                <span>Total:</span>
                <span>{data.pricing.currency} {(data.pricing.baseFare + data.pricing.taxes + data.pricing.bookingFee).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 shadow-sm rounded-xl p-5 bg-white">
            <h3 className="text-xs font-black mb-3 uppercase tracking-wider text-gray-800">Additional Flight Services</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
              • The airline may charge additional fees for checked baggage or other optional services.
            </p>
          </div>
        </div>

      </div>

      <div className="absolute bottom-6 left-6 right-6 text-center text-[8px] text-gray-400 mt-8 border-t border-gray-200 pt-3 uppercase tracking-widest font-bold">
        This is a demonstration ticket generated for design/mock purposes only and is not a valid travel document.
      </div>
    </div>
  );
};
