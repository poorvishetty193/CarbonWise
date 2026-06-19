'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../lib/firebase/client';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { createOrUpdateProfile } from '../../actions/user';
import Link from 'next/link';

/**
 * Email/password registration page.
 * Creates a Firebase Auth user, establishes a session cookie, then
 * creates a Firestore user profile document.
 */
export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles the registration form submission.
   * @param e - The form submit event.
   */
  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // 2. Update Firebase display name
      await updateProfile(user, { displayName });

      // 3. Get ID token and create server-side session cookie
      const idToken = await user.getIdToken();
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!loginRes.ok) {
        throw new Error('Failed to establish session. Please try signing in.');
      }

      // 4. Create Firestore profile document
      await createOrUpdateProfile({
        uid: user.uid,
        displayName,
        email: user.email ?? email,
      });

      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center px-4 font-sans">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-forest-900">CarbonWise</h1>
          <p className="text-xs text-slateBlue-500 font-sans mt-2">
            Join the environmental movement.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <Input
            id="register-name"
            label="Your Name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Jane Doe"
            autoComplete="name"
          />
          <Input
            id="register-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="eco@example.com"
            autoComplete="email"
          />
          <Input
            id="register-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 6 characters"
            autoComplete="new-password"
            error={error}
          />

          <Button id="register-submit" type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-xs text-center text-slateBlue-500 font-sans">
          Already have an account?{' '}
          <Link href="/login" className="text-forest-600 hover:text-forest-750 font-semibold">
            Sign in here &rarr;
          </Link>
        </p>
      </Card>
    </div>
  );
}
