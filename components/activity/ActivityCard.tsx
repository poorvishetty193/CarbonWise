'use client';

import React, { ReactElement } from 'react';
import { Activity } from '../../types';
import { Car, Utensils, Bolt, ShoppingBag, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
}

/**
 * Renders an activity log item card displaying category details and footprint weights.
 * @param props Component parameters.
 * @param props.activity Loaded activity item document.
 * @param props.onDelete Callback event firing delete mutations.
 * @returns React element box.
 */
export function ActivityCard({ activity, onDelete }: ActivityCardProps): ReactElement {
  const icons = {
    transport: Car,
    food: Utensils,
    energy: Bolt,
    shopping: ShoppingBag,
  };

  const Icon = icons[activity.category] || ShoppingBag;
  const formattedDate = formatDistanceToNow(new Date(activity.loggedAt), { addSuffix: true });

  const labelMapping: Record<string, string> = {
    gasoline_car: 'Gasoline Car',
    ev_car: 'Electric Vehicle',
    bus: 'Bus Transit',
    rail: 'Rail Transit',
    flight_short: 'Short-haul Flight',
    flight_long: 'Long-haul Flight',
    beef_mutton: 'Beef or Mutton',
    poultry_pork: 'Poultry or Pork',
    dairy_heavy: 'Dairy-heavy Meal',
    vegetarian_meal: 'Vegetarian Meal',
    vegan_meal: 'Vegan Meal',
    grid_electricity: 'Grid Electricity',
    natural_gas: 'Natural Gas',
    solar_renewable: 'Solar/Renewable',
    clothing: 'Apparel/Clothing',
    electronics: 'Consumer Electronics',
    furniture: 'Furniture',
    general: 'General Shopping',
  };

  const displayName = labelMapping[activity.subcategory] || activity.subcategory;

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-surface-border rounded-2xl hover:shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slateBlue-900 font-sans">{displayName}</h4>
          <div className="flex items-center space-x-2 text-xs text-slateBlue-500 font-sans mt-0.5">
            <span>
              {activity.metadata.amount} {activity.metadata.unit || ''}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <span className="text-sm font-bold text-forest-900 font-sans">
            {activity.valueKg.toFixed(1)}
          </span>
          <span className="text-[10px] text-slateBlue-500 font-sans block">kg CO2e</span>
        </div>
        {onDelete && activity.id && (
          <button
            onClick={(): void => onDelete(activity.id!)}
            aria-label="Delete log"
            className="text-slateBlue-400 hover:text-amberAlert-600 focus:outline-none p-1.5 rounded-lg hover:bg-amberAlert-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
