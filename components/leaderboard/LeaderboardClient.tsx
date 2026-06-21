'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { useLeaderboardRealtime } from '../../hooks/useLeaderboardRealtime';
import { useAuthSession } from '../../lib/auth-context';
import { format, startOfWeek } from 'date-fns';
import { Avatar } from './Avatar';
import { RippleChallenges } from './RippleChallenges';

/**
 * Returns the ISO week identifier string, e.g. "2024-W23".
 * @returns Week ID string for display in the leaderboard header.
 */
function getCurrentWeekId(): string {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(weekStart, "yyyy-'W'ww");
}

/**
 *  Leaderboard Client function.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function LeaderboardClient(): React.ReactElement {
  const { uid } = useAuthSession();
  const weekId = getCurrentWeekId();
  const { entries, isLoading: loading, error } = useLeaderboardRealtime(weekId);

  const rankMedal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-3xl font-display font-bold text-forest-900">Community Leaderboard</h1>
        <p className="text-sm text-slateBlue-500 mt-1">
          Weekly carbon reduction rankings — {weekId}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ── Rankings Table ── */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <h3 className="text-lg font-display font-bold text-forest-900 mb-4">Weekly Standings</h3>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3" aria-busy="true" aria-label="Loading leaderboard">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-surface-border rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="text-center py-10 space-y-2">
                <span className="text-3xl">⚠️</span>
                <p className="text-sm text-amberAlert-700 font-medium">{error}</p>
                <p className="text-xs text-slateBlue-500">
                  Make sure the Firestore index on <code>totalKgSaved (desc)</code> is created.
                </p>
              </div>
            )}

            {/* Empty state — shown only when there are genuinely no users yet */}
            {!loading && !error && entries.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <span className="text-4xl">🌱</span>
                <p className="text-sm text-slateBlue-600 font-semibold">No rankings yet.</p>
                <p className="text-xs text-slateBlue-400">
                  Start logging activities to be the first on the board!
                </p>
              </div>
            )}

            {/* Real user rows */}
            {!loading && !error && entries.length > 0 && (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const isSelf = entry.uid === uid;
                  const medal = rankMedal[entry.rank];
                  return (
                    <div
                      key={entry.uid}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                        isSelf
                          ? 'bg-forest-50 border-forest-200 shadow-sm'
                          : 'bg-white border-surface-border hover:shadow-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold bg-surface-soft text-slateBlue-700 shrink-0">
                          {medal ?? entry.rank}
                        </span>
                        <Avatar displayName={entry.displayName} photoURL={entry.photoURL} size={36} />
                        <div>
                          <span className={`text-sm font-semibold block leading-tight ${isSelf ? 'text-forest-800' : 'text-slateBlue-900'}`}>
                            {entry.displayName}
                            {isSelf && (
                              <span className="ml-2 text-[10px] text-forest-600 font-bold uppercase tracking-wider">(You)</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-forest-900">{entry.weeklyKgSaved.toFixed(1)}</span>
                        <span className="text-xs text-slateBlue-500 ml-1">kg saved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Ripple Challenges ── */}
        <RippleChallenges uid={uid ?? null} />
      </div>
    </div>
  );
}
