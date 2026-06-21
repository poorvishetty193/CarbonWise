import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToActivities } from '../lib/firebase/repositories';

import { ActivityLog } from '../types';

/**
 * React hook that listens to the user's logged activities in real-time.
 * 
 * @param uid - The Firebase User ID of the user. If undefined, listening is skipped.
 * @param limitCount - Optional max number of activities to fetch (prevents unbounded queries).
 * @returns Object holding activities array and loading state.
 * @throws {never} This hook handles all database subscription errors internally.
 */
export function useActivityLog(uid: string | undefined, limitCount: number = 50): {
  activities: ActivityLog[];
  loading: boolean;
} {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setActivities([]);
      setLoading(false);
      return;
    }
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToActivities(uid, limitCount, (items) => {
        setActivities(items);
        setLoading(false);
      }, (error: unknown) => {
        console.error("Error fetching activities", toErrorMessage(error));
        setLoading(false);
      });
    } catch (e: any) {
      if (e.message?.includes('INTERNAL ASSERTION FAILED')) {
        console.warn('Ignored Firestore onSnapshot assertion failure during fast remount');
      } else {
        console.error(e);
      }
    }

    return () => {
      try {
        unsubscribe();
      } catch (e: any) {
        if (e.message?.includes('INTERNAL ASSERTION FAILED')) {
          console.warn('Ignored Firestore unsubscribe assertion failure during fast unmount');
        } else {
          console.error(e);
        }
      }
    };
  }, [uid, limitCount]);

  return { activities, loading };
}
