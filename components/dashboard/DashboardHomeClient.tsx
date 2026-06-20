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

/**
 * DashboardHomeClient renders the client-side stateful home dashboard.
 * Uses real-time listeners for activity logging, budgets, and streaks,
 * presenting an interactive display with high-fidelity visual skeletons.
 * 
 * @returns React element representing the home dashboard view.
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
    return (
      <div className="space-y-8 font-sans animate-fade-in" aria-busy="true">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-surface-border rounded-xl animate-pulse" />
            <div className="h-4 w-48 bg-surface-border rounded-xl animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-surface-border rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-surface-border rounded-3xl p-6 animate-pulse flex flex-col items-center justify-center space-y-4">
            <div className="w-48 h-48 rounded-full border-8 border-surface-border animate-pulse-slow" />
            <div className="h-4 w-32 bg-surface-border rounded-xl" />
          </div>
          <div className="h-80 bg-white border border-surface-border rounded-3xl p-6 animate-pulse flex flex-col justify-end space-y-3">
            <div className="flex items-end justify-between h-48 w-full px-4">
              {[30, 45, 60, 25, 80, 50, 40].map((h, i) => (
                <div key={i} className="w-8 bg-surface-border rounded-t-lg" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="h-4 w-full bg-surface-border rounded-xl" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col gap-2 p-6 animate-pulse">
              <div className="h-3 w-20 bg-surface-border rounded-lg" />
              <div className="h-8 w-24 bg-surface-border rounded-xl my-1" />
              <div className="h-2 w-full bg-surface-border rounded-lg" />
            </Card>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-surface-border rounded-xl animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white border border-surface-border rounded-2xl p-4 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-border rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-surface-border rounded-lg" />
                    <div className="h-3 w-20 bg-surface-border rounded-lg" />
                  </div>
                </div>
                <div className="h-4 w-12 bg-surface-border rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-2">
          <span className="section-pill">Total Saved</span>
          <div className="flex items-baseline gap-1">
            <span className="stat-value">{(profile?.totalKgSaved ?? 0).toFixed(1)}</span>
            <span className="stat-unit">kg CO2e</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="section-pill">Daily Budget Left</span>
          <div className="flex items-baseline gap-1">
            <span className={`stat-value ${isDailyOver ? 'text-amberAlert-600' : 'text-forest-900'}`}>
              {dailyRemaining.toFixed(1)}
            </span>
            <span className="stat-unit">kg CO2e</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="section-pill">Weekly Footprint</span>
          <div className="flex items-baseline gap-1">
            <span className="stat-value">{weeklyTotal.toFixed(1)}</span>
            <span className="stat-unit">of {weeklyBudget} kg</span>
          </div>
          {/* Progress bar */}
          <div className="budget-bar mt-1">
            <div
              className="budget-bar-fill bg-forest-500"
              style={{ width: `${Math.min(100, (weeklyTotal / weeklyBudget) * 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <section className="space-y-4" aria-labelledby="recent-title">
        <div className="flex items-center justify-between">
          <h3 id="recent-title" className="text-xl font-display font-bold text-forest-900">
            Recent Logs
          </h3>
          <Link
            href={ROUTES.LOG}
            className="text-sm font-semibold text-forest-600 hover:text-forest-750 transition-colors"
          >
            Log New Activity →
          </Link>
        </div>

        <div className="space-y-3">
          {activities.slice(0, 3).map((act) => (
            <div key={act.id} className="animate-slide-up">
              <ActivityCard activity={act} />
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center p-10 bg-white border border-surface-border rounded-2xl text-slateBlue-500 text-sm">
              <p className="text-2xl mb-2">🌱</p>
              <p>No activities logged today.</p>
              <Link href={ROUTES.LOG} className="mt-2 inline-block text-forest-600 font-semibold hover:underline">
                Start tracking now →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Accessibility Announcement */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
