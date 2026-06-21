import React, { ChangeEvent } from 'react';
import { ActivityCategory } from '../../types';
import { CategoryPicker } from './CategoryPicker';
import { Input } from '../ui/Input';

interface ActivityFormFieldsProps {
  category: ActivityCategory;
  subcategory: string;
  amount: number;
  error: string;
  handleCategoryChange: (cat: ActivityCategory) => void;
  handleFieldChange: (val: number, subcat: string) => void;
}

/**
 *  Activity Form Fields function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function ActivityFormFields({ category, subcategory, amount, error, handleCategoryChange, handleFieldChange }: ActivityFormFieldsProps) {
  const subcategoryOptions: Record<ActivityCategory, { id: string; label: string; unit: string; }[]> = {
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

  const activeOptions = subcategoryOptions[category];
  const activeSub = activeOptions.find((o) => o.id === subcategory) || activeOptions[0];

  return (
    <>
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
            onChange={(e: ChangeEvent<HTMLSelectElement>): void => handleFieldChange(amount, e.target.value)}
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
            handleFieldChange(isNaN(val) ? 0 : val, subcategory);
          }}
          placeholder="0.00"
          error={error}
        />
      </div>
    </>
  );
}
