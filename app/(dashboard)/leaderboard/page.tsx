import React from 'react';
import type { Metadata } from 'next';
import { LeaderboardClient } from '../../../components/leaderboard/LeaderboardClient';

export const metadata: Metadata = {
  title: 'Community Leaderboard - CarbonWise',
  description: 'Track and compare carbon footprint saving statistics against your friends and community members. Join active environmental Ripple Challenges.',
};

/**
 * Leaderboard server routing entrypoint.
 * Exports metadata for search engine optimization and accessibility,
 * rendering the interactive LeaderboardClient container.
 * 
 * @returns React element representing the leaderboard route.
 */
export default function LeaderboardPage(): React.ReactElement {
  return <LeaderboardClient />;
}
