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

    const storeId = request.nextUrl.searchParams.get('storeId') || session.storeId || undefined;

    const result = await inventoryService.listInventory({
      storeId,
      lowStockOnly: true,
      pageSize: 100,
    });

    return apiSuccess(result.items, 200, result.pagination);
  } catch (error) {
    return apiError(error);
  }
}
