import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { createCategorySchema } from '@/modules/catalog/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN', 'PRODUCT_MANAGER']);
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid category payload', parsed.error.format());
    }

    const category = await catalogService.createCategory(parsed.data);
    return apiSuccess(category, 201);
  } catch (error) {
    return apiError(error);
  }
}
