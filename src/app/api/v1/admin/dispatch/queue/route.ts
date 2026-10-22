import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, [
      'SUPER_ADMIN',
      'ORDER_MANAGER',
      'STORE_MANAGER',
    ]);

    const storeId = request.nextUrl.searchParams.get('storeId') || session.storeId || undefined;
    const queue = await operationsService.getDispatchQueue(storeId);

    return apiSuccess(queue);
  } catch (error) {
    return apiError(error);
  }
}
