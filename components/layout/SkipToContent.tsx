import React from 'react';

/**
 * SkipToContent accessibility helper element for keyboard screen readers.
 * 
 * @returns Clickable skip-link element.
 * @throws {never} This component does not throw.
 */
export function SkipToContent(): React.ReactElement {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amberAlert-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-amberAlert-500"
    >
      Skip to content
    </a>
  );
}
