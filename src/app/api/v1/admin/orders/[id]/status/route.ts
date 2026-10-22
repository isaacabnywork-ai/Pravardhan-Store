import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/service';
import { updateOrderStatusSchema } from '@/modules/orders/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, [
      'SUPER_ADMIN',
      'ORDER_MANAGER',
      'STORE_MANAGER',
      'DELIVERY_STAFF',
    ]);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid status update payload', parsed.error.format());
    }

    const updated = await orderService.updateOrderStatus(
      id,
      parsed.data.status,
      parsed.data.note,
      session.userId
    );

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
