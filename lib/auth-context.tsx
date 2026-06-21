'use client';

import React, { createContext, useContext } from 'react';

/**
 * Shape of the authenticated session context available to all dashboard pages.
 */
export interface AuthSessionContext {
  /** Firebase UID of the currently authenticated user. Null when loading or unauthenticated. */
  uid: string | null;
  /** Display name from Firebase Auth token. */
  displayName: string | null;
  /** Email from Firebase Auth token. */
  email: string | null;
  /** Photo URL from Firebase Auth token. */
  photoURL: string | null;
}

const AuthContext = createContext<AuthSessionContext>({
  uid: null,
  displayName: null,
  email: null,
  photoURL: null,
});

interface AuthProviderProps {
  value: AuthSessionContext;
  children: React.ReactNode;
}

/**
 * Provides the server-decoded Firebase session to the client component tree.
 * @param props.value - Decoded session data passed from the Server Component layout.
 * @param props.children - Child components.
 * @returns Context provider wrapper.
 * @param props - Component properties.
 * @throws {never} This function does not throw.
 */
export function AuthProvider({ value, children }: AuthProviderProps): React.ReactElement {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns the authenticated session context.
 * Must be used inside a component wrapped by <AuthProvider>.
 * @returns AuthSessionContext with uid, displayName, email, photoURL.
 * @throws {never} This function does not throw.
 */
export function useAuthSession(): AuthSessionContext {
  return useContext(AuthContext);
}
