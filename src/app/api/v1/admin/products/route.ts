import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { createProductSchema } from '@/modules/catalog/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'PRODUCT_MANAGER']);
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid product payload', parsed.error.format());
    }

    const product = await catalogService.createProduct(parsed.data, session.userId);
    return apiSuccess(product, 201);
  } catch (error) {
    return apiError(error);
  }
}
