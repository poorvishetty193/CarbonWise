'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { SkipToContent } from './SkipToContent';
import { useAuthSession } from '../../lib/auth-context';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useStreamingInsights } from '../../hooks/useStreamingInsights';
import { DesktopSidebar } from './DesktopSidebar';
import { AiWhispererDrawer } from './AiWhispererDrawer';
import { TopHeader } from './TopHeader';

interface ShellProps {
  children: React.ReactNode;
}

/**
 * Shell component that wraps the entire dashboard UI structure.
 * Includes a sidebar, header, collapsible AI Whisperer drawer, and mobile navigation support.
 * 
 * @param props - Component properties.
 * @param props.children - Layout children.
 * @returns Shell layout element wrapping children.
 * @throws {never} This component does not throw.
 */
export function Shell({ children }: ShellProps): React.ReactElement {
  const { uid, displayName } = useAuthSession();
  const [isWhispererOpen, setIsWhispererOpen] = useState(false);
  
  const { text: aiResponse, isStreaming: aiLoading, trigger: handleAskWhisperer } = useStreamingInsights(uid ?? '');

  // Auto-logout after 10 minutes of inactivity
  useIdleTimeout(10 * 60 * 1000, !!uid);

  const toggleWhisperer = () => {
    setIsWhispererOpen(!isWhispererOpen);
    if (!isWhispererOpen && !aiResponse) {
      handleAskWhisperer(
        { transport: 120, food: 15, energy: 45, shopping: 22 },
        150
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft text-slateBlue-900 font-sans flex flex-col">
      <SkipToContent />

      <TopHeader onToggleWhisperer={toggleWhisperer} />

      {/* Sidebar & Main Area wrapper */}
      <div className="flex flex-1 relative">
        <DesktopSidebar displayName={displayName} />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-4 md:p-8 pb-24 md:pb-8 focus:outline-none">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>

        <AiWhispererDrawer
          isOpen={isWhispererOpen}
          onClose={() => setIsWhispererOpen(false)}
          aiLoading={aiLoading}
          aiResponse={aiResponse}
        />
      </div>

      <MobileNav />
    </div>
  );
}
