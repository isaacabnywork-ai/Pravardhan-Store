import { z } from 'zod';
import { phoneSchema, otpSchema } from './common';

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const staffLoginSchema = z.object({
  email: z.string().email('Valid email required').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  email: z.string().trim().email('Valid email address required').optional().nullable(),
});

export const sessionPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['CUSTOMER', 'PRODUCT_MANAGER', 'STORE_MANAGER', 'ORDER_MANAGER', 'DELIVERY_STAFF', 'SUPER_ADMIN']),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  storeId: z.string().optional().nullable(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SessionPayloadInput = z.infer<typeof sessionPayloadSchema>;
