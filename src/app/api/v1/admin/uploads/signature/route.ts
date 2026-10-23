import { NextRequest } from 'next/server';
import { requireRole } from '@/modules/auth/permissions';
import { cloudinaryService } from '@/lib/services/cloudinary';
import { apiSuccess, apiError } from '@/lib/api-response';
import { z } from 'zod';

const signatureRequestSchema = z.object({
  folder: z.enum([
    'pravdhan-store/products',
    'pravdhan-store/categories',
    'pravdhan-store/banners',
  ]).default('pravdhan-store/products'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authorize: Only Super Admin and Product Manager can upload product assets
    await requireRole(request, ['SUPER_ADMIN', 'PRODUCT_MANAGER']);

    // 2. Parse body (if provided)
    const body = await request.json().catch(() => ({}));
    const parsed = signatureRequestSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    // 3. Generate signed upload signature
    const signatureConfig = cloudinaryService.generateUploadSignature(parsed.data.folder);

    return apiSuccess(signatureConfig);
  } catch (error) {
    return apiError(error);
  }
}
