import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/service';
import { createOrderSchema } from '@/modules/orders/schemas';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid order checkout payload', parsed.error.format());
    }

    const order = await orderService.createOrder(session.userId, parsed.data);
    return apiSuccess(order, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const orders = await orderService.getCustomerOrders(session.userId);
    return apiSuccess(orders);
  } catch (error) {
    return apiError(error);
  }
}
