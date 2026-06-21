import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToWeeklyLeaderboard } from '../lib/firebase/repositories';
import { LeaderboardEntry } from '../types';

interface UseLeaderboardRealtimeReturn {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to listen to the weekly leaderboard in real-time.
 * 
 * @param weekId - The week identifier, e.g., '2026-W25'
 * @returns {UseLeaderboardRealtimeReturn} Real-time leaderboard entries
 * @throws {never} This function does not throw.
 */
export function useLeaderboardRealtime(weekId: string): UseLeaderboardRealtimeReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!weekId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToWeeklyLeaderboard(weekId, (items) => {
        setEntries(items);
        setError(null);
        setIsLoading(false);
      }, (err) => {
        console.error(toErrorMessage(err));
        setError('Could not load leaderboard.');
        setIsLoading(false);
      });
    } catch (e: unknown) {
      console.error(e);
      setError('Could not load leaderboard.');
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, [weekId]);

  return { entries, isLoading, error };
}