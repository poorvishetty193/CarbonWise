'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EmissionsRingProps {
  currentKg: number;
  budgetKg: number;
}

export default function EmissionsRing({ currentKg, budgetKg }: EmissionsRingProps) {
  const percentage = Math.min((currentKg / budgetKg) * 100, 100);
  const isOver = currentKg > budgetKg;
  
  // Custom HSL/hex dynamic coloring for warning state
  const strokeColor = isOver ? '#D97706' : '#2A5C47'; 

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-surface-border">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            stroke="#EBEFF2"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="origin-center translate-x-4 translate-y-4"
          />
          <motion.circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`origin-center translate-x-4 translate-y-4 ${isOver ? 'animate-pulse-slow' : 'transition-colors duration-500'}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-forest-900" aria-live="polite">
            {currentKg.toFixed(1)}
          </span>
          <span className="text-xs text-slateBlue-500 font-sans">of {budgetKg} kg budget</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-sans text-slateBlue-800">
          {isOver 
            ? '🚨 You have exceeded your daily carbon allocation.' 
            : '🌱 Breathes green. Keep staying underneath your limit.'
          }
        </p>
      </div>
    </div>
  );
}
