import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 *  Card function.
 * @param props - Component properties.
 * @param props.children - Semantic unit for children.
 * @param props.className - Semantic unit for className.
 * @param props.props - Semantic unit for props.
 * @returns Shape or unit of the return value.
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
