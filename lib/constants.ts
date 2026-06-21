import { ActivityCategory } from '../types';

/**
 * Standard carbon emission coefficients based on IPCC AR6 guidelines.
 * Units: kg CO2e per corresponding unit (e.g., km, kg, kWh).
 * @returns The shape or unit of this constant object.
 * @throws {never} This constant does not throw.
 */
export const EMISSION_FACTORS: Record<ActivityCategory, Record<string, number>> = {
  transport: {
    gasoline_car: 0.170,
    ev_car: 0.047,
    bus: 0.082,
    rail: 0.029,
    flight_short: 0.150,
    flight_long: 0.115,
  },
  food: {
    beef_mutton: 30.0,
    poultry_pork: 6.0,
    dairy_heavy: 12.0,
    vegetarian_meal: 1.5,
    vegan_meal: 0.5,
  },
  energy: {
    grid_electricity: 0.450,
    natural_gas: 0.180,
    solar_renewable: 0.015,
  },
  shopping: {
    clothing: 10.0,
    electronics: 80.0,
    furniture: 45.0,
    general: 1.5,
  }
};

/**
 * Gamification achievements definitions.
 * @returns The shape or unit of this constant object.
 * @throws {never} This constant does not throw.
 */
export const BADGE_DEFINITIONS = [
  { id: 'first_log', title: 'Carbon Pioneer', description: 'Log your first daily activity', icon: '🌱' },
  { id: 'streak_3', title: 'Climate Advocate', description: 'Maintain a 3-day tracking streak', icon: '🔥' },
  { id: 'meatless_monday', title: 'Herbivore Hero', description: 'Log a vegan or vegetarian day', icon: '🥗' },
  { id: 'budget_saver', title: 'Shield of Earth', description: 'Stay under your carbon budget for 5 days straight', icon: '🛡️' },
  { id: 'transit_star', title: 'Rider on the Rail', description: 'Log zero private vehicle transport in a week', icon: '🚆' }
] as const;

/**
 * Color mappings for styling and UI display.
 * @returns The shape or unit of this constant object.
 * @throws {never} This constant does not throw.
 */
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: '#4B6B88',
  food: '#2A5C47',
  energy: '#F59E0B',
  shopping: '#D4AF37',
};

/**
 * Routing constants to maintain link safety.
 * @returns The shape or unit of this constant object.
 * @throws {never} This constant does not throw.
 */
export const ROUTES = {
  HOME: '/',
  LOG: '/log',
  INSIGHTS: '/insights',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;


/**
 *  E R R O R_ M E S S A G E S constant.
 * @returns The shape or unit of this constant object.
 * @throws {never} This constant does not throw.
 */
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'An unknown error occurred',
  GENERIC_FAILURE: 'Something went wrong. Please try again.',
  ACTIVITY_LOG_FAILED: 'Failed to log activity. Please try again.',
  INSIGHTS_UNAVAILABLE: 'AI insights are temporarily unavailable.',
  RATE_LIMITED: 'Too many requests. Please wait a moment.',
  AUTH_REQUIRED: 'You must be signed in to do that.',
} as const satisfies Record<string, string>;
