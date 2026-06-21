import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToActivities } from '../lib/firebase/repositories';
import { ActivityLog } from '../types';

export function useActivityLog(uid: string | undefined, limitCount: number = 50): {
  activities: ActivityLog[];
  loading: boolean;
} {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!uid) {
      setActivities([]);
      setLoading(false);
      return;
    }
    
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToActivities(uid, limitCount, (items) => {
        if (isMounted) {
          setActivities(items);
          setLoading(false);
        }
      }, (error: unknown) => {
        if (isMounted) {
          console.error("Error setting up activity log realtime listener:", toErrorMessage(error));
          setLoading(false);
        }
      });
    } catch (e: unknown) {
      if (isMounted) {
        console.error("Error subscribing to activities:", toErrorMessage(e));
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      try {
        unsubscribe();
      } catch (e: unknown) {
        const err = e as Error;
        if (err.message?.includes('INTERNAL ASSERTION FAILED')) {
          console.warn('Ignored Firestore onSnapshot assertion failure during fast remount');
        } else {
          console.error(toErrorMessage(err));
        }
      }
    };
  }, [uid, limitCount]);

  return { activities, loading };
}
