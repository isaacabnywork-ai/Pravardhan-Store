import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, ['DELIVERY_STAFF', 'SUPER_ADMIN']);
    const { id } = await params;
    const result = await operationsService.confirmPickup(id, session.userId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
