import { NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/service';
import { updateCartItemSchema, CART_SESSION_COOKIE } from '@/lib/validation';
import { getSessionFromRequest } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    const sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;
    const { id: itemId } = await params;

    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    await cartService.updateItemQuantity(cart.id, itemId, parsed.data.quantity);
    const updated = await cartService.getCartDetails(cart.id);

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    const sessionId = request.cookies.get(CART_SESSION_COOKIE)?.value;
    const { id: itemId } = await params;

    const cart = await cartService.getOrCreateCart(session?.userId, sessionId);
    await cartService.removeItem(cart.id, itemId);
    const updated = await cartService.getCartDetails(cart.id);

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
