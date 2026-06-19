import { useState, useEffect } from 'react';
import { db } from '../lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
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

    const docRef = doc(db, 'users', uid);
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error: unknown) => {
        console.error("Error fetching user profile for streak", error);
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
