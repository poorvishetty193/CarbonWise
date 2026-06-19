import { NextRequest, NextResponse } from 'next/server';
import { calculateEmissions } from '../../../lib/carbon-calculator';
import { ActivityCategory } from '../../../types';
import { isRateLimited } from '../../../lib/rate-limit';

/**
 * POST /api/carbon-score
 * Calculates carbon emissions for a given activity.
 * @param req - NextRequest containing { category, subcategory, amount }
 * @returns { emissions: number } or error
 * @throws 400 if parameters are missing or invalid
 * @throws 500 on calculation error
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (isRateLimited(`carbon-score:${ip}`, 10, 60000)) {
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
      !('category' in body) ||
      !('subcategory' in body) ||
      !('amount' in body)
    ) {
      return NextResponse.json({ error: 'Missing required parameters: category, subcategory, amount' }, { status: 400 });
    }

    const { category, subcategory, amount } = body as {
      category: unknown;
      subcategory: unknown;
      amount: unknown;
    };

    if (typeof category !== 'string' || typeof subcategory !== 'string' || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid parameter types' }, { status: 400 });
    }

    const emissions = calculateEmissions(category as ActivityCategory, subcategory, amount);
    return NextResponse.json({ emissions });
  } catch (error: unknown) {
    console.error('[carbon-score/route] Calculation failed:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
