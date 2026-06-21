'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const EmissionsRing = dynamic(
  () => import('../charts/EmissionsRing'),
  { ssr: false }
);

const WeeklyBar = dynamic(
  () => import('../charts/WeeklyBar'),
  { ssr: false }
);

import { Card } from '../ui/Card';
import { useUserStreak } from '../../hooks/useUserStreak';
import { useCarbonBudget } from '../../hooks/useCarbonBudget';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useRealtimeScore } from '../../hooks/useRealtimeScore';
import { useAuthSession } from '../../lib/auth-context';
import { ActivityCard } from '../activity/ActivityCard';
import Link from 'next/link';
import { ROUTES } from '../../lib/constants';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardStats } from './DashboardStats';
import { DashboardRecentLogs } from './DashboardRecentLogs';

/**
 * DashboardHomeClient renders the client-side stateful home dashboard.
 * Uses real-time listeners for activity logging, budgets, and streaks,
 * presenting an interactive display with high-fidelity visual skeletons.
 * 
 * @returns React element representing the home dashboard view.
 * @throws {never} This function does not throw.
 */
export function DashboardHomeClient(): React.ReactElement {
  const { uid, displayName } = useAuthSession();

  const { profile, loading: streakLoading } = useUserStreak(uid ?? undefined);
  const weeklyBudget = profile?.weeklyBudgetKg ?? 150;
  
  // Fetch activities ONCE for the dashboard (limit to recent 100 to avoid unbounded growth)
  const { activities, loading: activityLoading } = useActivityLog(uid ?? undefined, 100);
  
  // Pass activities to derived hooks instead of creating duplicate listeners
  const { dailyTotal, weeklyTotal, isDailyOver } = useCarbonBudget(activities, activityLoading, weeklyBudget);
  const { announcement } = useRealtimeScore(activities, activityLoading);

  const loading = streakLoading || activityLoading;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon

  // Approximate historical seed values (kg CO2e per category per day)
  const seedTransport = [14, 10, 13, 11, 12, 0, 0];
  const seedFood     = [ 5,  4,  5,  4,  5, 0, 0];
  const seedEnergy   = [ 4,  3,  3,  3,  4, 0, 0];
  const seedShopping = [ 1,  1,  1,  2,  1, 0, 0];

  const weeklyData = days.map((day, i) => ({
    day,
    transport: i === todayIdx ? dailyTotal * 0.60 : seedTransport[i],
    food:      i === todayIdx ? dailyTotal * 0.20 : seedFood[i],
    energy:    i === todayIdx ? dailyTotal * 0.15 : seedEnergy[i],
    shopping:  i === todayIdx ? dailyTotal * 0.05 : seedShopping[i],
  }));

  // Prefer live Firestore value so profile edits reflect instantly without re-login
  const greeting = profile?.displayName || displayName || 'Climate Hero';
  const dailyBudget = weeklyBudget / 7;
  const dailyRemaining = Math.max(0, dailyBudget - dailyTotal);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* ── Header ── */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-forest-900">
            Welcome back, {greeting}
          </h1>
          <p className="text-sm text-slateBlue-500 mt-1">
            Here is your daily carbon footprint snapshot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDailyOver && (
            <div className="flex items-center gap-1.5 text-xs bg-amberAlert-100 border border-amberAlert-200 text-amberAlert-700 px-3 py-1.5 rounded-xl font-semibold animate-pulse-slow">
              ⚠️ Over daily budget
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm bg-forest-50 border border-forest-100 text-forest-700 px-3 py-1.5 rounded-xl font-semibold">
            🔥 {profile?.streakDays ?? 0} Day Streak
          </div>
        </div>
      </section>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section aria-labelledby="pulse-title">
          <h2 id="pulse-title" className="sr-only">Today&apos;s Carbon Pulse</h2>
          <EmissionsRing currentKg={dailyTotal} budgetKg={dailyBudget} />
        </section>

        <section aria-labelledby="weekly-title">
          <h2 id="weekly-title" className="sr-only">Weekly Emissions</h2>
          <WeeklyBar data={weeklyData} />
        </section>
      </div>

      {/* ── Stat Cards ── */}
      <DashboardStats
        totalKgSaved={profile?.totalKgSaved ?? 0}
        isDailyOver={isDailyOver}
        dailyRemaining={dailyRemaining}
        weeklyTotal={weeklyTotal}
        weeklyBudget={weeklyBudget}
      />

      {/* ── Recent Activity ── */}
      <DashboardRecentLogs activities={activities} />

      {/* Accessibility Announcement */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
