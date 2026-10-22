import { NextRequest } from 'next/server';
import { customerService } from '@/modules/customer/service';
import { requestOtpSchema } from '@/modules/customer/schemas';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid phone number', parsed.error.format());
    }

    const result = await customerService.requestOtp(parsed.data.phone);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
