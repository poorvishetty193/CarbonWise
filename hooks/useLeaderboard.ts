import { useState, useEffect } from 'react';
import { db } from '../lib/firebase/client';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LeaderboardEntry } from '../types';

/**
 * React hook that listens to the weekly community rankings in real-time.
 * 
 * @param weekId - The ISO week string (e.g. "2024-W23"). If empty, listening is skipped.
 * @returns Object holding sorted leaderboard entries array and loading state.
 * @throws {never} This hook handles all database subscription errors internally.
 */
export function useLeaderboard(weekId: string): {
  entries: LeaderboardEntry[];
  loading: boolean;
} {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weekId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'leaderboard', weekId, 'entries'),
      orderBy('weeklyKgSaved', 'desc'),
      limit(25)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        items.push({ uid: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setEntries(items);
      setLoading(false);
    }, (error: unknown) => {
      console.error("Error fetching leaderboard", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weekId]);

  return { entries, loading };
}
