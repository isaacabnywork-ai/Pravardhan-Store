import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { assignRiderSchema } from '@/modules/operations/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN', 'ORDER_MANAGER']);
    const riders = await operationsService.listAvailableRiders();
    return apiSuccess(riders);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'ORDER_MANAGER']);
    const body = await request.json();
    const parsed = assignRiderSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid dispatch assignment payload', parsed.error.format());
    }

    const result = await operationsService.assignRider(
      parsed.data.orderId,
      parsed.data.riderId,
      parsed.data.notes,
      session.userId
    );

    return apiSuccess(result, 201);
  } catch (error) {
    return apiError(error);
  }
}
