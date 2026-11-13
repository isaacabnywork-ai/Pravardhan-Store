import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError, ForbiddenError } from '@/lib/errors';

const switchRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = switchRoleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid role payload', parsed.error.format());
    }

    const targetRole = parsed.data.role;

    // Map each role to its seeded staff or customer account
    const roleEmailMap: Record<Role, string> = {
      SUPER_ADMIN: 'admin@pravdhanstore.in',
      PRODUCT_MANAGER: 'pm@pravdhanstore.in',
      ORDER_MANAGER: 'om@pravdhanstore.in',
      STORE_MANAGER: 'sm@pravdhanstore.in',
      DELIVERY_STAFF: 'rider@pravdhanstore.in',
      CUSTOMER: 'customer@pravdhanstore.in',
    };

    const targetEmail = roleEmailMap[targetRole];

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { role: targetRole },
          { email: targetEmail },
        ],
      },
    });

    if (!user) {
      // Create user if not existing
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name: `${targetRole.replace(/_/g, ' ')} User`,
          role: targetRole,
          isActive: true,
        },
      });
    }

    if (!user.isActive) {
      throw new ForbiddenError('This persona account is inactive');
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    const response = apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
