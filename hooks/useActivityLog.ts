import { useState, useEffect } from 'react';
import { db } from '../lib/firebase/client';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ActivityLog } from '../types';

/**
 * React hook that listens to the user's logged activities in real-time.
 * 
 * @param uid - The Firebase User ID of the user. If undefined, listening is skipped.
 * @returns Object holding activities array and loading state.
 * @throws {never} This hook handles all database subscription errors internally.
 */
export function useActivityLog(uid: string | undefined): {
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

    const q = query(
      collection(db, 'activities'),
      where('uid', '==', uid),
      orderBy('loggedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ActivityLog[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ActivityLog);
      });
      setActivities(items);
      setLoading(false);
    }, (error: unknown) => {
      console.error("Error fetching activities", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { activities, loading };
}
