import { z } from 'zod';

export const CART_SESSION_COOKIE = 'pravdhan_cart_session';

export const addToCartSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().min(1).default(1),
  sessionId: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
});

export const applyCouponSchema = z.object({
  code: z.string().min(2, 'Coupon code is required').transform((v) => v.toUpperCase().trim()),
  sessionId: z.string().optional(),
});
