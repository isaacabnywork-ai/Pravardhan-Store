import { NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/service';
import { CART_SESSION_COOKIE } from '@/modules/cart/schemas';
import { getSessionFromRequest } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    const details = await cartService.getCartDetails(cart.id);

    const response = apiSuccess(details);

    // If new guest cart, set session cookie
    if (!session && !sessionId) {
      response.cookies.set({
        name: CART_SESSION_COOKIE,
        value: cart.sessionId || cart.id,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    const result = await cartService.clearCart(cart.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
