'use client';

import React from 'react';
import { ActivityForm } from './ActivityForm';
import { ActivityCard } from './ActivityCard';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useAuthSession } from '../../lib/auth-context';
import { logActivity, deleteActivity } from '../../app/actions/activity';

/**
 * LogActivityClient renders the client-side stateful carbon activity logging view.
 * Displays logging options and lists historical logs fetched in real-time.
 * 
 * @returns React element representing the log activities dashboard module.
 */
export function LogActivityClient(): React.ReactElement {
  const { uid } = useAuthSession();
  const { activities, loading } = useActivityLog(uid ?? undefined);

  /**
   * Deletes an activity after user confirmation.
   * @param id - Firestore document ID of the activity to delete.
   * @returns Promise resolving when deletion completes.
   */
  const handleDelete = async (id: string): Promise<void> => {
    if (!uid) return;
    if (!confirm('Remove this logged activity?')) return;
    try {
      await deleteActivity(id, uid);
    } catch (err: unknown) {
      console.error('[LogActivityClient] Delete failed:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-forest-900">Carbon Logger</h1>
        <p className="text-sm text-slateBlue-500 mt-1">
          Record your daily routines and track your carbon output in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          {uid ? (
            <ActivityForm
              uid={uid}
              logActivityAction={logActivity}
            />
          ) : (
            <div className="bg-amberAlert-50 border border-amberAlert-200 rounded-2xl p-6 text-amberAlert-700 text-sm font-semibold">
              ⚠️ Sign in to start logging activities.
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold text-forest-900">Log History</h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-hide">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-surface-border rounded-2xl animate-pulse" />
                ))}
              </div>
            )}
            {!loading && activities.map((act) => (
              <div key={act.id} className="animate-slide-up">
                <ActivityCard activity={act} onDelete={handleDelete} />
              </div>
            ))}
            {!loading && activities.length === 0 && (
              <p className="text-sm text-slateBlue-500 italic text-center py-8">
                No activity logs yet. Use the form to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
