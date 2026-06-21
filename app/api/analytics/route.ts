import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '../../../lib/rate-limit';
import { toErrorMessage } from '@/lib/errors';

/**
 * POST /api/analytics
 * Records a client-side analytics event. In production, integrate with
 * Firebase Analytics server-side or a GA4 Measurement Protocol call.
 * @param req - NextRequest containing { event: string, params: Record<string, unknown> }
 * @returns 200 on success, 400 on missing event, 500 on error
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (isRateLimited(`analytics:${ip}`, 10, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }
  try {
    const body: unknown = await req.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('event' in body) ||
      typeof (body as Record<string, unknown>).event !== 'string'
    ) {
      return NextResponse.json({ error: 'Missing or invalid event parameter' }, { status: 400 });
    }

    const { event, params } = body as { event: string; params?: Record<string, unknown> };

    // TODO: replace with GA4 Measurement Protocol or Firestore event log
    // Only console.error is allowed per code rules — this is a silent no-op in prod.
    void event;
    void params;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[analytics/route] Failed to parse analytics event:', toErrorMessage(error));
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
