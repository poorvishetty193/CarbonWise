import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '../../../lib/rate-limit';

/** Cookie name must match next-firebase-auth-edge middleware cookieName. */
const COOKIE_NAME = 'AuthToken';

/**
 * POST /api/logout
 * Clears the session cookie to sign the user out server-side.
 * @returns 200 with success message
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (isRateLimited(`logout:${ip}`, 10, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }
  const response = NextResponse.json({ status: 'ok' });
  response.cookies.set(COOKIE_NAME, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
  });
  return response;
}
