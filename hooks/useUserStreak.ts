import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToUserProfile } from '../lib/firebase/repositories';
import { UserProfile } from '../types';

export function useUserStreak(uid: string | undefined): {
  profile: UserProfile | null;
  streakDays: number;
  badges: string[];
  loading: boolean;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToUserProfile(uid, (profileData) => {
        if (isMounted) {
          setProfile(profileData);
          setLoading(false);
        }
      }, (error: unknown) => {
        if (isMounted) {
          console.error("Error setting up profile realtime listener", toErrorMessage(error));
          setLoading(false);
        }
      });
    } catch (e: unknown) {
      if (isMounted) {
        console.error("Error subscribing to user profile:", toErrorMessage(e));
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
  }, [uid]);

  return {
    profile,
    streakDays: profile?.streakDays ?? 0,
    badges: profile?.badges ?? [],
    loading
  };
}
