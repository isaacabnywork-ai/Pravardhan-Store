import { z } from 'zod';
import { phoneSchema } from './common';

export const createAddressSchema = z.object({
  label: z.enum(['Home', 'Office', 'Other']).default('Home'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: phoneSchema,
  houseNumber: z.string().trim().min(1, 'House number cannot be empty').max(100),
  street: z.string().trim().min(2, 'Street must be at least 2 characters').max(200),
  landmark: z.string().trim().max(200).optional(),
  area: z.string().trim().min(2, 'Area must be at least 2 characters').max(100),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100).default('Gurugram'),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Indian PIN code required (e.g. 122001)'),
  isDefault: z.boolean().default(false),
});

export const addressSchema = createAddressSchema;
export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
