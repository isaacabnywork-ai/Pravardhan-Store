import { NextRequest } from 'next/server';
import { smsService } from '@/lib/services/sms';
import { apiSuccess, apiError } from '@/lib/api-response';
import { UnauthorizedError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * Production-compatible secure outbox recovery endpoint.
 * Suitable for Vercel Cron or external scheduler invocation.
 * Authenticates via standard Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET;

    // Fast Fail-Closed Guard: In production, require CRON_SECRET and reject unauthenticated requests
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction || cronSecret) {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        throw new UnauthorizedError('Unauthorized cron execution request');
      }
    }

    const workerId = `cron-worker-${Date.now()}`;
    const processed = await smsService.recoverPendingJobs(workerId, 25);

    return apiSuccess({
      workerId,
      processedJobs: processed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

