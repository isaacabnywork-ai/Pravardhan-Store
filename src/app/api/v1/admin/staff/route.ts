import { NextRequest } from 'next/server';
import { operationsService } from '@/modules/operations/service';
import { createStaffSchema } from '@/modules/operations/schemas';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['SUPER_ADMIN']);
    const storeId = request.nextUrl.searchParams.get('storeId') || undefined;

    const staff = await operationsService.listStaff(storeId);
    return apiSuccess(staff);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN']);
    const body = await request.json();
    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid staff payload', parsed.error.format());
    }

    const staff = await operationsService.createStaff(parsed.data, session.userId);
    return apiSuccess(staff, 201);
  } catch (error) {
    return apiError(error);
  }
}
