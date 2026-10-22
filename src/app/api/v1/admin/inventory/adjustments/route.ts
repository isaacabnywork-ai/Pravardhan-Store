import { NextRequest } from 'next/server';
import { inventoryService } from '@/modules/inventory/service';
import { stockAdjustmentSchema } from '@/modules/inventory/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, [
      'SUPER_ADMIN',
      'PRODUCT_MANAGER',
      'STORE_MANAGER',
    ]);

    const body = await request.json();
    const parsed = stockAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid stock adjustment payload', parsed.error.format());
    }

    const result = await inventoryService.adjustStock(
      parsed.data,
      session.userId,
      session.role
    );

    return apiSuccess(result, 201);
  } catch (error) {
    return apiError(error);
  }
}
