'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition component that uses Framer Motion's AnimatePresence
 * and motion.div to provide smooth exit and entry animations on route changes.
 * 
 * @param props - Component properties.
 * @param props.children - Route/page child elements.
 * @returns Animated container element.
 * @throws {never} This component does not throw errors.
 */
export function PageTransition({ children }: PageTransitionProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
