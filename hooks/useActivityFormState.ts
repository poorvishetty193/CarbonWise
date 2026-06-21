import { useState, ChangeEvent, FormEvent } from 'react';
import { ActivityCategory } from '../types';
import { calculateEmissions } from '../lib/carbon-calculator';

interface UseActivityFormStateReturn {
  category: ActivityCategory;
  subcategory: string;
  previewKg: number;
  isSubmitting: boolean;
  error: string;
  handleCategoryChange: (cat: ActivityCategory) => void;
  handleFieldChange: (val: number, subcat: string) => void;
  handleSubmit: (e: FormEvent, logAction: (data: { uid: string; category: ActivityCategory; subcategory: string; amount: number }) => Promise<{ success: boolean; emissions: number }>, uid: string, onSuccess?: (emissions: number) => void) => Promise<void>;
  reset: () => void;
  amount: number;
}

/**
 * Manages the state and lifecycle of the activity logging form.
 * 
 * @returns {UseActivityFormStateReturn} State and handlers for the activity form
 * @throws {never} This function does not throw.
 */
export function useActivityFormState(): UseActivityFormStateReturn {
  const [category, setCategory] = useState<ActivityCategory>('transport');
  const [subcategory, setSubcategory] = useState<string>('gasoline_car');
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  const handleFieldChange = (val: number, subcat: string): void => {
    setAmount(val);
    setSubcategory(subcat);
  };

  let previewKg = 0;
  try {
    if (amount > 0) {
      previewKg = calculateEmissions(category, subcategory, amount);
    }
  } catch (e: unknown) {
    // Silent fallback
  }

  const reset = () => {
    setAmount(0);
    setError('');
  };

  const handleSubmit = async (
    e: FormEvent,
    logAction: (data: { uid: string; category: ActivityCategory; subcategory: string; amount: number }) => Promise<{ success: boolean; emissions: number }>,
    uid: string,
    onSuccess?: (emissions: number) => void
  ): Promise<void> => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please provide a value greater than zero.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const result = await logAction({ uid, category, subcategory, amount });
      if (result.success) {
        reset();
        if (onSuccess) {
          onSuccess(result.emissions);
        }
      } else {
        setError('Could not save activity.');
      }
    } catch (err: unknown) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    category,
    subcategory,
    previewKg,
    isSubmitting,
    error,
    amount,
    handleCategoryChange,
    handleFieldChange,
    handleSubmit,
    reset
  };
}
