import { NextRequest } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { isRateLimited } from '../../../lib/rate-limit';

export const runtime = 'edge';

/**
 * POST handler for `/api/ai-insights`.
 * Evaluates the user's logged activity carbon footprint totals against their budget,
 * and streams personalized recommendations via Anthropic Claude.
 * Falls back to mock insights if ANTHROPIC_API_KEY is not defined.
 * 
 * @param req - The NextRequest containing the JSON body with `activitySummary` and `weeklyBudgetKg`.
 * @returns Response with text event-stream on success, or error JSON payload on failure.
 * @throws {never} This endpoint captures all exceptions and returns 500 status payload.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (isRateLimited(`ai-insights:${ip}`, 10, 60000)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    });
  }

  try {
    const { activitySummary, weeklyBudgetKg } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const encoder = new TextEncoder();
      const mockInsights = [
        "### Weekly Carbon Diagnostics\n\n",
        "Your highest footprint was in the **Transport** category.\n\n",
        "### Actionable 3-Step Reduction Plan:\n",
        "1. **Public Rail Shift**: Commuting via rail instead of gasoline cars will cut carbon output by up to 80% per trip.\n",
        "2. **Alternative Food Choices**: Opting for vegetarian options on Wednesdays lowers kitchen emissions by roughly 12kg CO2e.\n",
        "3. **Solar/Utility Optimization**: Charging EVs during daylight hours aligns charging patterns with clean grid peaks."
      ];

      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of mockInsights) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const anthropic = new Anthropic({ apiKey });
    const responseStream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      stream: true,
      system: `You are CarbonWise AI, an expert climate footprint coach. Analyze the user's activities and weekly carbon budget.
- Deliver personalized, actionable suggestions.
- Do not sound preachy, guilt-inducing, or overly academic.
- Focus on practical trade-offs.
- Structure responses cleanly using Markdown lists and headers.`,
      messages: [
        {
          role: 'user',
          content: `My carbon budget: ${weeklyBudgetKg} kg/week. Here is my activity breakdown: ${JSON.stringify(activitySummary)}. Give me my carbon scoring analysis and a 3-step reduction plan.`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
