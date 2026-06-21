import React from 'react';
import { BADGE_DEFINITIONS } from '../../lib/constants';

/**
 *  Profile Badges function.
 * @param props - Component properties.
 * @param props.badges - Semantic unit for badges.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function ProfileBadges({ badges }: { badges: string[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-display font-bold text-forest-900">My Badges</h3>
      <div className="space-y-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const earned = badges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                earned
                  ? 'bg-white border-forest-200 shadow-card'
                  : 'bg-surface-soft border-transparent opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl" role="img" aria-label={badge.title}>{badge.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-slateBlue-900">{badge.title}</h4>
                <p className="text-[11px] text-slateBlue-500 leading-snug">{badge.description}</p>
              </div>
              {earned && (
                <span className="ml-auto text-forest-600 text-xs font-bold" aria-label="earned">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
