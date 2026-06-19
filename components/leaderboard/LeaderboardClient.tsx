'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAuthSession } from '../../lib/auth-context';
import { format, startOfWeek } from 'date-fns';

/**
 * Returns the ISO week identifier string, e.g. "2024-W23".
 * @returns Week ID string for Firestore leaderboard collection path.
 */
function getCurrentWeekId(): string {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(weekStart, "yyyy-'W'ww");
}

/**
 * LeaderboardClient renders the client-side stateful Community Leaderboard.
 * Displays real-time weekly standings and the interactive Ripple Challenges.
 * 
 * @returns React element representing the community leaderboard view.
 */
export function LeaderboardClient(): React.ReactElement {
  const { uid } = useAuthSession();
  const weekId = getCurrentWeekId();
  const { entries, loading } = useLeaderboard(weekId);

  const [challengeCount, setChallengeCount] = useState(142);
  const [hasJoinedChallenge, setHasJoinedChallenge] = useState(false);

  /**
   * Joins the active Ripple Challenge and increments the participant count.
   */
  const handleJoinChallenge = (): void => {
    if (hasJoinedChallenge) return;
    setChallengeCount((c) => c + 1);
    setHasJoinedChallenge(true);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'challenge_joined', params: { uid, challengeId: 'meatless_monday' } }),
    }).catch((err: unknown) => console.error('[LeaderboardClient] Analytics error:', err));
  };

  /** Seed data shown while Firestore loads or when collection is empty. */
  const seedEntries = [
    { uid: 'u1', displayName: 'Deep Forest', weeklyKgSaved: 42.5, rank: 1 },
    { uid: 'u2', displayName: 'Eco Warrior', weeklyKgSaved: 38.2, rank: 2 },
    { uid: uid ?? 'you', displayName: 'You', weeklyKgSaved: 32.1, rank: 3 },
    { uid: 'u3', displayName: 'Green Traveler', weeklyKgSaved: 28.0, rank: 4 },
    { uid: 'u4', displayName: 'Solar Advocate', weeklyKgSaved: 21.4, rank: 5 },
  ];

  const displayList = entries.length > 0
    ? entries.map((e, i) => ({ ...e, rank: i + 1 }))
    : seedEntries;

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

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-surface-border rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!loading && (
              <div className="space-y-2">
                {displayList.map((entry) => {
                  const isSelf = entry.uid === uid;
                  const medal = rankMedal[entry.rank];
                  return (
                    <div
                      key={entry.uid}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                         isSelf
                           ? 'bg-forest-50 border-forest-200 shadow-sm'
                           : 'bg-white border-surface-border hover:border-surface-border hover:shadow-card'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold bg-surface-soft text-slateBlue-700">
                          {medal ?? entry.rank}
                        </span>
                        <div>
                          <span className={`text-sm font-semibold block ${isSelf ? 'text-forest-800' : 'text-slateBlue-900'}`}>
                            {entry.displayName}
                            {isSelf && <span className="ml-2 text-[10px] text-forest-600 font-bold uppercase tracking-wider">(You)</span>}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
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
        <div className="space-y-6">
          <h3 className="text-lg font-display font-bold text-forest-900">Ripple Challenges</h3>
          <Card className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="warning">Active</Badge>
                <h4 className="text-base font-bold text-slateBlue-900 mt-2 font-display">
                  Meatless Mondays
                </h4>
              </div>
              <span className="text-2xl">🥗</span>
            </div>

            <p className="text-xs text-slateBlue-500 leading-relaxed">
              Lower methane and transportation outputs by choosing plant-based meals every Monday.
              Each participant saves an estimated 2.4 kg CO2e per week.
            </p>

            <div className="border-t border-surface-border pt-4 space-y-1">
              <span className="text-xs text-slateBlue-500 block">Active participants</span>
              <span className="stat-value text-2xl">{challengeCount}</span>
            </div>

            <Button
              onClick={handleJoinChallenge}
              variant={hasJoinedChallenge ? 'secondary' : 'primary'}
              disabled={hasJoinedChallenge}
              className="w-full"
            >
              {hasJoinedChallenge ? '✓ Joined' : 'Join Ripple Challenge'}
            </Button>
          </Card>

          {/* Second challenge teaser */}
          <Card className="opacity-60 space-y-2">
            <Badge variant="neutral">Coming Soon</Badge>
            <h4 className="text-sm font-bold text-slateBlue-900 font-display">Zero-Car Week</h4>
            <p className="text-xs text-slateBlue-500">Use only public transit or cycling for 7 days.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
