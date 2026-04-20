import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar, Users, MapPin, ArrowRightLeft, Search } from 'lucide-react';
import axios from 'axios';
import airportsData from '../airports.json';

type Airport = {
  iata: string;
  city: string;
  country: string;
  name: string;
};

const airports = airportsData as Airport[];

function AutocompleteInput({ 
  value, 
  onChange, 
  placeholder, 
  label 
}: { 
  value: string; 
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.length >= 2 
    ? airports.filter(a => 
        a.iata.toLowerCase().includes(query.toLowerCase()) ||
        a.city?.toLowerCase().includes(query.toLowerCase()) ||
        a.name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className="relative group" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center bg-[#1f2937] rounded-xl border border-transparent group-hover:border-[#374151] focus-within:!border-[#3b82f6] transition-colors">
        <MapPin className="absolute left-4 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          required
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-gray-500 p-4 pl-12 outline-none rounded-xl"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#1f2937] border border-[#374151] rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {filtered.map(airport => (
            <div 
              key={airport.iata}
              className="p-3 hover:bg-[#374151] cursor-pointer flex items-center gap-3 transition-colors text-left"
              onClick={() => {
                const val = airport.iata;
                setQuery(val);
                onChange(val);
                setIsOpen(false);
              }}
            >
              <div className="w-10 h-10 bg-[#111827] rounded-lg flex items-center justify-center font-bold text-sm text-[#3b82f6] shrink-0">
                {airport.iata}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold text-white truncate">{airport.city || airport.name}</div>
                <div className="text-xs text-gray-400 truncate">{airport.name} • {airport.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchForm() {
  const { searchParams, setSearchParams, setSearchResults, setStep } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { origin, dest, departureDate, returnDate, passengers, cabinClass, isReturn } = searchParams;
      
      const res = await axios.get('/api/search', {
        params: { origin, dest, departureDate, returnDate, passengers, cabinClass, isReturn }
      });
      
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setSearchResults(res.data.flights || []);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="absolute inset-0 bg-[#3b82f6]/20 blur-3xl rounded-full translate-y-12 shrink-0 z-0" />
      
      <div className="relative z-10 bg-[#111827] border border-[#1f2937] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">Where are you flying?</h1>
        
        <form onSubmit={handleSearch} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin & Dest */}
            <AutocompleteInput
              label="From"
              placeholder="City or Airport Code"
              value={searchParams.origin}
              onChange={val => setSearchParams({ origin: val.toUpperCase() })}
            />

            <AutocompleteInput
              label="To"
              placeholder="City or Airport Code"
              value={searchParams.dest}
              onChange={val => setSearchParams({ dest: val.toUpperCase() })}
            />

            {/* Swap Button (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-[52px] -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 bg-[#374151] rounded-full border-4 border-[#111827] text-white hover:bg-[#4b5563] cursor-pointer transition-colors shadow-lg"
                 onClick={() => setSearchParams({ origin: searchParams.dest, dest: searchParams.origin })}>
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative group">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Trip Type & Dates</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setSearchParams({ isReturn: false })} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${!searchParams.isReturn ? 'bg-[#3b82f6] text-white' : 'bg-[#1f2937] text-gray-400 hover:text-white'}`}>One Way</button>
                <button type="button" onClick={() => setSearchParams({ isReturn: true })} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${searchParams.isReturn ? 'bg-[#3b82f6] text-white' : 'bg-[#1f2937] text-gray-400 hover:text-white'}`}>Return</button>
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1 flex items-center bg-[#1f2937] rounded-xl border border-transparent group-hover:border-[#374151] focus-within:!border-[#3b82f6] transition-colors">
                  <Calendar className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input 
                    type="date" 
                    required
                    className="w-full bg-transparent text-white placeholder-gray-500 p-3 pl-12 outline-none rounded-xl [color-scheme:dark]"
                    value={searchParams.departureDate}
                    onChange={e => setSearchParams({ departureDate: e.target.value })}
                  />
                </div>
                {searchParams.isReturn && (
                  <div className="relative flex-1 flex items-center bg-[#1f2937] rounded-xl border border-transparent hover:border-[#374151] focus-within:!border-[#3b82f6] transition-colors">
                    <Calendar className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input 
                      type="date" 
                      required={searchParams.isReturn}
                      className="w-full bg-transparent text-white placeholder-gray-500 p-3 pl-12 outline-none rounded-xl [color-scheme:dark]"
                      value={searchParams.returnDate}
                      onChange={e => setSearchParams({ returnDate: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Passengers</label>
              <div className="mt-[34px] relative flex items-center bg-[#1f2937] rounded-xl border border-transparent group-hover:border-[#374151] focus-within:!border-[#3b82f6] transition-colors">
                <Users className="absolute left-4 w-5 h-5 text-gray-400" />
                <select 
                  className="w-full bg-transparent text-white appearance-none p-3 pl-12 outline-none rounded-xl cursor-pointer"
                  value={searchParams.passengers}
                  onChange={e => setSearchParams({ passengers: parseInt(e.target.value) })}
                >
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n} className="bg-[#1f2937]">{n} Passenger{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Class</label>
              <div className="mt-[34px] relative flex items-center bg-[#1f2937] rounded-xl border border-transparent group-hover:border-[#374151] focus-within:!border-[#3b82f6] transition-colors">
                <select 
                  className="w-full bg-transparent text-white appearance-none p-3 px-4 outline-none rounded-xl cursor-pointer"
                  value={searchParams.cabinClass}
                  onChange={e => setSearchParams({ cabinClass: parseInt(e.target.value) })}
                >
                  <option value={1} className="bg-[#1f2937]">Economy</option>
                  <option value={2} className="bg-[#1f2937]">Premium Economy</option>
                  <option value={3} className="bg-[#1f2937]">Business</option>
                  <option value={4} className="bg-[#1f2937]">First Class</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-lg p-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Flights
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
