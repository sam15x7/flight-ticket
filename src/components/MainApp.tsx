import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { SearchForm } from './SearchForm';
import { ResultsGrid } from './ResultsGrid';
import { CustomisePanel } from './CustomisePanel';

export function MainApp() {
  const step = useAppStore((state) => state.step);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#e2e8f0] font-sans selection:bg-[#3b82f6] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1f2937] bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => useAppStore.getState().setStep(1)}>
            <div className="flex items-center justify-center">
               <img src="https://cdn.brandfetch.io/idjNS9diAZ/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1772905499480" alt="MyTrip Logo" className="h-8 w-auto mix-blend-screen" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1f2937] text-gray-400 ml-2">Ticket Generator</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-[#3b82f6]/20 text-[#3b82f6] ring-1 ring-[#3b82f6]' : 'bg-[#1f2937]'}`}>1</div>
              <span className="hidden sm:inline">Search</span>
            </div>
            <div className={`w-12 h-px ${step >= 2 ? 'bg-[#3b82f6]' : 'bg-[#1f2937]'}`} />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-[#3b82f6]/20 text-[#3b82f6] ring-1 ring-[#3b82f6]' : 'bg-[#1f2937]'}`}>2</div>
              <span className="hidden sm:inline">Select</span>
            </div>
            <div className={`w-12 h-px ${step >= 3 ? 'bg-[#3b82f6]' : 'bg-[#1f2937]'}`} />
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-[#3b82f6]/20 text-[#3b82f6] ring-1 ring-[#3b82f6]' : 'bg-[#1f2937]'}`}>3</div>
              <span className="hidden sm:inline">Ticket</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === 1 && <SearchForm />}
        {step === 2 && <ResultsGrid />}
        {step === 3 && <CustomisePanel />}
      </main>
    </div>
  );
}
