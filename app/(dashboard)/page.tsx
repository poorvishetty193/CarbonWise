import React from 'react';
import type { Metadata } from 'next';
import { DashboardHomeClient } from '../../components/dashboard/DashboardHomeClient';

export const metadata: Metadata = {
  title: 'Dashboard - CarbonWise',
  description: 'Check your daily and weekly carbon budget consumption, streaks, recent logs, and statistics.',
};

/**
 * DashboardHome server routing entrypoint.
 * Exports metadata for search engine optimization and accessibility,
 * rendering the interactive DashboardHomeClient container.
 * 
 * @returns React element representing the dashboard home route.
 */
export default function DashboardHome(): React.ReactElement {
  return <DashboardHomeClient />;
}
