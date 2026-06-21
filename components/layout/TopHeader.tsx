import React from 'react';
import { MessageCircle } from 'lucide-react';

interface TopHeaderProps {
  onToggleWhisperer: () => void;
}

/**
 *  Top Header function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function TopHeader({ onToggleWhisperer }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-forest-900 text-white px-4 h-16 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-display font-bold tracking-tight text-white">CarbonWise</span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-700 text-forest-200">AR6 Sync</span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleWhisperer}
          aria-label="Toggle AI Whisperer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-forest-800 hover:bg-forest-700 text-white focus:outline-none focus:ring-2 focus:ring-amberAlert-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
