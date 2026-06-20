'use client';

import React, { ReactElement } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyDataPoint {
  day: string;
  transport: number;
  food: number;
  energy: number;
  shopping: number;
}

interface WeeklyBarProps {
  data: WeeklyDataPoint[];
}

/**
 * Renders a stacked Recharts Bar Chart representing weekly carbon outputs.
 * @param props Component parameters.
 * @param props.data Loaded weekly activity aggregates grouped by category.
 * @returns React element.
 */
export default function WeeklyBar({ data }: WeeklyBarProps): ReactElement {
  /**
   * Custom Tooltip renderer including carbon-to-tree math equivalents.
   */
  const renderTooltip = ({ active, payload, label }: any): ReactElement | null => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0);
      const treeEquivalent = total / 22; // 1 tree absorbs ~22kg CO2 yearly
      return (
        <div className="bg-forest-900 text-white p-3 rounded-xl border border-forest-800 shadow-lg text-xs space-y-1 font-sans">
          <p className="font-bold border-b border-forest-800 pb-1">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="flex justify-between space-x-4">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-semibold">{Number(entry.value).toFixed(1)} kg</span>
            </p>
          ))}
          <p className="border-t border-forest-800 pt-1 font-semibold flex justify-between">
            <span>Total:</span>
            <span>{total.toFixed(1)} kg</span>
          </p>
          <p className="text-[10px] text-amberAlert-500 font-medium">
            🌳 Equivalent to {treeEquivalent.toFixed(2)} tree-years
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-forest-900">Weekly Breakdown</h3>
        <p className="text-xs text-slateBlue-500 font-sans">Stacked daily footprint by category</p>
      </div>

      <div className="h-64 w-full font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFF2" />
            <XAxis dataKey="day" tick={{ fill: '#4B6B88', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4B6B88', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={renderTooltip} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Bar dataKey="transport" stackId="a" fill="#4B6B88" name="Transport" radius={[0, 0, 0, 0]} />
            <Bar dataKey="food" stackId="a" fill="#2A5C47" name="Food" radius={[0, 0, 0, 0]} />
            <Bar dataKey="energy" stackId="a" fill="#F59E0B" name="Energy" radius={[0, 0, 0, 0]} />
            <Bar dataKey="shopping" stackId="a" fill="#D4AF37" name="Shopping" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
