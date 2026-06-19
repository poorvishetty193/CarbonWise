import { getFirebaseAnalytics } from './firebase/client';
import { logEvent } from 'firebase/analytics';

/**
 * Registry of permitted parameters mapped to their event titles.
 */
export interface EventParams {
  activity_logged: { category: string; valueKg: number };
  ai_insights_requested: { uid: string };
  streak_milestone: { uid: string; streakDays: number };
  badge_earned: { uid: string; badgeId: string };
  leaderboard_viewed: { uid: string };
  budget_alert_triggered: { uid: string; budgetKg: number; currentKg: number };
  offset_link_clicked: { uid: string; provider: string };
  onboarding_completed: { uid: string };
  challenge_joined: { uid: string; challengeId: string };
  dashboard_viewed: { uid: string };
  activity_logged_page_viewed: { uid: string };
}

/**
 * Browser-safe function that logs analytical milestones to the Firebase platform.
 * @param event Named analytics event.
 * @param params Associated payload parameters.
 * @returns Promise representing the logging action.
 */
export async function trackEvent<K extends keyof EventParams>(
  event: K,
  params: EventParams[K]
): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const analytics = await getFirebaseAnalytics();
      if (analytics) {
        logEvent(analytics, event, params);
      }
    }
  } catch (error: unknown) {
    console.error(`Error logging analytics event ${event}:`, error);
  }
}
