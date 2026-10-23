import { z } from 'zod';
import { quantitySchema } from './common';

export const CART_SESSION_COOKIE = 'pravdhan_cart_session';

export const addToCartSchema = z.object({
  variantId: z.string().min(1, 'variantId cannot be empty'),
  quantity: quantitySchema.default(1),
  sessionId: z.string().optional(),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .max(50, 'Maximum item quantity is 50'),
});

export const updateCartItemSchema = updateCartItemQuantitySchema;

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Coupon code must be at least 2 characters')
    .max(30, 'Coupon code cannot exceed 30 characters')
    .toUpperCase(),
  sessionId: z.string().optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
