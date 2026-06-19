import { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { startOfDay, startOfWeek, isAfter } from 'date-fns';

/**
 * React hook that aggregates emissions from activities and tracks user status
 * against daily and weekly carbon budget limits.
 * 
 * @param activities - The array of activities fetched by the parent component.
 * @param loading - The loading state from the parent fetch.
 * @param weeklyBudget - The budget limit in kg CO2e configured for this user.
 * @returns Object holding daily total, weekly total, daily over budget status, weekly over budget status, and loading state.
 * @throws {never} This hook does not throw errors.
 */
export function useCarbonBudget(
  activities: ActivityLog[],
  loading: boolean,
  weeklyBudget: number
): {
  dailyTotal: number;
  weeklyTotal: number;
  isDailyOver: boolean;
  isWeeklyOver: boolean;
  loading: boolean;
} {
  const [dailyTotal, setDailyTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [isDailyOver, setIsDailyOver] = useState(false);
  const [isWeeklyOver, setIsWeeklyOver] = useState(false);

  useEffect(() => {
    if (loading || !activities.length) {
      setDailyTotal(0);
      setWeeklyTotal(0);
      setIsDailyOver(false);
      setIsWeeklyOver(false);
      return;
    }

    const todayStart = startOfDay(new Date());
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start

    let dailySum = 0;
    let weeklySum = 0;

    activities.forEach((act) => {
      const actDate = new Date(act.loggedAt);
      if (isAfter(actDate, todayStart)) {
        dailySum += act.valueKg;
      }
      if (isAfter(actDate, weekStart)) {
        weeklySum += act.valueKg;
      }
    });

    setDailyTotal(dailySum);
    setWeeklyTotal(weeklySum);

    const dailyBudget = weeklyBudget / 7;
    setIsDailyOver(dailySum > dailyBudget);
    setIsWeeklyOver(weeklySum > weeklyBudget);
  }, [activities, loading, weeklyBudget]);

  return {
    dailyTotal,
    weeklyTotal,
    isDailyOver,
    isWeeklyOver,
    loading
  };
}
