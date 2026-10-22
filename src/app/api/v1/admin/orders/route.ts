import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/service';
import { adminOrderQuerySchema } from '@/modules/orders/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, [
      'SUPER_ADMIN',
      'ORDER_MANAGER',
      'STORE_MANAGER',
    ]);

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = adminOrderQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      throw new ValidationError('Invalid query parameters', parsed.error.format());
    }

    const storeId = parsed.data.storeId || session.storeId || undefined;

    const result = await orderService.listAdminOrders({
      ...parsed.data,
      storeId,
    });

    return apiSuccess(result.orders, 200, result.pagination);
  } catch (error) {
    return apiError(error);
  }
}
