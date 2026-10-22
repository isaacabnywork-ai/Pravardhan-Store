import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { updateStaffSchema } from '@/modules/operations/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN']);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid update payload', parsed.error.format());
    }

    const updated = await operationsService.updateStaff(id, parsed.data, session.userId);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}
