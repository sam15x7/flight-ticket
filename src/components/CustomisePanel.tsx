import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TicketPreview } from './TicketPreview';
import { TicketPDF } from './PDFTicket';
import { pdf } from '@react-pdf/renderer';
import { Download, RefreshCw, ChevronLeft } from 'lucide-react';
import axios from 'axios';

export function CustomisePanel() {
  const { selectedFlight, ticketData, setTicketData, updateTicketData, setStep, searchParams } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!selectedFlight && !ticketData) {
      setStep(1);
      return;
    }

    if (!ticketData && selectedFlight) {
      // Initialize ticket data from selected flight
      const initialData = {
        platform: { name: 'MyTrip', tagline: 'Travel Partner' },
        passenger: {
          name: 'John Doe',
          dob: '01 Jan, 1990',
          ticketNumber: generatePNR(),
          ffd: 'No FFD'
        },
        itinerary: {
          status: 'CONFIRMED' as const,
          tripType: selectedFlight.tripType,
          origin: { city: selectedFlight.origin.city, iata: selectedFlight.origin.iata },
          destination: { city: selectedFlight.destination.city, iata: selectedFlight.destination.iata },
          date: formatDate(searchParams.departureDate),
          totalDuration: selectedFlight.totalDuration,
          legs: selectedFlight.legs.map(leg => ({
            airline: { name: leg.airline.name, iataCode: leg.airline.iataCode, logoUrl: leg.airline.logoUrl },
            flightNumber: leg.flightNumber,
            origin: { city: leg.departure.city, iata: leg.departure.iata, time: leg.departure.time },
            destination: { city: leg.arrival.city, iata: leg.arrival.iata, time: leg.arrival.time },
            cabin: selectedFlight.cabin,
            layoverAfter: leg.layoverAfter
          }))
        },
        pricing: {
          baseFare: selectedFlight.price.amount,
          taxes: 0.00,
          bookingFee: 0.00,
          currency: selectedFlight.price.currency,
          adultCount: searchParams.passengers
        }
      };
      
      // Load logos as base64
      const loadLogos = async () => {
        const data = { ...initialData };
        for (const leg of data.itinerary.legs) {
          if (leg.airline.logoUrl) {
            try {
              // Fetch domain URL via server proxy if possible, or just expect it to work.
              // Clearbit is quite permissive, but to be safe and fast, we just proceed.
              // We'll let PDF try to load the URL directly. If it fails, base64 is better.
              // For dummy ticket generator, direct URL is usually fine in @react-pdf/renderer.
            } catch (e) { }
          }
        }
        setTicketData(data);
      };
      
      loadLogos();
    }
  }, [selectedFlight, ticketData, setTicketData, setStep, searchParams]);

  if (!ticketData) return <div className="p-12 text-center">Loading...</div>;

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfData = { ...ticketData };
      for (const leg of pdfData.itinerary.legs) {
        if (leg.airline.iataCode) {
           const url = `https://logo.clearbit.com/${leg.airline.logoUrl?.split('clearbit.com/')[1] || leg.airline.logoUrl?.replace('https://logo.clearbit.com/', '') || ''}`;
           // Handle cases where getting logo via proxy / direct clearbit fails
           const effectiveUrl = leg.airline.logoUrl || `https://logo.clearbit.com/${leg.airline.iataCode}`;
           if (effectiveUrl) {
             try {
               const b64 = await fetch(effectiveUrl).then(r => r.blob()).then(b => new Promise<string>(res => { 
                 const fr = new FileReader(); 
                 fr.onload = () => res(fr.result as string); 
                 fr.readAsDataURL(b); 
               }));
               leg.airline.logoBase64 = b64;
             } catch (e) {
               console.warn("Failed to convert leg logo to base64", e);
             }
           }
        }
      }

      const blob = await pdf(<TicketPDF data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket_${ticketData.passenger.name.replace(/\s+/g, '').toUpperCase()}_${ticketData.itinerary.origin.iata}${ticketData.itinerary.destination.iata}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PDF Generation error:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4">
      {/* LEFT: Customisation Form */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setStep(2)}
            className="w-10 h-10 rounded-full bg-[#1f2937] hover:bg-[#374151] flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-2xl font-bold text-white">Customise Ticket</h2>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-3xl p-6 shadow-xl sticky top-24 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
          
          {/* Passenger Details */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-[#1f2937] pb-2">Passenger Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input 
                  type="text" 
                  value={ticketData.passenger.name} 
                  onChange={e => updateTicketData('passenger', { ...ticketData.passenger, name: e.target.value })}
                  className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                <input 
                  type="text" 
                  value={ticketData.passenger.dob} 
                  onChange={e => updateTicketData('passenger', { ...ticketData.passenger, dob: e.target.value })}
                  className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Ticket # (PNR)</label>
                  <input 
                    type="text" 
                    value={ticketData.passenger.ticketNumber} 
                    onChange={e => updateTicketData('passenger', { ...ticketData.passenger, ticketNumber: e.target.value })}
                    className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6] font-mono text-sm"
                  />
                </div>
                <button 
                  onClick={() => updateTicketData('passenger', { ...ticketData.passenger, ticketNumber: generatePNR() })}
                  className="mt-5 p-2 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-lg transition-colors group"
                  title="Regenerate PNR"
                >
                  <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing Details */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-[#1f2937] pb-2">Price Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Base Fare</label>
                  <input 
                    type="number" 
                    value={ticketData.pricing.baseFare} 
                    onChange={e => updateTicketData('pricing', { ...ticketData.pricing, baseFare: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <input 
                    type="text" 
                    value={ticketData.pricing.currency} 
                    onChange={e => updateTicketData('pricing', { ...ticketData.pricing, currency: e.target.value })}
                    className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Taxes</label>
                  <input 
                    type="number" 
                    value={ticketData.pricing.taxes} 
                    onChange={e => updateTicketData('pricing', { ...ticketData.pricing, taxes: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Booking Fee</label>
                  <input 
                    type="number" 
                    value={ticketData.pricing.bookingFee} 
                    onChange={e => updateTicketData('pricing', { ...ticketData.pricing, bookingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Branding & Status */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-[#1f2937] pb-2">Platform Branding & Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Booking Status</label>
                <select 
                  value={ticketData.itinerary.status}
                  onChange={e => updateTicketData('itinerary', { ...ticketData.itinerary, status: e.target.value })}
                  className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Platform Name</label>
                <input 
                  type="text" 
                  value={ticketData.platform.name} 
                  onChange={e => updateTicketData('platform', { ...ticketData.platform, name: e.target.value })}
                  className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Platform Tagline</label>
                <input 
                  type="text" 
                  value={ticketData.platform.tagline} 
                  onChange={e => updateTicketData('platform', { ...ticketData.platform, tagline: e.target.value })}
                  className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg px-3 py-2 outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          </section>

          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="w-full bg-[#3fb950] hover:bg-[#3fb950]/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" /> Generate PDF Ticket
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="flex-1">
        <div className="bg-white rounded-lg p-8 shadow-2xl overflow-hidden aspect-[1/1.414] w-full max-w-[800px] mx-auto scale-90 sm:scale-100 origin-top">
          <TicketPreview data={ticketData} />
        </div>
      </div>
    </div>
  );
}

function generatePNR(): string {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  } catch(e) {
    return dateString;
  }
}
