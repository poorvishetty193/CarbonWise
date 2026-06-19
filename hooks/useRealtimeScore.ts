import { useState, useEffect } from 'react';
import { useActivityLog } from './useActivityLog';
import { startOfDay, isAfter } from 'date-fns';

/**
 * React hook that derives a real-time carbon score representing today's cumulative emissions,
 * and maintains an screen-reader friendly announcement message for accessibility compliance.
 * 
 * @param uid - The Firebase User ID of the user. If undefined, tracking is skipped.
 * @returns Object holding today's carbon score, screen reader announcement, and loading state.
 * @throws {never} This hook does not throw errors.
 */
export function useRealtimeScore(uid: string | undefined): {
  todayScore: number;
  announcement: string;
  loading: boolean;
} {
  const { activities, loading } = useActivityLog(uid);
  const [todayScore, setTodayScore] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (loading) return;

    const todayStart = startOfDay(new Date());
    let sum = 0;
    activities.forEach((act) => {
      const actDate = new Date(act.loggedAt);
      if (isAfter(actDate, todayStart)) {
        sum += act.valueKg;
      }
    });

    if (sum !== todayScore) {
      const diff = sum - todayScore;
      if (todayScore > 0) {
        setAnnouncement(
          diff > 0 
            ? `Your carbon score increased by ${diff.toFixed(1)} kg. Today's total is now ${sum.toFixed(1)} kg.`
            : `Your carbon score decreased. Today's total is now ${sum.toFixed(1)} kg.`
        );
      }
      setTodayScore(sum);
    }
  }, [activities, loading, todayScore]);

  return { todayScore, announcement, loading };
}
