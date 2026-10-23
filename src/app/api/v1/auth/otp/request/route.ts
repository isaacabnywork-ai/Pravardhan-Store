import { NextRequest } from 'next/server';
import { customerService } from '@/modules/customer/service';
import { requestOtpSchema } from '@/lib/validation';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    const result = await customerService.requestOtp(parsed.data.phone);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
