'use client';

import React, { ReactElement } from 'react';
import { ActivityCategory } from '../../types';
import { Button } from '../ui/Button';
import { useActivityFormState } from '../../hooks/useActivityFormState';
import { ActivityFormFields } from './ActivityFormFields';
import { ActivityFormPreview } from './ActivityFormPreview';

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

/**
 *  Activity Form function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function ActivityForm({ uid, onSuccess, logActivityAction }: ActivityFormProps): ReactElement {
  const {
    category,
    subcategory,
    previewKg,
    isSubmitting,
    error,
    amount,
    handleCategoryChange,
    handleFieldChange,
    handleSubmit
  } = useActivityFormState();

  return (
    <form onSubmit={(e) => handleSubmit(e, logActivityAction, uid, onSuccess)} className="space-y-6 bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-display font-bold text-forest-900 mb-1">Log Daily Activity</h3>
        <p className="text-xs text-slateBlue-500 font-sans">Input energy, travel, or food behaviors to compute live impact</p>
      </div>

      <ActivityFormFields
        category={category}
        subcategory={subcategory}
        amount={amount}
        error={error}
        handleCategoryChange={handleCategoryChange}
        handleFieldChange={handleFieldChange}
      />

      <ActivityFormPreview liveEmissions={previewKg} />

      <Button type="submit" disabled={isSubmitting || amount <= 0} className="w-full">
        {isSubmitting ? 'Saving Activity...' : 'Log Activity'}
      </Button>
    </form>
  );
}
