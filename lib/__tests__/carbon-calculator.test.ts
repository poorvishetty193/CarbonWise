import { describe, it, expect } from 'vitest';
import { calculateEmissions } from '../carbon-calculator';

describe('calculateEmissions', () => {
  // ── Transport ──
  it('calculates gasoline_car at 100km', () => {
    expect(calculateEmissions('transport', 'gasoline_car', 100)).toBe(17.00);
  });

  it('calculates ev_car at 100km', () => {
    expect(calculateEmissions('transport', 'ev_car', 100)).toBe(4.70);
  });

  it('calculates rail at 200km', () => {
    expect(calculateEmissions('transport', 'rail', 200)).toBe(5.80);
  });

  it('calculates bus at 50km', () => {
    expect(calculateEmissions('transport', 'bus', 50)).toBe(4.10);
  });

  it('calculates short flight at 1000km', () => {
    expect(calculateEmissions('transport', 'flight_short', 1000)).toBe(150.00);
  });

  // ── Food ──
  it('calculates beef at 1kg', () => {
    expect(calculateEmissions('food', 'beef_mutton', 1)).toBe(30.00);
  });

  it('calculates vegan meal at 3 servings', () => {
    expect(calculateEmissions('food', 'vegan_meal', 3)).toBe(1.50);
  });

  it('calculates vegetarian meal at 2 servings', () => {
    expect(calculateEmissions('food', 'vegetarian_meal', 2)).toBe(3.00);
  });

  // ── Energy ──
  it('calculates grid electricity at 10 kWh', () => {
    expect(calculateEmissions('energy', 'grid_electricity', 10)).toBe(4.50);
  });

  it('calculates solar at 50 kWh (near zero)', () => {
    expect(calculateEmissions('energy', 'solar_renewable', 50)).toBe(0.75);
  });

  // ── Shopping ──
  it('calculates electronics at 1 unit', () => {
    expect(calculateEmissions('shopping', 'electronics', 1)).toBe(80.00);
  });

  it('calculates clothing at 2 items', () => {
    expect(calculateEmissions('shopping', 'clothing', 2)).toBe(20.00);
  });

  // ── Edge cases ──
  it('returns 0 for 0 amount', () => {
    expect(calculateEmissions('transport', 'gasoline_car', 0)).toBe(0.00);
  });

  it('throws on unknown subcategory', () => {
    expect(() =>
      calculateEmissions('transport', 'rocket_ship', 100)
    ).toThrow('Invalid subcategory rocket_ship in category transport');
  });

  it('throws on unknown category (cast)', () => {
    expect(() =>
      calculateEmissions('air' as 'transport', 'gasoline_car', 10)
    ).toThrow();
  });
});
