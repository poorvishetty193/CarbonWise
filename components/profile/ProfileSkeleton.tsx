import React from 'react';

/**
 *  Profile Skeleton function.
 * @throws {never} This function does not throw.
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse font-sans" aria-busy="true">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-border" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-surface-border rounded-lg" />
          <div className="h-4 w-44 bg-surface-border rounded-lg" />
        </div>
      </div>
      <div className="h-24 bg-surface-border rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-64 bg-white border border-surface-border rounded-2xl p-6" />
        <div className="h-64 bg-white border border-surface-border rounded-2xl p-6" />
      </div>
    </div>
  );
}
