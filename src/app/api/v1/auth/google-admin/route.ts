import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { isEmailAuthorizedForAdmin } from '@/lib/auth/admin-whitelist';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ForbiddenError, ValidationError } from '@/lib/errors';

const googleAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = googleAdminSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid request payload', parsed.error.format());
    }

    const { email, name } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Verify admin authorization
    const authCheck = await isEmailAuthorizedForAdmin(cleanEmail);
    if (!authCheck.authorized) {
      throw new ForbiddenError(
        `Access Denied: ${cleanEmail} is not authorized for Admin access. Please contact store management to grant access.`
      );
    }

    // Find or create staff user in database
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name || undefined,
        role: authCheck.role,
        isActive: true,
      },
      create: {
        email: cleanEmail,
        name: name?.trim() || 'Store Administrator',
        role: authCheck.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    const response = apiSuccess(
      {
        user,
        token,
        authorized: true,
      },
      200
    );

    // Set HTTP-only secure cookie for 30 days
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
