import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RippleChallengesProps {
  uid: string | null;
}

/**
 *  Ripple Challenges function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function RippleChallenges({ uid }: RippleChallengesProps) {
  const [challengeCount, setChallengeCount] = useState(142);
  const [hasJoinedChallenge, setHasJoinedChallenge] = useState(false);

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

  return (
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
          <span className="text-2xl">🌱</span>
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

      <Card className="opacity-60 space-y-2">
        <Badge variant="neutral">Coming Soon</Badge>
        <h4 className="text-sm font-bold text-slateBlue-900 font-display">Zero-Car Week</h4>
        <p className="text-xs text-slateBlue-500">Use only public transit or cycling for 7 days.</p>
      </Card>
    </div>
  );
}
