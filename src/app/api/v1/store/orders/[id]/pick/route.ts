import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, [
      'SUPER_ADMIN',
      'STORE_MANAGER',
      'ORDER_MANAGER',
    ]);
    const { id } = await params;

    const updated = await operationsService.markOrderPreparing(id, session.userId);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
