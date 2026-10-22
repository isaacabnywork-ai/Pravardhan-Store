import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
  deliveryTip: z.number().int().min(0).default(0), // in paise
  deliverySlot: z.string().default('Instant (10-15 mins)'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'A cancellation reason is required'),
});

export const adminOrderQuerySchema = z.object({
  storeId: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
