import { NextRequest } from 'next/server';
import { diagnosticsService } from '@/modules/operations/diagnostics-service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Only Super Admin can inspect infrastructure provider readiness
    await requireRole(request, ['SUPER_ADMIN']);
    const report = await diagnosticsService.getReadinessReport();
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}
