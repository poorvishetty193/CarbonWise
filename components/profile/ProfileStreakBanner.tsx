import React from 'react';

interface ProfileStreakBannerProps {
  streakDays: number;
  totalKgSaved: number;
}

/**
 *  Profile Streak Banner function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function ProfileStreakBanner({ streakDays, totalKgSaved }: ProfileStreakBannerProps) {
  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-forest-900 to-forest-700 text-white rounded-2xl p-5">
      <span className="text-4xl" role="img" aria-label="fire">🔥</span>
      <div>
        <p className="text-xs uppercase tracking-wider font-semibold text-forest-300">Current Streak</p>
        <p className="text-4xl font-display font-bold">{streakDays} <span className="text-xl font-normal text-forest-200">days</span></p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-xs text-forest-300">Total Saved</p>
        <p className="text-2xl font-display font-bold">{totalKgSaved.toFixed(1)} <span className="text-sm font-normal text-forest-200">kg CO2e</span></p>
      </div>
    </div>
  );
}
