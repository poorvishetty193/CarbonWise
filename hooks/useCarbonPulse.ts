import { toErrorMessage } from '../lib/errors';
import { useState, useEffect } from 'react';
import { subscribeToActivities, subscribeToUserProfile } from '../lib/firebase/repositories';
import { ActivityLog, UserProfile } from '../types';
import { startOfDay, startOfWeek, isAfter } from 'date-fns';

interface UseCarbonPulseReturn {
  todayKg: number;
  weeklyBudget: number;
  ratio: number;
  status: 'under' | 'near' | 'over';
  isLoading: boolean;
}

/**
 * Calculates the user's daily carbon pulse based on their activity log and profile.
 * 
 * @param uid - The user's Firebase UID
 * @returns {UseCarbonPulseReturn} Daily emissions, budget, ratio, and status
 * @throws {never} This function does not throw.
 */
export function useCarbonPulse(uid: string): UseCarbonPulseReturn {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubActivities = subscribeToActivities(uid, 100, (items) => {
      setActivities(items);
      setLoadingActivities(false);
    }, (error) => {
      console.error(toErrorMessage(error));
      setLoadingActivities(false);
    });

    const unsubProfile = subscribeToUserProfile(uid, (data) => {
      setProfile(data);
      setLoadingProfile(false);
    }, (error) => {
      console.error(toErrorMessage(error));
      setLoadingProfile(false);
    });

    return () => {
      unsubActivities();
      unsubProfile();
    };
  }, [uid]);

  const isLoading = loadingActivities || loadingProfile;
  const weeklyBudget = profile?.weeklyBudgetKg ?? 150;
  const dailyBudget = weeklyBudget / 7;

  let todayKg = 0;
  if (!isLoading) {
    const todayStart = startOfDay(new Date());
    activities.forEach(act => {
      if (isAfter(new Date(act.loggedAt), todayStart)) {
        todayKg += act.valueKg;
      }
    });
  }

  const ratio = dailyBudget > 0 ? todayKg / dailyBudget : 0;
  let status: 'under' | 'near' | 'over' = 'under';
  if (ratio > 1) status = 'over';
  else if (ratio >= 0.8) status = 'near';

  return {
    todayKg,
    weeklyBudget,
    ratio,
    status,
    isLoading
  };
}
