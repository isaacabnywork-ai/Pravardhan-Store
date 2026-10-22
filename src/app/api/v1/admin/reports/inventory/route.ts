import { NextRequest } from 'next/server';
import { analyticsService } from '@/modules/analytics/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN', 'STORE_MANAGER', 'PRODUCT_MANAGER']);
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId') || undefined;

    const report = await analyticsService.getInventoryReport(storeId);
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}
