import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, BarChart3, Trophy, User, X } from 'lucide-react';
import { logout } from '../../lib/logout';

interface DesktopSidebarProps {
  displayName?: string | null;
}

/**
 *  Desktop Sidebar function.
 * @param props - Component properties.
 * @param props.displayName - Semantic unit for displayName.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function DesktopSidebar({ displayName }: DesktopSidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/log', label: 'Log Activity', icon: PlusSquare },
    { href: '/insights', label: 'AI Insights', icon: BarChart3 },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-surface-border p-4">
      <nav className="space-y-1 flex-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-forest-55 text-forest-700 font-semibold border-l-4 border-forest-600 bg-forest-50'
                  : 'text-slateBlue-500 hover:bg-surface-soft hover:text-slateBlue-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-surface-border space-y-3">
        {displayName && (
          <div className="px-4 py-2">
            <p className="text-xs text-slateBlue-400 font-sans">Signed in as</p>
            <p className="text-sm font-semibold text-slateBlue-800 truncate">{displayName}</p>
          </div>
        )}
        <button
          id="sidebar-logout-btn"
          onClick={() => void logout()}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          aria-label="Log out"
        >
          <X className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
