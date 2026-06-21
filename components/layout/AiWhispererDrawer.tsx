import React from 'react';
import { X } from 'lucide-react';

interface AiWhispererDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  aiLoading: boolean;
  aiResponse: string;
}

/**
 *  Ai Whisperer Drawer function.
 * @param props - Component properties.
 * @param props.isOpen - Semantic unit for isOpen.
 * @param props.onClose - Semantic unit for onClose.
 * @param props.aiLoading - Semantic unit for aiLoading.
 * @param props.aiResponse - Semantic unit for aiResponse.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function AiWhispererDrawer({ isOpen, onClose, aiLoading, aiResponse }: AiWhispererDrawerProps) {
  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-16 right-0 z-40 w-80 bg-white border-l border-surface-border shadow-2xl flex flex-col animate-slide-up md:animate-none">
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-forest-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🌿</span>
          <div>
            <h2 className="text-sm font-bold text-forest-900 font-display">AI Whisperer</h2>
            <p className="text-[10px] text-slateBlue-500 font-sans">Climate recommendations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI Whisperer"
          className="text-slateBlue-500 hover:text-slateBlue-800 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm leading-relaxed font-sans">
        <div className="bg-forest-50 border border-forest-100 rounded-xl p-3 text-forest-900">
          <p>Hello! I am your climate coach. I review your logs to provide personalized tips.</p>
        </div>
        {aiLoading && (
          <div className="flex items-center space-x-2 text-slateBlue-500">
            <span className="animate-spin text-lg">⏳</span>
            <span>Consulting factors...</span>
          </div>
        )}
        {aiResponse && (
          <div className="bg-white border border-surface-border rounded-xl p-3 text-slateBlue-850 whitespace-pre-line">
            {aiResponse}
          </div>
        )}
      </div>
    </aside>
  );
}
