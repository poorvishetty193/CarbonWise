import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 *  Card function.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-surface-border rounded-2xl p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
