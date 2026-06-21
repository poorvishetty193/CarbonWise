import React from 'react';

/**
 *  Activity Form Preview function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function ActivityFormPreview({ liveEmissions }: { liveEmissions: number }) {
  if (liveEmissions <= 0) return null;

  return (
    <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 flex items-center justify-between">
      <div className="text-xs text-forest-800 font-sans">
        <span className="font-semibold block">Footprint estimation:</span>
        Calculated using IPCC AR6 variables.
      </div>
      <div className="text-right">
        <span className="text-lg font-display font-bold text-forest-900">{liveEmissions.toFixed(2)}</span>
        <span className="text-xs text-forest-600 block font-sans">kg CO2e</span>
      </div>
    </div>
  );
}
