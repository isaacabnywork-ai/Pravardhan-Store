import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const checkoutOrderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'WALLET']).default('COD'),
  deliveryTip: z.number().int().min(0, 'Tip cannot be negative').default(0), // in paise
  deliverySlot: z.string().trim().default('Instant (10-15 mins)'),
  notes: z.string().trim().max(500, 'Special instructions cannot exceed 500 characters').optional(),
});

export const createOrderSchema = checkoutOrderSchema;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
  note: z.string().trim().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters').max(500),
});

export const orderQuerySchema = paginationQuerySchema.extend({
  storeId: z.string().optional(),
  status: z.enum([
    'PENDING_PAYMENT',
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]).optional(),
  search: z.string().trim().optional(),
});

export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
