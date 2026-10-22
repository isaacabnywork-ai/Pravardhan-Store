import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/service';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

const confirmPaymentSchema = z.object({
  gatewayPaymentId: z.string().min(1, 'Payment ID is required'),
  gatewayOrderId: z.string().optional(),
  gatewaySignature: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    const parsed = confirmPaymentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid payment confirmation payload', parsed.error.format());
    }

    const order = await orderService.confirmPayment(
      id,
      parsed.data,
      session.userId
    );

    return apiSuccess(order);
  } catch (error) {
    return apiError(error);
  }
}
