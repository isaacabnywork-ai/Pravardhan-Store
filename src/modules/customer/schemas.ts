import { z } from 'zod';

export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, '').replace(/^-+/, ''))
  .refine(
    (val) => /^(\+91|91|0)?[6-9]\d{9}$/.test(val),
    'Please enter a valid 10-digit Indian mobile number'
  );

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional().nullable(),
});

export const addressSchema = z.object({
  label: z.enum(['Home', 'Office', 'Other']).default('Home'),
  name: z.string().min(2, 'Recipient name is required'),
  phone: phoneSchema,
  houseNumber: z.string().min(1, 'House / Flat / Floor number is required'),
  street: z.string().min(2, 'Street or Apartment name is required'),
  landmark: z.string().optional(),
  area: z.string().min(2, 'Area or Sector is required'),
  city: z.string().min(2, 'City is required').default('Gurugram'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Indian PIN code required'),
  isDefault: z.boolean().default(false),
});
