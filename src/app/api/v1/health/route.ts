import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();
    let dbStatus = 'disconnected';
    let dbLatencyMs: number | null = null;

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'unreachable';
    }

    return apiSuccess({
      status: 'operational',
      environment: process.env.NODE_ENV,
      version: 'v1',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      responseTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    return apiError(error);
  }
}
