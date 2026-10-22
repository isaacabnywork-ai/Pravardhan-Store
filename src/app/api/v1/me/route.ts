import { NextRequest } from 'next/server';
import { customerService } from '@/modules/customer/service';
import { updateProfileSchema } from '@/modules/customer/schemas';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profile = await customerService.getProfile(session.userId);
    return apiSuccess({ user: profile });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid profile payload', parsed.error.format());
    }

    const updated = await customerService.updateProfile(session.userId, parsed.data);
    return apiSuccess({ user: updated });
  } catch (error) {
    return apiError(error);
  }
}
