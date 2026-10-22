import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { updateProductSchema } from '@/modules/catalog/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'PRODUCT_MANAGER']);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid update payload', parsed.error.format());
    }

    const updated = await catalogService.updateProduct(id, parsed.data, session.userId);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
