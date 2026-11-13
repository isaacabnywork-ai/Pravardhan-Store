import { NextRequest } from 'next/server';
import { dashboardService } from '@/modules/analytics/dashboard-service';
import { analyticsQuerySchema } from '@/modules/analytics/analytics-validation';
import { requireRole, validateStoreScope } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'STORE_MANAGER', 'ORDER_MANAGER']);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = analyticsQuerySchema.parse(searchParams);

    if (query.storeId) {
      validateStoreScope(session, query.storeId);
    } else if (session.storeId) {
      query.storeId = session.storeId;
    }

    const report = await dashboardService.getExecutiveDashboard(query);
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}
