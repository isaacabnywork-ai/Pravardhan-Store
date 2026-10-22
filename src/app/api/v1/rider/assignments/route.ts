import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['DELIVERY_STAFF', 'SUPER_ADMIN']);
    const assignments = await operationsService.getRiderAssignments(session.userId);
    return apiSuccess(assignments);
  } catch (error) {
    return apiError(error);
  }
}
