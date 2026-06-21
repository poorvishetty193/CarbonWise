/**
 * Category names for carbon-generating activities.
 */
export type ActivityCategory = 'transport' | 'food' | 'energy' | 'shopping';

/**
 * Metadata associated with a specific carbon activity log.
 */
export interface ActivityMetadata {
  type?: string;
  unit?: string;
  amount?: number;
}

/**
 * Structure representing a logged activity document.
 * @alias ActivityLog — used interchangeably in the codebase.
 */
export interface Activity {
  id?: string;
  uid: string;
  category: ActivityCategory;
  subcategory: string;
  valueKg: number;
  metadata: ActivityMetadata;
  loggedAt: string;
}

/** Alias for Activity — preferred name in hook layer. */
export type ActivityLog = Activity;

/**
 * Structured schema representing a user profile document in Firestore.
 * @alias UserProfile — preferred name in hook layer.
 */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  weeklyBudgetKg: number;
  streakDays: number;
  totalKgSaved: number;
  badges: string[];
  createdAt: string;
}

/** Alias for User — preferred name in hook layer. */
export type UserProfile = User;

/**
 * Structure representing a user entry in the Weekly Leaderboard rankings.
 */
export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  weeklyKgSaved: number;
  rank: number;
}

/**
 * API response format for computed carbon scores.
 */
export interface CarbonScore {
  emissions: number;
}

/**
 * Representation of an AI insight result.
 */
export interface AIInsight {
  actions: { text: string; kgSaved: number }[];
  behavioralInsight: string;
  positiveReinforcement: string;
}

/**
 * Gamification badge properties.
 */
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * Structured emission coefficient metadata.
 */
export interface EmissionFactor {
  category: ActivityCategory;
  subcategory: string;
  factor: number;
}

/**
 * Weekly carbon budget status.
 */
export interface CarbonBudgetStatus {
  dailyTotal: number;
  weeklyTotal: number;
  isOverBudget: boolean;
  percentUsed: number;
}

/**
 * Activity summary by category for AI insights.
 */
export interface ActivitySummary {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
}

export type ActivityLogResult =
  | { success: true; activityId: string; kgCO2e: number }
  | { success: false; error: string };

export type InsightResult =
  | { status: 'streaming'; partialText: string }
  | { status: 'complete'; text: string; savedAt?: string }
  | { status: 'error'; message: string };
