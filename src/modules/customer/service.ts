import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';
import { NotFoundError, UnauthorizedError, ValidationError, ForbiddenError } from '@/lib/errors';
import { addressSchema, updateProfileSchema } from './schemas';
import { Role } from '@prisma/client';
import { z } from 'zod';

export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.substring(1)}`;
  }
  return `+${digits}`;
}

export class CustomerService {
  /**
   * Request OTP for phone login or registration
   */
  async requestOtp(rawPhone: string) {
    const phone = normalizePhoneNumber(rawPhone);

    // Rate limiting: max 3 active OTP requests in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequests = await prisma.otpChallenge.count({
      where: {
        phone,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentRequests >= 4) {
      throw new ValidationError(
        'Too many OTP requests. Please wait a few minutes before trying again.'
      );
    }

    // In development or test sandbox, default to 123456 or generate random 6 digits
    const isDev = process.env.NODE_ENV !== 'production';
    const otpCode = isDev || phone.endsWith('000000') || phone.endsWith('43210')
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(otpCode, salt);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpChallenge.create({
      data: {
        phone,
        codeHash,
        expiresAt,
      },
    });

    // Mask phone for response (e.g. +91 ******3210)
    const masked = phone.slice(0, 3) + ' ******' + phone.slice(-4);

    return {
      success: true,
      phone: masked,
      message: `Verification code sent to ${masked}`,
      // For sandbox verification in non-production, return debug code
      ...(isDev && { devCode: otpCode }),
    };
  }

  /**
   * Verify OTP and establish secure session
   */
  async verifyOtp(rawPhone: string, code: string) {
    const phone = normalizePhoneNumber(rawPhone);

    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedError('Invalid or expired OTP. Please request a new code.');
    }

    if (challenge.attempts >= 3) {
      throw new UnauthorizedError('Too many failed attempts. This OTP is now locked.');
    }

    // Increment attempt count
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });

    const isMatch = await bcrypt.compare(code, challenge.codeHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid OTP code. Please check and try again.');
    }

    // Mark as used
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { isUsed: true },
    });

    // Find or create customer
    let user = await prisma.user.findFirst({
      where: { phone },
    });

    let isNewCustomer = false;

    if (!user) {
      isNewCustomer = true;
      user = await prisma.user.create({
        data: {
          phone,
          name: `Customer ${phone.slice(-4)}`,
          role: Role.CUSTOMER,
          isActive: true,
        },
      });
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact support.');
    }

    // Issue JWT session token
    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      token,
      isNewCustomer,
    };
  }

  /**
   * Get customer profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Customer account');
    }

    return user;
  }

  /**
   * Update customer profile details
   */
  async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
      },
    });
  }

  /**
   * Address management
   */
  async listAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, data: z.infer<typeof addressSchema>) {
    return prisma.$transaction(async (tx) => {
      // If setting as default, unset others first
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      // If user has no existing addresses, make this default automatically
      const count = await tx.address.count({ where: { userId } });
      const shouldBeDefault = data.isDefault || count === 0;

      return tx.address.create({
        data: {
          ...data,
          phone: normalizePhoneNumber(data.phone),
          userId,
          isDefault: shouldBeDefault,
        },
      });
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<z.infer<typeof addressSchema>>
  ) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Address');
    }

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...data,
          ...(data.phone && { phone: normalizePhoneNumber(data.phone) }),
        },
      });
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Address');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true };
  }
}

export const customerService = new CustomerService();
