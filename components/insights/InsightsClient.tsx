'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ImpactGlobe = dynamic(
  () => import('../charts/ImpactGlobe'),
  { ssr: false }
);

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useUserStreak } from '../../hooks/useUserStreak';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useAuthSession } from '../../lib/auth-context';
import { CATEGORY_COLORS } from '../../lib/constants';
import type { ActivityCategory } from '../../types';
import { useStreamingInsights } from '../../hooks/useStreamingInsights';
import { InsightsSkeleton } from './InsightsSkeleton';
import { OffsetMarketplace } from './OffsetMarketplace';

// Dynamically import ReactMarkdown to prevent Next.js 14 dev-server ESM interop errors
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
/**
 * InsightsClient renders the client-side stateful AI Climate Insights view.
 * Streams personalized carbon reduction advice based on logged activities.
 * 
 * @returns React element representing the AI insights view.
 * @throws {never} This function does not throw.
 */
export function InsightsClient(): React.ReactElement {
  const { uid } = useAuthSession();
  const { profile, loading: streakLoading } = useUserStreak(uid ?? undefined);
  const { activities, loading: activityLoading } = useActivityLog(uid ?? undefined);

  const { text: streamedText, isStreaming: loading, trigger: fetchInsights } = useStreamingInsights(uid ?? '');

  const pageLoading = streakLoading || activityLoading;

  /** Derive activity summary by category from Firestore logs. */
  const activitySummary = React.useMemo(() => {
    const summary: Record<ActivityCategory, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    };
    activities.forEach((act) => {
      summary[act.category] = (summary[act.category] ?? 0) + act.valueKg;
    });
    return summary;
  }, [activities]);

  useEffect(() => {
    if (!pageLoading) {
      fetchInsights(activitySummary, profile?.weeklyBudgetKg ?? 150);
    }
  }, [pageLoading, fetchInsights, activitySummary, profile?.weeklyBudgetKg]);

  /** Category breakdown for the summary pills. */
  const categoryEntries = Object.entries(activitySummary) as [ActivityCategory, number][];
  const totalWeeklyEmissions = categoryEntries.reduce((sum, [, kg]) => sum + kg, 0);
  const weeklyBudget = profile?.weeklyBudgetKg ?? 150;
  const kgSavedThisWeek = Math.max(0, weeklyBudget - totalWeeklyEmissions);

  if (pageLoading) {
    return <InsightsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-3xl font-display font-bold text-forest-900">AI Climate Insights</h1>
        <p className="text-sm text-slateBlue-500 mt-1">
          Personalized reduction paths built from your logged behaviors.
        </p>
      </div>

      {/* ── Category breakdown pills ── */}
      <div className="flex flex-wrap gap-2">
        {categoryEntries.map(([cat, kg]) => (
          <div
            key={cat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-border bg-white text-xs font-semibold text-slateBlue-800"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}: {kg.toFixed(1)} kg
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Impact Cinema ── */}
        <section aria-labelledby="cinema-title">
          <h2 id="cinema-title" className="sr-only">Impact Cinema</h2>
          <ImpactGlobe kgSaved={kgSavedThisWeek} />
        </section>

        {/* ── Streaming AI text ── */}
        <Card className="flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <span className="section-pill">🌿 AI Whisperer</span>
            <Button size="sm" variant="ghost" onClick={() => fetchInsights(activitySummary, profile?.weeklyBudgetKg ?? 150)} disabled={loading}>
              {loading ? '⏳ Thinking…' : '🔄 Refresh'}
            </Button>
          </div>

          <div className="flex-1 text-slateBlue-800 leading-relaxed text-sm overflow-y-auto scrollbar-hide">
            {loading && !streamedText && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <span className="text-4xl animate-spin-slow">🌱</span>
                <span className="text-slateBlue-500 text-xs">Analyzing AR6 emission mappings…</span>
              </div>
            )}
            {streamedText && (
              <div className="prose prose-sm max-w-none text-slateBlue-800 space-y-2">
                <ReactMarkdown>{streamedText}</ReactMarkdown>
                {loading && <span className="animate-pulse ml-0.5 text-forest-600 font-bold">▊</span>}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Offset Marketplace (informational) ── */}
      <OffsetMarketplace />
    </div>
  );
}
