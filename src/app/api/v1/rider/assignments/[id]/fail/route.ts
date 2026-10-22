import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { failDeliverySchema } from '@/modules/operations/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, ['DELIVERY_STAFF', 'SUPER_ADMIN']);
    const { id } = await params;
    const body = await request.json();
    const parsed = failDeliverySchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid failure report payload', parsed.error.format());
    }

    const result = await operationsService.failDelivery(
      id,
      session.userId,
      parsed.data.reason,
      parsed.data.notes
    );

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
