import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 *  Input constant.
 * @returns The shape or unit of this constant object.
 * @throws {never} This constant does not throw.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slateBlue-800 font-sans uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-surface-soft border border-surface-border rounded-xl text-slateBlue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all duration-200 ${
            error ? 'border-amberAlert-600 focus:ring-amberAlert-500' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-amberAlert-600 font-medium font-sans">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
