import { z } from 'zod';
import { Role } from '@prisma/client';

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  role: z.nativeEnum(Role).refine((r) => r !== Role.CUSTOMER, 'Cannot assign Customer role to staff'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  storeId: z.string().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export const updateStoreSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  serviceArea: z.string().optional(),
  minOrderValue: z.number().int().min(0).optional(), // in paise
  deliveryFee: z.number().int().min(0).optional(),
  freeDeliveryThreshold: z.number().int().min(0).optional(),
  operatingHours: z.string().optional(),
  supportPhone: z.string().optional(),
  supportEmail: z.string().email().optional(),
});

export const assignRiderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  riderId: z.string().min(1, 'Rider ID is required'),
  notes: z.string().optional(),
});

export const verifyDeliverySchema = z.object({
  customerOtp: z.string().regex(/^\d{4}$/, 'Delivery OTP must be 4 digits'),
});

export const failDeliverySchema = z.object({
  reason: z.string().min(3, 'Failure reason is required'),
  notes: z.string().optional(),
});
