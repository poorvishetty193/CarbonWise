import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — CarbonWise',
  description: 'Sign in to track your carbon footprint and join the CarbonWise community.',
};

/**
 * Auth layout wrapping login and register pages.
 * @param children - Page content to render
 * @returns Auth wrapper layout
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-slateBlue-900 flex flex-col">
      {/* Brand bar */}
      <header className="px-6 py-5 flex items-center space-x-2">
        <span className="text-2xl font-display font-bold text-white tracking-tight">CarbonWise</span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-700 text-forest-200">
          AR6 Sync
        </span>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-forest-400 text-xs font-sans">
        IPCC AR6-aligned emission factors · CarbonWise &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
