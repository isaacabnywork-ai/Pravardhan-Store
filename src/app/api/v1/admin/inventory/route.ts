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
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10);

    const result = await inventoryService.listInventory({
      storeId,
      search,
      page,
      pageSize,
    });

    return apiSuccess(result.items, 200, result.pagination);
  } catch (error) {
    return apiError(error);
  }
}
