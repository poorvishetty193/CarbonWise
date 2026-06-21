'use client';

import React, { ReactElement } from 'react';
import { motion } from 'framer-motion';

interface CarbonPulseProps {
  currentKg: number;
  budgetKg: number;
}

/**
 * Animated SVG circle chart that shifts color dynamically from forest green
 * to amber and red depending on the user's daily budget usage.
 * @param props Component parameters.
 * @param props.currentKg Active tracked emissions today.
 * @param props.budgetKg Target daily carbon budget.
 * @returns React component.
 * @throws {never} This function does not throw.
 */
export function CarbonPulse({ currentKg, budgetKg }: CarbonPulseProps): ReactElement {
  const percentage = budgetKg > 0 ? Math.min((currentKg / budgetKg) * 100, 150) : 0;
  const isOver = currentKg > budgetKg;

  // Color shift threshold definitions
  let strokeColor = '#2A5C47'; // Default calm forest green
  if (percentage >= 70 && percentage < 100) {
    strokeColor = '#D97706'; // Warning amber
  } else if (percentage >= 100) {
    strokeColor = '#DC2626'; // Urgent alert red
  }

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-surface-border">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
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
            className={`origin-center translate-x-4 translate-y-4 ${
              isOver ? 'animate-pulse-slow' : 'transition-colors duration-500'
            }`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-forest-900" aria-live="polite">
            {currentKg.toFixed(1)}
          </span>
          <span className="text-xs text-slateBlue-500 font-sans">of {budgetKg.toFixed(1)} kg budget</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-sans text-slateBlue-800">
          {isOver 
            ? '🚨 You have exceeded your daily carbon allocation.' 
            : percentage >= 70
              ? '⚠️ You are approaching your daily carbon allocation.'
              : '🌱 Footprint is in the green zone. Keep it up.'
          }
        </p>
      </div>
    </div>
  );
}
