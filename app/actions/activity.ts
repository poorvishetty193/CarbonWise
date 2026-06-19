'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { calculateEmissions } from '../../lib/carbon-calculator';
import { ActivityCategory } from '../../types';
import { sanitizeObject } from '../../lib/sanitize';
import { revalidatePath } from 'next/cache';
import { startOfDay, startOfWeek, isAfter, format } from 'date-fns';

/**
 * Mutation function to log a new user activity. Calculates carbon emissions,
 * writes the log to Firestore, calculates the logging streak, and checks
 * badge award requirements in a single transaction.
 * 
 * @param formData - The raw input payload containing category, subcategory, and amount.
 * @param formData.uid - User's Firebase UID.
 * @param formData.category - Category of the activity.
 * @param formData.subcategory - Subcategory of the activity.
 * @param formData.amount - Quantity or distance of the activity.
 * @returns Object indicating success status and computed emissions.
 * @throws {Error} If calculations or database write fails.
 */
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

  // Define date variables for streak and badge logic
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const startOfTodayDate = startOfDay(today);

  let todayTotalBeforeLog = 0;
  let hasGasolineOrEvThisWeek = false;
  let hasPublicTransitThisWeek = false;

  try {
    // Retrieve this week's activities to evaluate leaderboard and badges
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
        if (data.subcategory === 'gasoline_car' || data.subcategory === 'ev_car') {
          hasGasolineOrEvThisWeek = true;
        }
        if (data.subcategory === 'bus' || data.subcategory === 'rail') {
          hasPublicTransitThisWeek = true;
        }
      }
    });

    // Factor in the current activity log
    if (sanitized.category === 'transport') {
      if (sanitized.subcategory === 'gasoline_car' || sanitized.subcategory === 'ev_car') {
        hasGasolineOrEvThisWeek = true;
      }
      if (sanitized.subcategory === 'bus' || sanitized.subcategory === 'rail') {
        hasPublicTransitThisWeek = true;
      }
    }

    await getAdminDb().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User profile does not exist.');
      }

      const userData = userDoc.data();
      const currentStreak = userData?.streakDays || 0;
      const currentSaved = userData?.totalKgSaved || 0;
      const lastLoggedDate = userData?.lastLoggedDate || '';
      const weeklyBudget = userData?.weeklyBudgetKg || 150;
      const dailyBudget = weeklyBudget / 7;

      // 1. Logging Streak calculation
      let newStreak = currentStreak;
      if (!lastLoggedDate) {
        newStreak = 1;
      } else if (lastLoggedDate === todayStr) {
        // Logged today already, streak remains unchanged
      } else if (lastLoggedDate === yesterdayStr) {
        newStreak = currentStreak + 1;
      } else {
        // Streak is broken, reset to 1
        newStreak = 1;
      }

      // 2. Budget Saver streak calculation (days under daily budget)
      const lastBudgetSavedDate = userData?.lastBudgetSavedDate || '';
      const currentBudgetSaverStreak = userData?.budgetSaverStreak || 0;
      let newBudgetSaverStreak = currentBudgetSaverStreak;

      const todayTotalAfterLog = todayTotalBeforeLog + emissions;

      if (todayTotalAfterLog <= dailyBudget) {
        if (lastBudgetSavedDate !== todayStr) {
          if (lastBudgetSavedDate === yesterdayStr) {
            newBudgetSaverStreak = currentBudgetSaverStreak + 1;
          } else {
            newBudgetSaverStreak = 1;
          }
        }
      } else {
        newBudgetSaverStreak = 0;
      }

      // 3. Badge Award triggers
      const badges: string[] = userData?.badges || [];

      if (!badges.includes('first_log')) {
        badges.push('first_log');
      }
      if (newStreak >= 3 && !badges.includes('streak_3')) {
        badges.push('streak_3');
      }
      if (
        sanitized.category === 'food' &&
        (sanitized.subcategory === 'vegetarian_meal' || sanitized.subcategory === 'vegan_meal') &&
        !badges.includes('meatless_monday')
      ) {
        badges.push('meatless_monday');
      }
      if (newBudgetSaverStreak >= 5 && !badges.includes('budget_saver')) {
        badges.push('budget_saver');
      }
      if (hasPublicTransitThisWeek && !hasGasolineOrEvThisWeek && !badges.includes('transit_star')) {
        badges.push('transit_star');
      }

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
      transaction.update(userRef, updatePayload);

      // 4. Update Weekly Leaderboard entry
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekId = format(weekStart, "yyyy-'W'ww");
      const leaderboardRef = getAdminDb().collection('leaderboard').doc(weekId).collection('entries').doc(sanitized.uid);
      const leaderboardDoc = await transaction.get(leaderboardRef);
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
    console.error('[logActivity] Failed to log activity:', error);
    throw error;
  }
}

/**
 * Mutation function to delete a logged user activity. Adjusts user statistics.
 * 
 * @param id - Document ID of the activity to delete.
 * @param uid - Owner's Firebase UID.
 * @returns Object indicating success status.
 * @throws {Error} If unauthorized or database delete fails.
 */
export async function deleteActivity(id: string, uid: string): Promise<{ success: boolean }> {
  const actRef = getAdminDb().collection('activities').doc(id);
  const userRef = getAdminDb().collection('users').doc(uid);

  try {
    await getAdminDb().runTransaction(async (transaction) => {
      const actDoc = await transaction.get(actRef);
      if (!actDoc.exists) {
        throw new Error('Activity log not found.');
      }

      const data = actDoc.data();
      if (data?.uid !== uid) {
        throw new Error('Unauthorized');
      }

      const emissions = data.valueKg || 0;
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists) {
        const currentSaved = userDoc.data()?.totalKgSaved || 0;
        transaction.update(userRef, {
          totalKgSaved: Math.max(0, Number((currentSaved - emissions).toFixed(2)))
        });
      }

      transaction.delete(actRef);

      // Update Weekly Leaderboard entry (subtracting deleted emissions)
      const loggedAt = data.loggedAt;
      const loggedAtDate = new Date(loggedAt);
      const weekStart = startOfWeek(loggedAtDate, { weekStartsOn: 1 });
      const weekId = format(weekStart, "yyyy-'W'ww");
      const leaderboardRef = getAdminDb().collection('leaderboard').doc(weekId).collection('entries').doc(uid);
      const leaderboardDoc = await transaction.get(leaderboardRef);
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
    console.error('[deleteActivity] Failed to delete activity:', error);
    throw error;
  }
}
