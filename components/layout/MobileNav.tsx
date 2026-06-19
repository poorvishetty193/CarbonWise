'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, BarChart3, Trophy, User } from 'lucide-react';

/**
 * MobileNav layout component displaying the bottom navigation bar on mobile screens.
 * 
 * @returns Bottom tab navigation layout element.
 * @throws {never} This component does not throw.
 */
export function MobileNav(): React.ReactElement {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/log', label: 'Log', icon: PlusSquare },
    { href: '/insights', label: 'Insights', icon: BarChart3 },
    { href: '/leaderboard', label: 'Ranks', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-border md:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-forest-600 font-semibold' 
                  : 'text-slateBlue-500 hover:text-slateBlue-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
