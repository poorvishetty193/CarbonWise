import { EMISSION_FACTORS } from './constants';
import { ActivityCategory } from '../types';

/**
 * Pure calculation function that determines carbon output in kilograms of CO2e.
 * @param category Target activity category group.
 * @param subcategory Specific subcategory item keys matching factors registry.
 * @param amount Numeric inputs mapping to units.
 * @returns Calculated weight in kilograms of CO2e.
 * @throws Error if target factors or subcategory labels are not found.
 */
export function calculateEmissions(
  category: ActivityCategory,
  subcategory: string,
  amount: number
): number {
  const factor = EMISSION_FACTORS[category]?.[subcategory];
  if (factor === undefined) {
    throw new Error(`Invalid subcategory ${subcategory} in category ${category}`);
  }
  return Number((amount * factor).toFixed(2));
}
