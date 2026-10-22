import { NextRequest } from 'next/server';
import { inventoryService } from '@/modules/inventory/service';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, [
      'SUPER_ADMIN',
      'PRODUCT_MANAGER',
      'STORE_MANAGER',
    ]);

    const { searchParams } = request.nextUrl;
    const storeId = searchParams.get('storeId') || session.storeId || undefined;
    const variantId = searchParams.get('variantId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const movements = await inventoryService.listMovements({
      storeId,
      variantId,
      limit,
    });

    return apiSuccess(movements);
  } catch (error) {
    return apiError(error);
  }
}
