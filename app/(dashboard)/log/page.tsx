import React from 'react';
import type { Metadata } from 'next';
import { LogActivityClient } from '../../../components/activity/LogActivityClient';

export const metadata: Metadata = {
  title: 'Carbon Logger - CarbonWise',
  description: 'Record your daily transport, food, energy, and shopping activities, and view your logged carbon footprint history in real time.',
};

/**
 * LogActivity server routing entrypoint.
 * Exports metadata for search engine optimization and accessibility,
 * rendering the interactive LogActivityClient container.
 * 
 * @returns React element representing the log activities route.
 */
export default function LogActivityPage(): React.ReactElement {
  return <LogActivityClient />;
}
