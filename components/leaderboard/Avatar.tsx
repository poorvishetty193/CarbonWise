import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  displayName: string;
  photoURL?: string;
  size?: number;
}

/**
 *  Avatar function.
 * @param props - Component properties.
 * @param props.displayName - Semantic unit for displayName.
 * @param props.photoURL - Semantic unit for photoURL.
 * @param props.size - Semantic unit for size.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function Avatar({ displayName, photoURL, size = 36 }: AvatarProps) {
  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt={displayName}
        width={size}
        height={size}
        className="rounded-full object-cover border border-surface-border"
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center bg-forest-100 text-forest-700 font-bold text-sm border border-surface-border"
      style={{ width: size, height: size }}
      aria-label={displayName}
    >
      {(displayName || '?')[0].toUpperCase()}
    </div>
  );
}
