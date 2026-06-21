'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useUserStreak } from '../../hooks/useUserStreak';
import { useAuthSession } from '../../lib/auth-context';
import { createOrUpdateProfile } from '../../app/actions/user';
import Image from 'next/image';
import { ProfileBadges } from './ProfileBadges';
import { ProfileSkeleton } from './ProfileSkeleton';
import { ProfileStreakBanner } from './ProfileStreakBanner';

/**
 * ProfileClient renders the client-side stateful Profile view.
 * Handles display name and weekly budget configurations, displays streaks,
 * and lists earned gamified achievement badges.
 * 
 * @returns React element representing the user profile dashboard page.
 * @throws {never} This function does not throw.
 */
export function ProfileClient(): React.ReactElement {
  const { uid, email, displayName: sessionName, photoURL } = useAuthSession();
  const { profile, streakDays, badges, loading } = useUserStreak(uid ?? undefined);

  const [displayName, setDisplayName] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState(150);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || sessionName || '');
      setWeeklyBudget(profile.weeklyBudgetKg || 150);
    }
  }, [profile, sessionName]);

  /**
   * Saves the updated display name and weekly budget to Firestore.
   * @param e - React form submit event.
   * @returns Promise resolving when the save completes.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!uid) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await createOrUpdateProfile({
        uid,
        displayName,
        email: profile?.email || email || 'user@example.com',
        weeklyBudgetKg: weeklyBudget,
        photoURL: photoURL ?? undefined,
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      console.error('[ProfileClient] Failed to save profile:', err);
      setErrorMsg('Could not save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }


  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName || 'User avatar'}
            width={56}
            height={56}
            className="rounded-full border-2 border-forest-200 object-cover"
            priority
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-2xl font-display font-bold text-forest-700">
            {(displayName || 'U')[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-display font-bold text-forest-900">
            {displayName || 'Your Profile'}
          </h1>
          <p className="text-sm text-slateBlue-500">{email}</p>
        </div>
      </div>

      {/* ── Streak Banner ── */}
      <ProfileStreakBanner streakDays={streakDays} totalKgSaved={profile?.totalKgSaved ?? 0} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ── Settings Form ── */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-surface-border rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-display font-bold text-forest-900">Profile Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <Input
                label="Weekly Carbon Budget (kg CO2e)"
                type="number"
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(parseInt(e.target.value, 10) || 0)}
                required
              />
            </div>

            {successMsg && (
              <p className="text-xs text-forest-700 bg-forest-50 border border-forest-100 p-3 rounded-xl font-medium">
                ✓ {successMsg}
              </p>
            )}
            {errorMsg && (
              <p className="text-xs text-amberAlert-700 bg-amberAlert-50 border border-amberAlert-200 p-3 rounded-xl font-medium">
                ⚠ {errorMsg}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting || !uid} className="w-full sm:w-auto">
              {isSubmitting ? 'Saving…' : 'Save Settings'}
            </Button>
          </form>
        </div>

        {/* ── Badge Showcase ── */}
        <ProfileBadges badges={badges} />
      </div>
    </div>
  );
}
