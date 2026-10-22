import { NextRequest } from 'next/server';
import { customerService } from '@/modules/customer/service';
import { addressSchema } from '@/modules/customer/schemas';
import { requireAuth } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const addresses = await customerService.listAddresses(session.userId);
    return apiSuccess(addresses);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid address payload', parsed.error.format());
    }

    const address = await customerService.createAddress(session.userId, parsed.data);
    return apiSuccess(address, 201);
  } catch (error) {
    return apiError(error);
  }
}
