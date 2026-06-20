import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../lib/firebase/admin';
import { isRateLimited } from '../../../lib/rate-limit';

/** Cookie name must match next-firebase-auth-edge middleware cookieName. */
const COOKIE_NAME = 'AuthToken';

/**
 * POST /api/login
 * Verifies a Firebase ID token and sets a secure HttpOnly session cookie.
 * @param req - NextRequest with Authorization: Bearer <idToken> header
 * @returns 200 on success, 401 on invalid token, 500 on internal error
 * @throws 401 if Authorization header is missing or token is invalid
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (isRateLimited(`login:${ip}`, 10, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  const idToken = authHeader.slice(7);

  try {
    /** 5 days in ms — matches cookieSerializeOptions.maxAge in middleware.ts */
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'ok' });
    response.cookies.set(COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error: unknown) {
    console.error('[login/route] Session cookie creation failed:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
