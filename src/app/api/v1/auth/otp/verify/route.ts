import { NextRequest } from 'next/server';
import { customerService } from '@/modules/customer/service';
import { verifyOtpSchema } from '@/lib/validation';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    const { user, token, isNewCustomer } = await customerService.verifyOtp(
      parsed.data.phone,
      parsed.data.otp
    );

    const response = apiSuccess(
      {
        user,
        token,
        isNewCustomer,
      },
      isNewCustomer ? 201 : 200
    );

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days for customer sessions
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
