import { NextRequest } from 'next/server';
import { customerService } from '@/modules/customer/service';
import { addressSchema } from '@/modules/customer/schemas';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = addressSchema.partial().safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid address update payload', parsed.error.format());
    }

    const updated = await customerService.updateAddress(session.userId, id, parsed.data);
    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const result = await customerService.deleteAddress(session.userId, id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
