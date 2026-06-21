const fs = require('fs');

const path = 'D:/CarbonWise/app/actions/activity.ts';
let code = fs.readFileSync(path, 'utf8');

// I'll manually create the new code string by splitting and joining
// But since the logic is straightforward, I can construct the new file content

const newCode = `'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { calculateEmissions } from '../../lib/carbon-calculator';
import { ActivityCategory } from '../../types';
import { sanitizeObject } from '../../lib/sanitize';
import { revalidatePath } from 'next/cache';
import { startOfDay, startOfWeek, isAfter, format } from 'date-fns';
import { toErrorMessage } from '@/lib/errors';

function calculateStreak(currentStreak: number, lastLoggedDate: string, todayStr: string, yesterdayStr: string): number {
  if (!lastLoggedDate) return 1;
  if (lastLoggedDate === todayStr) return currentStreak;
  if (lastLoggedDate === yesterdayStr) return currentStreak + 1;
  return 1;
}

function calculateBudgetSaverStreak(
  currentStreak: number,
  lastSavedDate: string,
  todayStr: string,
  yesterdayStr: string,
  todayTotal: number,
  dailyBudget: number
): number {
  if (todayTotal <= dailyBudget) {
    if (lastSavedDate !== todayStr) {
      return lastSavedDate === yesterdayStr ? currentStreak + 1 : 1;
    }
    return currentStreak;
  }
  return 0;
}

function checkBadges(
  badges: string[],
  newStreak: number,
  category: string,
  subcategory: string,
  budgetStreak: number,
  hasPublicTransit: boolean,
  hasGasolineOrEv: boolean
): string[] {
  const newBadges = [...badges];
  if (!newBadges.includes('first_log')) newBadges.push('first_log');
  if (newStreak >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3');
  if (category === 'food' && (subcategory === 'vegetarian_meal' || subcategory === 'vegan_meal') && !newBadges.includes('meatless_monday')) {
    newBadges.push('meatless_monday');
  }
  if (budgetStreak >= 5 && !newBadges.includes('budget_saver')) newBadges.push('budget_saver');
  if (hasPublicTransit && !hasGasolineOrEv && !newBadges.includes('transit_star')) newBadges.push('transit_star');
  return newBadges;
}

export async function logActivity(formData: {
  uid: string;
  category: ActivityCategory;
  subcategory: string;
  amount: number;
}): Promise<{ success: boolean; emissions: number }> {
  const sanitized = sanitizeObject(formData);
  const emissions = calculateEmissions(
    sanitized.category as ActivityCategory,
    sanitized.subcategory,
    sanitized.amount
  );

  const activityDoc = {
    uid: sanitized.uid,
    category: sanitized.category,
    subcategory: sanitized.subcategory,
    valueKg: emissions,
    metadata: {
      amount: sanitized.amount,
      unit: sanitized.category === 'transport' ? 'km' : sanitized.category === 'energy' ? 'kWh' : 'qty'
    },
    loggedAt: new Date().toISOString()
  };

  const dbRef = getAdminDb().collection('activities');
  const userRef = getAdminDb().collection('users').doc(sanitized.uid);

  const today = new Date();
  const startOfTodayDate = startOfDay(today);
  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 });
  
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

  let todayTotalBeforeLog = 0;
  let hasGasolineOrEvThisWeek = false;
  let hasPublicTransitThisWeek = false;

  try {
    const activitiesSnapshot = await getAdminDb().collection('activities')
      .where('uid', '==', sanitized.uid)
      .where('loggedAt', '>=', startOfWeekDate.toISOString())
      .get();

    activitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      const valueKg = data.valueKg || 0;
      const loggedAtDate = new Date(data.loggedAt);

      if (loggedAtDate.getTime() >= startOfTodayDate.getTime()) {
        todayTotalBeforeLog += valueKg;
      }

      if (data.category === 'transport') {
        if (data.subcategory === 'gasoline_car' || data.subcategory === 'ev_car') hasGasolineOrEvThisWeek = true;
        if (data.subcategory === 'bus' || data.subcategory === 'rail') hasPublicTransitThisWeek = true;
      }
    });

    if (sanitized.category === 'transport') {
      if (sanitized.subcategory === 'gasoline_car' || sanitized.subcategory === 'ev_car') hasGasolineOrEvThisWeek = true;
      if (sanitized.subcategory === 'bus' || sanitized.subcategory === 'rail') hasPublicTransitThisWeek = true;
    }

    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekId = format(weekStart, "yyyy-'W'ww");
    const leaderboardRef = getAdminDb().collection('leaderboard').doc(weekId).collection('entries').doc(sanitized.uid);

    await getAdminDb().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const leaderboardDoc = await transaction.get(leaderboardRef);

      let userData: any = userDoc.exists ? userDoc.data() : {};

      const currentStreak = userData?.streakDays || 0;
      const currentSaved = userData?.totalKgSaved || 0;
      const lastLoggedDate = userData?.lastLoggedDate || '';
      const weeklyBudget = userData?.weeklyBudgetKg || 150;
      const dailyBudget = weeklyBudget / 7;

      const newStreak = calculateStreak(currentStreak, lastLoggedDate, todayStr, yesterdayStr);

      const lastBudgetSavedDate = userData?.lastBudgetSavedDate || '';
      const currentBudgetSaverStreak = userData?.budgetSaverStreak || 0;
      const todayTotalAfterLog = todayTotalBeforeLog + emissions;
      const newBudgetSaverStreak = calculateBudgetSaverStreak(
        currentBudgetSaverStreak, lastBudgetSavedDate, todayStr, yesterdayStr, todayTotalAfterLog, dailyBudget
      );

      const badges = checkBadges(
        userData?.badges || [], newStreak, sanitized.category, sanitized.subcategory,
        newBudgetSaverStreak, hasPublicTransitThisWeek, hasGasolineOrEvThisWeek
      );

      const updatePayload: Record<string, unknown> = {
        streakDays: newStreak,
        lastLoggedDate: todayStr,
        totalKgSaved: Number((currentSaved + emissions).toFixed(2)),
        budgetSaverStreak: newBudgetSaverStreak,
        lastBudgetSavedDate: todayTotalAfterLog <= dailyBudget ? todayStr : lastBudgetSavedDate,
        badges
      };

      const newDocRef = dbRef.doc();
      transaction.set(newDocRef, activityDoc);
      
      if (userDoc.exists) {
        transaction.update(userRef, updatePayload);
      } else {
        transaction.set(userRef, {
          ...updatePayload,
          weeklyBudgetKg: 150,
          createdAt: new Date().toISOString()
        });
      }

      const weeklySavedBefore = leaderboardDoc.exists ? (leaderboardDoc.data()?.weeklyKgSaved || 0) : 0;
      const newWeeklySaved = Number((weeklySavedBefore + emissions).toFixed(2));
      transaction.set(leaderboardRef, {
        displayName: userData?.displayName || 'Climate Hero',
        weeklyKgSaved: newWeeklySaved,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });

    revalidatePath('/');
    revalidatePath('/log');
    revalidatePath('/profile');
    return { success: true, emissions };
  } catch (error: unknown) {
    console.error('[logActivity] Failed to log activity:', toErrorMessage(error));
    throw error;
  }
}

export async function deleteActivity(id: string, uid: string): Promise<{ success: boolean }> {
  const actRef = getAdminDb().collection('activities').doc(id);
  const userRef = getAdminDb().collection('users').doc(uid);

  try {
    await getAdminDb().runTransaction(async (transaction) => {
      const actDoc = await transaction.get(actRef);
      if (!actDoc.exists) throw new Error('Activity log not found.');

      const data = actDoc.data();
      if (data?.uid !== uid) throw new Error('Unauthorized');

      const userDoc = await transaction.get(userRef);

      const loggedAtDate = new Date(data.loggedAt);
      const weekStart = startOfWeek(loggedAtDate, { weekStartsOn: 1 });
      const weekId = format(weekStart, "yyyy-'W'ww");
      const leaderboardRef = getAdminDb().collection('leaderboard').doc(weekId).collection('entries').doc(uid);
      const leaderboardDoc = await transaction.get(leaderboardRef);

      const emissions = data.valueKg || 0;
      if (userDoc.exists) {
        const currentSaved = userDoc.data()?.totalKgSaved || 0;
        transaction.update(userRef, {
          totalKgSaved: Math.max(0, Number((currentSaved - emissions).toFixed(2)))
        });
      }

      transaction.delete(actRef);

      if (leaderboardDoc.exists) {
        const weeklySavedBefore = leaderboardDoc.data()?.weeklyKgSaved || 0;
        const newWeeklySaved = Math.max(0, Number((weeklySavedBefore - emissions).toFixed(2)));
        transaction.update(leaderboardRef, {
          weeklyKgSaved: newWeeklySaved,
          updatedAt: new Date().toISOString()
        });
      }
    });

    revalidatePath('/');
    revalidatePath('/log');
    revalidatePath('/profile');
    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteActivity] Failed to delete activity:', toErrorMessage(error));
    throw error;
  }
}
`;

fs.writeFileSync(path, newCode);
