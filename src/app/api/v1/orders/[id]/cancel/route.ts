import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/service';
import { cancelOrderSchema } from '@/modules/orders/schemas';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = cancelOrderSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('A cancellation reason is required', parsed.error.format());
    }

    const isStaff = session.role !== 'CUSTOMER';
    const cancelled = await orderService.cancelOrder(
      id,
      session.userId,
      parsed.data.reason,
      isStaff
    );

    return apiSuccess(cancelled);
  } catch (error) {
    return apiError(error);
  }
}
