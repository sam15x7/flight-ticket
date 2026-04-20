import { create } from 'zustand';
import { FlightResult, TicketData } from '../types/flight';

interface AppState {
  searchParams: {
    origin: string;
    dest: string;
    departureDate: string;
    returnDate: string;
    isReturn: boolean;
    passengers: number;
    cabinClass: number; // 1=Economy, 2=Premium Economy, 3=Business, 4=First
  };
  setSearchParams: (params: Partial<AppState['searchParams']>) => void;
  
  searchResults: FlightResult[];
  setSearchResults: (results: FlightResult[]) => void;
  
  selectedFlight: FlightResult | null;
  setSelectedFlight: (flight: FlightResult | null) => void;

  ticketData: TicketData | null;
  setTicketData: (data: Partial<TicketData>) => void;
  updateTicketData: (field: keyof TicketData, value: any) => void;
  
  step: number;
  setStep: (step: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  searchParams: {
    origin: 'BKK',
    dest: 'HND',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    isReturn: false,
    passengers: 1,
    cabinClass: 1,
  },
  setSearchParams: (params) => 
    set((state) => ({ searchParams: { ...state.searchParams, ...params } })),
    
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  
  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  
  ticketData: null,
  setTicketData: (data) => 
    set((state) => ({ ticketData: state.ticketData ? { ...state.ticketData, ...data } : data as TicketData })),
  updateTicketData: (field, value) =>
    set((state) => {
      if (!state.ticketData) return state;
      return { ticketData: { ...state.ticketData, [field]: value } };
    }),
    
  step: 1,
  setStep: (step) => set({ step }),
}));
