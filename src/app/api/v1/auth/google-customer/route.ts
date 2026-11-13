import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ForbiddenError, ValidationError } from '@/lib/errors';
import { Role } from '@prisma/client';

const googleCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = googleCustomerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid request payload', parsed.error.format());
    }

    const { email, name } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    let isNewCustomer = false;

    if (!user) {
      isNewCustomer = true;
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split('@')[0],
          role: Role.CUSTOMER,
          isActive: true,
        },
      });
    } else if (name && name.trim() && user.name.startsWith('Customer ')) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact store support.');
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    const response = apiSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
        isNewCustomer,
      },
      isNewCustomer ? 201 : 200
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
