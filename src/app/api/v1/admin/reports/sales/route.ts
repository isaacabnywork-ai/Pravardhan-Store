import { NextRequest } from 'next/server';
import { analyticsService } from '@/modules/analytics/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN', 'ORDER_MANAGER']);
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const storeId = searchParams.get('storeId') || undefined;

    const report = await analyticsService.getSalesReport(storeId, days);
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}
