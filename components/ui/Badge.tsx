import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const styles = {
    success: 'bg-forest-100 text-forest-700 font-semibold',
    warning: 'bg-amberAlert-100 text-amberAlert-600 font-semibold',
    info: 'bg-slateBlue-50 text-slateBlue-800 font-medium',
    neutral: 'bg-surface-soft border border-surface-border text-slateBlue-500',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans ${styles[variant]}`}>
      {children}
    </span>
  );
}
