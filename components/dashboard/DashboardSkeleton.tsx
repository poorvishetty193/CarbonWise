import React from 'react';
import { Card } from '../ui/Card';

/**
 *  Dashboard Skeleton function.
 * @throws {never} This function does not throw.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 font-sans animate-fade-in" aria-busy="true">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-surface-border rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-surface-border rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-surface-border rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-white border border-surface-border rounded-3xl p-6 animate-pulse flex flex-col items-center justify-center space-y-4">
          <div className="w-48 h-48 rounded-full border-8 border-surface-border animate-pulse-slow" />
          <div className="h-4 w-32 bg-surface-border rounded-xl" />
        </div>
        <div className="h-80 bg-white border border-surface-border rounded-3xl p-6 animate-pulse flex flex-col justify-end space-y-3">
          <div className="flex items-end justify-between h-48 w-full px-4">
            {[30, 45, 60, 25, 80, 50, 40].map((h, i) => (
              <div key={i} className="w-8 bg-surface-border rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="h-4 w-full bg-surface-border rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col gap-2 p-6 animate-pulse">
            <div className="h-3 w-20 bg-surface-border rounded-lg" />
            <div className="h-8 w-24 bg-surface-border rounded-xl my-1" />
            <div className="h-2 w-full bg-surface-border rounded-lg" />
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-6 w-32 bg-surface-border rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white border border-surface-border rounded-2xl p-4 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-border rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-surface-border rounded-lg" />
                  <div className="h-3 w-20 bg-surface-border rounded-lg" />
                </div>
              </div>
              <div className="h-4 w-12 bg-surface-border rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
