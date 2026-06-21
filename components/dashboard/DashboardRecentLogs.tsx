import React from 'react';
import Link from 'next/link';
import { ActivityCard } from '../activity/ActivityCard';
import { ROUTES } from '../../lib/constants';
import { ActivityLog } from '../../types';

interface DashboardRecentLogsProps {
  activities: ActivityLog[];
}

/**
 *  Dashboard Recent Logs function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function DashboardRecentLogs({ activities }: DashboardRecentLogsProps) {
  return (
    <section className="space-y-4" aria-labelledby="recent-title">
      <div className="flex items-center justify-between">
        <h3 id="recent-title" className="text-xl font-display font-bold text-forest-900">
          Recent Logs
        </h3>
        <Link
          href={ROUTES.LOG}
          className="text-sm font-semibold text-forest-600 hover:text-forest-750 transition-colors"
        >
          Log New Activity +'
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
            <p className="text-2xl mb-2">dYO</p>
            <p>No activities logged today.</p>
            <Link href={ROUTES.LOG} className="mt-2 inline-block text-forest-600 font-semibold hover:underline">
              Start tracking now +'
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
