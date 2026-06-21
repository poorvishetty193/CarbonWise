'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { sanitizeObject } from '../../lib/sanitize';
import { revalidatePath } from 'next/cache';
import { toErrorMessage } from '@/lib/errors';

/**
 * Mutation function to create or update a user's profile document in Firestore.
 * Ensures the profile details are properly sanitized before write.
 * 
 * @param profile - Profile data object.
 * @param profile.uid - User's Firebase UID.
 * @param profile.displayName - User's display name.
 * @param profile.email - User's email address.
 * @param profile.weeklyBudgetKg - Optional weekly carbon budget.
 * @returns Object indicating success status.
 * @throws {Error} If database write fails.
 */
export async function createOrUpdateProfile(profile: {
  uid: string;
  displayName: string;
  email: string;
  weeklyBudgetKg?: number;
  photoURL?: string;
}): Promise<{ success: boolean }> {
  try {
    const sanitized = sanitizeObject(profile);
    const userRef = getAdminDb().collection('users').doc(sanitized.uid);

    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({
        uid: sanitized.uid,
        displayName: sanitized.displayName,
        email: sanitized.email,
        photoURL: sanitized.photoURL || null,
        weeklyBudgetKg: sanitized.weeklyBudgetKg || 150,
        streakDays: 0,
        totalKgSaved: 0,
        badges: ['first_log'],
        createdAt: new Date().toISOString()
      });
    } else {
      const updateData: Record<string, string | number | string[] | null> = {};
      if (sanitized.displayName) {
        updateData.displayName = sanitized.displayName;
      }
      if (sanitized.weeklyBudgetKg !== undefined) {
        updateData.weeklyBudgetKg = Number(sanitized.weeklyBudgetKg);
      }
      if (sanitized.photoURL !== undefined) {
        updateData.photoURL = sanitized.photoURL || null;
      }

      await userRef.update(updateData);
    }

    revalidatePath('/');
    revalidatePath('/profile');
    return { success: true };
  } catch (error: unknown) {
    console.error('[createOrUpdateProfile] Failed to update user profile:', toErrorMessage(error));
    throw error;
  }
}

/**
 * Mutation function to manually award a badge to a user.
 * 
 * @param uid - User's Firebase UID.
 * @param badgeId - Badge identifier to be awarded.
 * @returns Object indicating success status.
 * @throws {Error} If database transaction fails.
 */
export async function awardBadge(uid: string, badgeId: string): Promise<{ success: boolean }> {
  const userRef = getAdminDb().collection('users').doc(uid);

  try {
    await getAdminDb().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User profile does not exist.');
      }

      const badges: string[] = userDoc.data()?.badges || [];
      if (!badges.includes(badgeId)) {
        badges.push(badgeId);
        transaction.update(userRef, { badges });
      }
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error: unknown) {
    console.error('[awardBadge] Failed to award badge:', toErrorMessage(error));
    throw error;
  }
}
