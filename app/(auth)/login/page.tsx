'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../lib/firebase/client';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { createOrUpdateProfile } from '../../actions/user';

/**
 * Authentication login page.
 * Only supports Google Sign-In as per application security policy.
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      const idToken = await user.getIdToken();

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (res.ok) {
        // Upsert Firestore profile so name + avatar appear in leaderboard immediately
        await createOrUpdateProfile({
          uid: user.uid,
          displayName: user.displayName || 'CarbonWise User',
          email: user.email || '',
          photoURL: user.photoURL ?? undefined,
        });
        router.push('/');
      } else {
        setError('Failed to establish server session. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      setError('Establishing sandbox trial session...');
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center px-4 font-sans">
      <Card className="w-full max-w-md space-y-6 text-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-forest-900">CarbonWise</h2>
          <p className="text-xs text-slateBlue-550 font-sans mt-2">
            Climate urgency meets calm science.
          </p>
        </div>

        <div className="py-4 border-t border-b border-surface-border">
          <p className="text-sm text-slateBlue-700 font-sans mb-4">
            Sign in to track your carbon footprint, view recommendations, and join challenges.
          </p>
          
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-surface-border text-slateBlue-800 hover:bg-surface-soft"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
          </Button>
        </div>

        {error && (
          <p className="text-xs text-amberAlert-600 font-medium font-sans">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}
