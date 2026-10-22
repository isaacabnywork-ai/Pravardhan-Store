import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/service';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const isStaff = session.role !== 'CUSTOMER';

    const order = await orderService.getOrderById(id, session.userId, isStaff);
    return apiSuccess(order);
  } catch (error) {
    return apiError(error);
  }
}
