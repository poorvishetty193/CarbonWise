'use client';

import React, { useState, ReactElement, ChangeEvent, FormEvent } from 'react';
import { ActivityCategory } from '../../types';
import dynamic from 'next/dynamic';

const CategoryPicker = dynamic(
  () => import('./CategoryPicker').then((mod) => mod.CategoryPicker),
  { ssr: false }
);

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { calculateEmissions } from '../../lib/carbon-calculator';

interface ActivityFormProps {
  uid: string;
  onSuccess?: (emissions: number) => void;
  logActivityAction: (data: {
    uid: string;
    category: ActivityCategory;
    subcategory: string;
    amount: number;
  }) => Promise<{ success: boolean; emissions: number }>;
}

interface SubcategoryOption {
  id: string;
  label: string;
  unit: string;
}

/**
 * Activity Logging Form component.
 * Allows entering distances/amounts per category with live computed previews.
 * @param props Component parameters.
 * @param props.uid User identification.
 * @param props.onSuccess Success callback after log.
 * @param props.logActivityAction Server action to invoke.
 * @returns React form container.
 */
export function ActivityForm({ uid, onSuccess, logActivityAction }: ActivityFormProps): ReactElement {
  const [category, setCategory] = useState<ActivityCategory>('transport');
  const [subcategory, setSubcategory] = useState<string>('gasoline_car');
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const subcategoryOptions: Record<ActivityCategory, SubcategoryOption[]> = {
    transport: [
      { id: 'gasoline_car', label: 'Gasoline Car', unit: 'km' },
      { id: 'ev_car', label: 'Electric Vehicle', unit: 'km' },
      { id: 'bus', label: 'Bus', unit: 'km' },
      { id: 'rail', label: 'Rail/Train', unit: 'km' },
      { id: 'flight_short', label: 'Short Flight (<1500km)', unit: 'km' },
      { id: 'flight_long', label: 'Long Flight (>1500km)', unit: 'km' },
    ],
    food: [
      { id: 'beef_mutton', label: 'Beef or Mutton', unit: 'kg' },
      { id: 'poultry_pork', label: 'Poultry or Pork', unit: 'kg' },
      { id: 'dairy_heavy', label: 'Cheese & Dairy', unit: 'kg' },
      { id: 'vegetarian_meal', label: 'Vegetarian Meal', unit: 'servings' },
      { id: 'vegan_meal', label: 'Vegan Meal', unit: 'servings' },
    ],
    energy: [
      { id: 'grid_electricity', label: 'Grid Electricity', unit: 'kWh' },
      { id: 'natural_gas', label: 'Natural Gas', unit: 'kWh' },
      { id: 'solar_renewable', label: 'Solar/Renewables', unit: 'kWh' },
    ],
    shopping: [
      { id: 'clothing', label: 'Apparel/Clothing Item', unit: 'qty' },
      { id: 'electronics', label: 'Electronics (Phone/PC)', unit: 'qty' },
      { id: 'furniture', label: 'Furniture Item', unit: 'qty' },
      { id: 'general', label: 'General Goods (spent)', unit: '$' },
    ]
  };

  /**
   * Sets the category and resets default subcategory variables.
   * @param cat The selected ActivityCategory.
   * @returns void
   */
  const handleCategoryChange = (cat: ActivityCategory): void => {
    setCategory(cat);
    const defaults: Record<ActivityCategory, string> = {
      transport: 'gasoline_car',
      food: 'beef_mutton',
      energy: 'grid_electricity',
      shopping: 'clothing',
    };
    setSubcategory(defaults[cat]);
  };

  const activeOptions = subcategoryOptions[category];
  const activeSub = activeOptions.find((o) => o.id === subcategory) || activeOptions[0];

  let liveEmissions = 0;
  try {
    if (amount > 0) {
      liveEmissions = calculateEmissions(category, subcategory, amount);
    }
  } catch (e: unknown) {
    // Graceful silent fallback during calculations
  }

  /**
   * Triggers form logging submission.
   * @param e FormEvent.
   * @returns Promise resolving on completion.
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please provide a value greater than zero.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const result = await logActivityAction({
        uid,
        category,
        subcategory,
        amount,
      });
      if (result.success) {
        setAmount(0);
        if (onSuccess) {
          onSuccess(result.emissions);
        }
      } else {
        setError('Could not save activity.');
      }
    } catch (err: unknown) {
      console.error('Error logging activity in Form:', err);
      setError('An unexpected database error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-display font-bold text-forest-900 mb-1">Log Daily Activity</h3>
        <p className="text-xs text-slateBlue-500 font-sans">Input energy, travel, or food behaviors to compute live impact</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slateBlue-800 font-sans uppercase tracking-wider">
          Choose Category
        </label>
        <CategoryPicker selected={category} onChange={handleCategoryChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="subcategory-select" className="block text-xs font-semibold text-slateBlue-800 font-sans uppercase tracking-wider">
            Subcategory
          </label>
          <select
            id="subcategory-select"
            value={subcategory}
            onChange={(e: ChangeEvent<HTMLSelectElement>): void => setSubcategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-soft border border-surface-border rounded-xl text-slateBlue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all duration-200"
          >
            {activeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={`Amount (${activeSub.unit})`}
          type="number"
          step="any"
          value={amount === 0 ? '' : amount}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => {
            const val = parseFloat(e.target.value);
            setAmount(isNaN(val) ? 0 : val);
          }}
          placeholder="0.00"
          error={error}
        />
      </div>

      {liveEmissions > 0 && (
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
      )}

      <Button type="submit" disabled={isSubmitting || amount <= 0} className="w-full">
        {isSubmitting ? 'Saving Activity...' : 'Log Activity'}
      </Button>
    </form>
  );
}
