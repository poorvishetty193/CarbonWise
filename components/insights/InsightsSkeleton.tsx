import React from 'react';

/**
 *  Insights Skeleton function.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function InsightsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in font-sans" aria-busy="true">
      <div>
        <h1 className="text-3xl font-display font-bold text-forest-900">AI Climate Insights</h1>
        <p className="text-sm text-slateBlue-500 mt-1">
          Personalized reduction paths built from your logged behaviors.
        </p>
      </div>

      {/* Pills Skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-28 bg-surface-border rounded-full animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 bg-white border border-surface-border rounded-3xl animate-pulse" />
        <div className="h-96 bg-white border border-surface-border rounded-3xl animate-pulse p-6 space-y-4">
          <div className="h-4 w-28 bg-surface-border rounded-lg" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-surface-border rounded-lg" />
            <div className="h-3 w-full bg-surface-border rounded-lg" />
            <div className="h-3 w-3/4 bg-surface-border rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
