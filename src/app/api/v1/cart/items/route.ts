import { NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/service';
import { addToCartSchema, CART_SESSION_COOKIE } from '@/modules/cart/schemas';
import { getSessionFromRequest } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    let sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid add to cart payload', parsed.error.format());
    }

    if (parsed.data.sessionId) {
      sessionId = parsed.data.sessionId;
    }

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    await cartService.addItem(cart.id, parsed.data.variantId, parsed.data.quantity);
    const updated = await cartService.getCartDetails(cart.id);

    const response = apiSuccess(updated, 201);

    if (!session && !sessionId) {
      response.cookies.set({
        name: CART_SESSION_COOKIE,
        value: cart.sessionId || cart.id,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    return apiError(error);
  }
}
