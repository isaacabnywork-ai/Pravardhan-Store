import { z } from 'zod';

/**
 * Normalizes Indian phone numbers:
 * - Trims whitespace and dashes
 * - Strips leading +91, 91, or 0
 * - Ensures valid 10-digit mobile number starting with 6, 7, 8, or 9
 * - Returns clean 10-digit string (or E.164 formatted string via helper)
 */
export const normalizePhoneNumber = (raw: string): string => {
  const cleaned = raw.replace(/\s+/g, '').replace(/[-()+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.slice(2);
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned.slice(1);
  }
  return cleaned;
};

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhoneNumber)
  .refine(
    (val) => /^[6-9]\d{9}$/.test(val),
    { message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)' }
  );

export const otpSchema = z
  .string()
  .trim()
  .refine((val) => /^\d{4,6}$/.test(val), {
    message: 'OTP must be 4 to 6 numeric digits',
  });

export const idSchema = z
  .string()
  .trim()
  .min(1, 'ID cannot be empty');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1).max(100, 'Page size cannot exceed 100').default(20),
});

export const moneyPaiseSchema = z
  .number()
  .int('Amount must be an integer in paise')
  .min(0, 'Amount cannot be negative');

export const quantitySchema = z
  .number()
  .int('Quantity must be an integer')
  .min(1, 'Quantity must be at least 1')
  .max(50, 'Maximum quantity allowed per item is 50');

export const imageMetaSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  format: z.enum(['jpg', 'jpeg', 'png', 'webp', 'svg']),
  sizeBytes: z
    .number()
    .max(5 * 1024 * 1024, 'Image size must not exceed 5 MB'),
});
