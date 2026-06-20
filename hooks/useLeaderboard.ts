import { useState, useEffect } from 'react';
import { db } from '../lib/firebase/client';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LeaderboardEntry } from '../types';

/**
 * React hook that listens to the top users in Firestore in real-time,
 * ordered by totalKgSaved descending.
 *
 * @param topN - Maximum number of users to return (default 20).
 * @returns Object holding ranked entries, loading state, and any error.
 */
export function useLeaderboard(topN = 20): {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
} {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('totalKgSaved', 'desc'),
      limit(topN)
    );

    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: LeaderboardEntry[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              uid: doc.id,
              displayName: data.displayName || 'Anonymous',
              photoURL: data.photoURL ?? undefined,
              weeklyKgSaved: typeof data.totalKgSaved === 'number' ? data.totalKgSaved : 0,
              rank: 0, // assigned below
            });
          });

          // Assign ranks after sort is already applied by Firestore
          items.forEach((item, i) => { item.rank = i + 1; });

          setEntries(items);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('[useLeaderboard] Firestore error:', err);
          setError('Could not load leaderboard. Check Firestore indexes.');
          setLoading(false);
        }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[useLeaderboard] Unexpected error:', msg);
      setError(msg);
      setLoading(false);
    }

    return () => {
      try { unsubscribe(); } catch (_) { /* ignore unmount races */ }
    };
  }, [topN]);

  return { entries, loading, error };
}