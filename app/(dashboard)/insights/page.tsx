import React from 'react';
import type { Metadata } from 'next';
import { InsightsClient } from '../../../components/insights/InsightsClient';

export const metadata: Metadata = {
  title: 'AI Climate Insights - CarbonWise',
  description: 'Receive personalized carbon footprint analysis, emissions breakdown summary, and a tailored AI recommendations stream.',
};

/**
 * Insights server routing entrypoint.
 * Exports metadata for search engine optimization and accessibility,
 * rendering the interactive InsightsClient container.
 * 
 * @returns React element representing the insights route.
 */
export default function InsightsPage(): React.ReactElement {
  return <InsightsClient />;
}
