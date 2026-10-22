import { NextRequest } from 'next/server';
import { analyticsService } from '@/modules/analytics/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN', 'ORDER_MANAGER']);
    const report = await analyticsService.getRiderPerformanceReport();
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}
