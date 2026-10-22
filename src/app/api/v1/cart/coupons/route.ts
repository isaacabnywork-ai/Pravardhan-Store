import { NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/service';
import { applyCouponSchema, CART_SESSION_COOKIE } from '@/modules/cart/schemas';
import { getSessionFromRequest } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    let sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

    const body = await request.json();
    const parsed = applyCouponSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid coupon code payload', parsed.error.format());
    }

    if (parsed.data.sessionId) {
      sessionId = parsed.data.sessionId;
    }

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    const updated = await cartService.applyCoupon(cart.id, parsed.data.code, session?.userId);

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    const updated = await cartService.removeCoupon(cart.id);

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
