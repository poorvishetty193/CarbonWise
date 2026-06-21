import React from 'react';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { Shell } from '../../components/layout/Shell';
import { AuthProvider } from '../../lib/auth-context';
import { PageTransition } from '../../components/layout/PageTransition';

import type { AuthSessionContext } from '../../lib/auth-context';
import { toErrorMessage } from '@/lib/errors';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

/**
 * Server Component layout for all dashboard routes.
 * Decodes the Firebase session cookie and injects the UID into the
 * client-side AuthProvider so child pages never hardcode a uid.
 * 
 * @param props - Component properties.
 * @param props.children - Dashboard page content.
 * @returns Layout with auth context, Shell wrapper, and PageTransition wrapper.
 * @throws {never} This component handles all exceptions internally.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  /** Attempt to decode server-side session. Falls back to null on missing/expired cookie. */
  let session: AuthSessionContext = {
    uid: null,
    displayName: null,
    email: null,
    photoURL: null,
  };

  try {
    const tokens = await getTokens(cookies(), {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
      cookieName: 'AuthToken',
      cookieSignatureKeys: [
        process.env.COOKIE_SECRET_KEY_CURRENT ?? 'dev-secret-current',
        process.env.COOKIE_SECRET_KEY_PREVIOUS ?? 'dev-secret-previous',
      ],
      serviceAccount: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
    });

    if (tokens) {
      const { decodedToken } = tokens;
      session = {
        uid:         decodedToken.uid,
        displayName: typeof decodedToken.name === 'string' ? decodedToken.name : null,
        email:       typeof decodedToken.email === 'string' ? decodedToken.email : null,
        photoURL:    typeof decodedToken.picture === 'string' ? decodedToken.picture : null,
      };
    }
  } catch (error: unknown) {
    console.error('[DashboardLayout] Failed to decode session token:', toErrorMessage(error));
  }

  return (
    <AuthProvider value={session}>
      <Shell>
        <PageTransition>{children}</PageTransition>
      </Shell>
    </AuthProvider>
  );
}
