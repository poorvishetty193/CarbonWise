import React from 'react';
import { Card } from '../ui/Card';

interface DashboardStatsProps {
  totalKgSaved: number;
  isDailyOver: boolean;
  dailyRemaining: number;
  weeklyTotal: number;
  weeklyBudget: number;
}

/**
 *  Dashboard Stats function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function DashboardStats({
  totalKgSaved,
  isDailyOver,
  dailyRemaining,
  weeklyTotal,
  weeklyBudget
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="flex flex-col gap-2">
        <span className="section-pill">Total Saved</span>
        <div className="flex items-baseline gap-1">
          <span className="stat-value">{totalKgSaved.toFixed(1)}</span>
          <span className="stat-unit">kg CO2e</span>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <span className="section-pill">Daily Budget Left</span>
        <div className="flex items-baseline gap-1">
          <span className={`stat-value ${isDailyOver ? 'text-amberAlert-600' : 'text-forest-900'}`}>
            {dailyRemaining.toFixed(1)}
          </span>
          <span className="stat-unit">kg CO2e</span>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <span className="section-pill">Weekly Footprint</span>
        <div className="flex items-baseline gap-1">
          <span className="stat-value">{weeklyTotal.toFixed(1)}</span>
          <span className="stat-unit">of {weeklyBudget} kg</span>
        </div>
        <div className="budget-bar mt-1">
          <div
            className="budget-bar-fill bg-forest-500"
            style={{ width: `${Math.min(100, (weeklyTotal / weeklyBudget) * 100)}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
