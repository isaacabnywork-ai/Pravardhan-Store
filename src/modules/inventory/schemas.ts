import { z } from 'zod';
import { InventoryChangeType } from '@prisma/client';

export const stockAdjustmentSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  storeId: z.string().optional(),
  changeType: z.nativeEnum(InventoryChangeType).default(InventoryChangeType.STOCK_ADJUSTMENT),
  quantityChange: z.number().int().refine((val) => val !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(3, 'A clear reason for stock adjustment is required'),
});

export const serviceabilityQuerySchema = z.object({
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code'),
});
