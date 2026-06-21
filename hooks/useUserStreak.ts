import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToUserProfile } from '../lib/firebase/repositories';

import { UserProfile } from '../types';

/**
 * React hook that listens to the user profile document in Firestore in real-time,
 * yielding their logging streaks and earned badges.
 * 
 * @param uid - The Firebase User ID of the user. If undefined, listening is skipped.
 * @returns Object holding profile, streakDays count, badges array, and loading state.
 * @throws {never} This hook handles all database subscription errors internally.
 */
export function useUserStreak(uid: string | undefined): {
  profile: UserProfile | null;
  streakDays: number;
  badges: string[];
  loading: boolean;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToUserProfile(uid, (profileData) => {
        setProfile(profileData);
        setLoading(false);
      }, (error: unknown) => {
        console.error("Error fetching user profile for streak", toErrorMessage(error));
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
  }, [uid]);

  return {
    profile,
    streakDays: profile?.streakDays ?? 0,
    badges: profile?.badges ?? [],
    loading
  };
}
