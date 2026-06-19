import { authMiddleware, redirectToLogin, redirectToHome } from 'next-firebase-auth-edge';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route protection middleware using next-firebase-auth-edge cookies.
 * @param request The incoming NextRequest.
 * @returns NextResponse or native Response.
 */
export async function middleware(request: NextRequest): Promise<NextResponse | Response> {
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    cookieName: 'AuthToken',
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_KEY_CURRENT || 'secret-key-current-fallback-value-for-dev',
      process.env.COOKIE_SECRET_KEY_PREVIOUS || 'secret-key-previous-fallback-value-for-dev',
    ],
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 24, // 12 days
    },
    handleValidToken: async () => {
      if (['/login', '/register'].includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }
      return NextResponse.next();
    },
    handleInvalidToken: async () => {
      if (!['/login', '/register'].includes(request.nextUrl.pathname)) {
        return redirectToLogin(request);
      }
      return NextResponse.next();
    },
    handleError: async (error: unknown) => {
      console.error('Authentication check failed in middleware:', error);
      return redirectToLogin(request);
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/log',
    '/insights',
    '/leaderboard',
    '/profile',
    '/login',
    '/register',
    '/api/login',
    '/api/logout',
  ],
};
