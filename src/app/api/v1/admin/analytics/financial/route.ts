import { NextRequest } from 'next/server';
import { financialAnalyticsService } from '@/modules/analytics/financial-analytics-service';
import { analyticsQuerySchema } from '@/modules/analytics/analytics-validation';
import { requireRole, validateStoreScope } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN']);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = analyticsQuerySchema.parse(searchParams);

    if (query.storeId) {
      validateStoreScope(session, query.storeId);
    }

    const report = await financialAnalyticsService.getPaymentReconciliation(query);
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}
