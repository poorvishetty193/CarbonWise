'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ImpactGlobe = dynamic(
  () => import('../charts/ImpactGlobe').then((mod) => mod.ImpactGlobe),
  { ssr: false }
);

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useUserStreak } from '../../hooks/useUserStreak';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useAuthSession } from '../../lib/auth-context';
import { CATEGORY_COLORS } from '../../lib/constants';
import type { ActivityCategory } from '../../types';

/**
 * InsightsClient renders the client-side stateful AI Climate Insights view.
 * Streams personalized carbon reduction advice based on logged activities.
 * 
 * @returns React element representing the AI insights view.
 */
export function InsightsClient(): React.ReactElement {
  const { uid } = useAuthSession();
  const { profile, loading: streakLoading } = useUserStreak(uid ?? undefined);
  const { activities, loading: activityLoading } = useActivityLog(uid ?? undefined);

  const [streamedText, setStreamedText] = useState('');
  const [loading, setLoading] = useState(false);

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

  /**
   * Streams AI insights from /api/ai-insights.
   * @returns Promise resolving when stream is complete.
   */
  const fetchInsights = useCallback(async (): Promise<void> => {
    setLoading(true);
    setStreamedText('');

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activitySummary,
          weeklyBudgetKg: profile?.weeklyBudgetKg ?? 150,
        }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        setStreamedText((prev) => prev + decoder.decode(value));
      }
    } catch (error: unknown) {
      console.error('[InsightsClient] AI stream failed:', error);
      setStreamedText('Could not contact AI coach. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [activitySummary, profile?.weeklyBudgetKg]);

  useEffect(() => {
    if (!pageLoading) {
      fetchInsights();
    }
  }, [pageLoading, fetchInsights]);

  /** Category breakdown for the summary pills. */
  const categoryEntries = Object.entries(activitySummary) as [ActivityCategory, number][];

  if (pageLoading) {
    return (
      <div className="space-y-8 animate-fade-in font-sans" aria-busy="true">
        <div>
          <h1 className="text-3xl font-display font-bold text-forest-900">AI Climate Insights</h1>
          <p className="text-sm text-slateBlue-500 mt-1">
            Personalized reduction paths built from your logged behaviors.
          </p>
        </div>

        {/* Pills Skeleton */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-28 bg-surface-border rounded-full animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-white border border-surface-border rounded-3xl animate-pulse" />
          <div className="h-96 bg-white border border-surface-border rounded-3xl animate-pulse p-6 space-y-4">
            <div className="h-4 w-28 bg-surface-border rounded-lg" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-surface-border rounded-lg" />
              <div className="h-3 w-full bg-surface-border rounded-lg" />
              <div className="h-3 w-3/4 bg-surface-border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
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
          <ImpactGlobe kgSaved={profile?.totalKgSaved ?? 0} />
        </section>

        {/* ── Streaming AI text ── */}
        <Card className="flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <span className="section-pill">🌿 AI Whisperer</span>
            <Button size="sm" variant="ghost" onClick={fetchInsights} disabled={loading}>
              {loading ? '⏳ Thinking…' : '🔄 Refresh'}
            </Button>
          </div>

          <div className="flex-1 text-slateBlue-800 leading-relaxed text-sm whitespace-pre-line overflow-y-auto scrollbar-hide">
            {loading && !streamedText && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <span className="text-4xl animate-spin-slow">🌱</span>
                <span className="text-slateBlue-500 text-xs">Analyzing AR6 emission mappings…</span>
              </div>
            )}
            {streamedText && (
              <div className="prose prose-sm max-w-none">
                {streamedText}
                {loading && <span className="animate-pulse ml-0.5 text-forest-600">▊</span>}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Offset Marketplace (informational) ── */}
      <section aria-labelledby="offset-title" className="border-t border-surface-border pt-6">
        <h3 id="offset-title" className="text-lg font-display font-bold text-forest-900 mb-3">
          Carbon Offset Marketplace
        </h3>
        <p className="text-xs text-slateBlue-500 mb-4">
          Verified offset projects aligned with Gold Standard and Verra VCS frameworks.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Gold Standard', url: 'https://www.goldstandard.org/impact-quantification/carbon-offsets', emoji: '🥇' },
            { name: 'Verra VCS', url: 'https://verra.org/project/vcs-program/', emoji: '🌍' },
            { name: 'Cool Effect', url: 'https://www.cooleffect.org', emoji: '❄️' },
          ].map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border border-surface-border rounded-2xl hover:border-forest-200 hover:shadow-card-hover transition-all duration-200 text-sm font-semibold text-slateBlue-800"
            >
              <span className="text-xl">{project.emoji}</span>
              {project.name}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
