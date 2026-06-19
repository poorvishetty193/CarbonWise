'use client';

import { useEffect, useRef, useCallback } from 'react';
import { logout } from '../lib/logout';

/** Activity events that reset the idle timer. */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

/**
 * Hook that automatically logs the user out after a period of inactivity.
 *
 * @param timeoutMs - Idle duration in milliseconds before auto-logout (default 10 min).
 * @param enabled   - Set to false to disable the timer (e.g. when user is not logged in).
 */
export function useIdleTimeout(
  timeoutMs: number = 10 * 60 * 1000, // 10 minutes
  enabled: boolean = true
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    // Auto-logout when idle for timeoutMs
    timerRef.current = setTimeout(() => {
      void logout();
    }, timeoutMs);
  }, [clearTimers, timeoutMs]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Start the timer immediately
    resetTimer();

    // Reset on any user activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, resetTimer, clearTimers]);
}
