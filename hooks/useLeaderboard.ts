import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToLeaderboard } from '../lib/firebase/repositories';

import { LeaderboardEntry } from '../types';

/**
 * React hook that listens to the top users in Firestore in real-time,
 * ordered by totalKgSaved descending.
 *
 * @param topN - Maximum number of users to return (default 20).
 * @returns Object holding ranked entries, loading state, and any error.
 * @throws {never} This function does not throw.
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
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToLeaderboard(
        topN,
        (items) => {
          setEntries(items);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('[useLeaderboard] Firestore error:', toErrorMessage(err));
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