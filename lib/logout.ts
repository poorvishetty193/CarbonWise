'use client';
import { toErrorMessage } from './errors';

import { signOut } from 'firebase/auth';
import { auth } from './firebase/client';

/**
 * Performs a full client-side logout:
 * 1. Clears the server-side session cookie via POST /api/logout
 * 2. Signs out of Firebase Auth client-side
 * 3. Redirects to /login
 *
 * Safe to call from any client component or hook.
 * @throws {never} This function does not throw.
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (err) {
    console.error('[logout] Failed to clear session cookie:', toErrorMessage(err));
  }
  try {
    await signOut(auth);
  } catch (err) {
    console.error('[logout] Firebase signOut failed:', toErrorMessage(err));
  }
  // Hard redirect so the middleware picks up the cleared cookie immediately
  window.location.href = '/login';
}
