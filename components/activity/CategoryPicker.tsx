'use client';

import React, { ReactElement } from 'react';
import { ActivityCategory } from '../../types';
import { Car, Utensils, Bolt, ShoppingBag, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryPickerProps {
  selected: ActivityCategory;
  onChange: (category: ActivityCategory) => void;
}

interface CategoryOption {
  id: ActivityCategory;
  label: string;
  icon: LucideIcon;
}

/**
 * Renders an animated grid selector for the 4 core carbon tracking categories.
 * Enforces accessibility guidelines, high-contrast states, and standard 44px tap targets.
 * @param props Component parameters.
 * @param props.selected Current active selected category.
 * @param props.onChange Callback fired on changing selection.
 * @returns An animated button grid component.
 */
export function CategoryPicker({ selected, onChange }: CategoryPickerProps): ReactElement {
  const categories: CategoryOption[] = [
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'food', label: 'Food & Meals', icon: Utensils },
    { id: 'energy', label: 'Home Energy', icon: Bolt },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="radiogroup" aria-label="Activity Category">
      {categories.map(({ id, label, icon: Icon }) => {
        const isSelected = selected === id;
        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            role="radio"
            aria-checked={isSelected}
            className={`flex flex-col items-center justify-center p-4 min-h-[56px] rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-600 ${
              isSelected
                ? 'bg-forest-600 border-transparent text-white shadow-md'
                : 'bg-white border-surface-border text-slateBlue-700 hover:bg-surface-soft'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-slateBlue-500'}`} aria-hidden="true" />
            <span className="text-xs font-semibold font-sans">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
