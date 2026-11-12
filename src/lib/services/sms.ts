import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { normalizePhoneNumber } from '@/lib/validation/common';

export interface OtpRequestResult {
  success: boolean;
  phone: string;
  maskedPhone: string;
  cooldownSeconds: number;
  message: string;
  devCode?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  phone: string;
}

/**
 * Formats 10-digit number into standard E.164 (+91XXXXXXXXXX)
 */
export function formatE164(phone10: string): string {
  const clean = normalizePhoneNumber(phone10);
  return `+91${clean}`;
}

/**
 * Masks phone for safe client display (e.g. +91 ******4321)
 */
export function maskPhoneNumber(e164: string): string {
  const clean = e164.replace(/\D/g, '');
  const last4 = clean.slice(-4);
  return `+91 ******${last4}`;
}

export class SmsService {
  private get authKey(): string | undefined {
    return process.env.MSG91_AUTH_KEY || env.MSG91_AUTH_KEY;
  }

  private get templateId(): string | undefined {
    return process.env.MSG91_TEMPLATE_ID || env.MSG91_TEMPLATE_ID;
  }

  private get isConfigured(): boolean {
    return Boolean(this.authKey && this.authKey.length > 5);
  }

  /**
   * Request / Send OTP via MSG91 (or local secure challenge fallback)
   * Hardened with transaction-scoped PostgreSQL advisory locks keyed on normalized phone.
   * Guarantees true atomic distributed rate limiting (60s cooldown & max 4 requests / 10 mins).
   */
  async requestOtp(rawPhone: string): Promise<OtpRequestResult> {
    const isDev = process.env.NODE_ENV !== 'production';

    // Fast Fail-Closed Guard: In production, reject immediately if SMS gateway is not configured
    if (!this.isConfigured && !isDev) {
      throw new ValidationError('SMS service is currently unavailable. Please contact customer support.');
    }

    const clean10 = normalizePhoneNumber(rawPhone);
    const e164 = formatE164(clean10);
    const masked = maskPhoneNumber(e164);

    let devCode: string | undefined;
    let createdChallengeId: string | undefined;

    // 1. Transactional rate-limit check and challenge persistence with advisory locking
    // CRITICAL: SMS dispatch is kept strictly OUTSIDE the database transaction.
    // If advisory lock acquisition, rate limiting, or database persistence fails,
    // the transaction aborts and rollback ensures ZERO SMS messages are ever dispatched.
    await prisma.$transaction(async (tx) => {
      // 1. Transaction-scoped PostgreSQL advisory lock keyed on normalized E.164 phone hash
      // CRITICAL FAIL-CLOSED REQUIREMENT:
      // In PostgreSQL, advisory-lock acquisition is mandatory before inspecting rate limits
      // or creating an OTP challenge. Any failure (connection, permission, lock timeout, database error)
      // must strictly throw, aborting the transaction and preventing OTP dispatch.
      const isSqlite = process.env.DATABASE_URL?.startsWith('file:') || process.env.DATABASE_URL?.startsWith('sqlite:');
      if (!isSqlite) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${e164}));`;
      }

      // 2. Rolling Window Abuse Rate Limit Check: Maximum 4 requests in last 10 minutes
      // Checked first so that quota exhaustion reliably surfaces the 10-minute rate limit
      // rather than masking it behind a newly created challenge's 60-second cooldown.
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const countLast10Mins = await tx.otpChallenge.count({
        where: {
          phone: e164,
          createdAt: { gte: tenMinutesAgo },
        },
      });

      if (countLast10Mins >= 4) {
        throw new ValidationError(
          'Too many OTP requests. For your security, please wait 10 minutes before trying again.'
        );
      }

      // 3. Resend Cooldown Check (60 seconds)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentChallenge = await tx.otpChallenge.findFirst({
        where: {
          phone: e164,
          createdAt: { gte: oneMinuteAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentChallenge) {
        const remainingSeconds = Math.max(
          1,
          60 - Math.floor((Date.now() - recentChallenge.createdAt.getTime()) / 1000)
        );
        throw new ValidationError(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
        );
      }

      // 4. Persistence of OTP Challenge inside transaction
      if (this.isConfigured && !isDev) {
        const created = await tx.otpChallenge.create({
          data: {
            phone: e164,
            codeHash: 'MSG91_MANAGED',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        createdChallengeId = created.id;
      } else {
        // Development or Sandbox Simulation
        const generatedCode = clean10.endsWith('000000') || clean10.endsWith('43210')
          ? '123456'
          : Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcrypt.genSalt(10);
        const codeHash = await bcrypt.hash(generatedCode, salt);

        const created = await tx.otpChallenge.create({
          data: {
            phone: e164,
            codeHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        createdChallengeId = created.id;

        if (isDev) {
          devCode = generatedCode;
        }
      }
    });

    // 2. Post-commit provider dispatch: Only reached if transaction committed successfully
    if (this.isConfigured && !isDev) {
      const msg91Mobile = `91${clean10}`;
      const url = new URL('https://control.msg91.com/api/v5/otp');
      url.searchParams.set('template_id', this.templateId || '');
      url.searchParams.set('mobile', msg91Mobile);
      url.searchParams.set('authkey', this.authKey || '');
      url.searchParams.set('otp_length', '6');
      url.searchParams.set('otp_expiry', '5'); // 5 minutes

      const maxAttempts = 3;
      let dispatchSucceeded = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per attempt

          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            dispatchSucceeded = true;
            break;
          }

          // Non-2xx response from provider
          const errData = await res.json().catch(() => ({}));
          console.error(`[MSG91 Error - Attempt ${attempt}/${maxAttempts} HTTP ${res.status}]`, errData);

          // Fast fail on 4xx client errors (e.g. invalid auth key, invalid template, blacklisted number)
          // 4xx errors are permanent client configuration issues that should not be retried in a loop.
          if (res.status >= 400 && res.status < 500) {
            break;
          }
        } catch (err: any) {
          console.error(`[SMS Service Network Error - Attempt ${attempt}/${maxAttempts}]:`, err?.message || err);
        }

        if (attempt < maxAttempts) {
          // Brief backoff before transient retry (100ms, 200ms)
          await new Promise((resolve) => setTimeout(resolve, attempt * 100));
        }
      }

      if (!dispatchSucceeded) {
        // Explicit Recovery Policy:
        // If external SMS dispatch fails across all retry attempts, invalidate the persisted challenge
        // so it cannot remain in an orphaned state preventing prompt resend or blocking customer recovery.
        if (createdChallengeId) {
          try {
            await prisma.otpChallenge.updateMany({
              where: { id: createdChallengeId, isUsed: false },
              data: { isUsed: true },
            });
          } catch (cleanupErr) {
            console.error('[SMS Service Cleanup Error]:', cleanupErr);
          }
        }

        throw new ValidationError(
          'Could not deliver verification code via SMS. Please check mobile connectivity or try again in a few moments.'
        );
      }
    }

    return {
      success: true,
      phone: e164,
      maskedPhone: masked,
      cooldownSeconds: 60,
      message: `Verification code sent to ${masked}`,
      devCode,
    };
  }

  /**
   * Verify OTP submitted by customer with true atomic single-use consumption
   * Invariant: Concurrent requests using the same challenge can only have exactly 1 successful consumer.
   */
  async verifyOtp(rawPhone: string, code: string): Promise<OtpVerifyResult> {
    const clean10 = normalizePhoneNumber(rawPhone);
    const e164 = formatE164(clean10);

    // 1. First find candidate challenge (read-only query)
    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        phone: e164,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedError('Invalid or expired OTP. Please request a new code.');
    }

    if (challenge.attempts >= 5) {
      throw new UnauthorizedError('Too many failed attempts. This OTP has been invalidated for security.');
    }

    // 2. Perform expensive bcrypt comparison outside of database transaction lock
    let isCodeValid = false;
    if (challenge.codeHash === 'MSG91_MANAGED' && this.isConfigured) {
      const msg91Mobile = `91${clean10}`;
      const url = new URL('https://control.msg91.com/api/v5/otp/verify');
      url.searchParams.set('otp', code.trim());
      url.searchParams.set('mobile', msg91Mobile);
      url.searchParams.set('authkey', this.authKey || '');

      const res = await fetch(url.toString(), { method: 'GET' });
      const data = await res.json().catch(() => ({ type: 'error' }));
      isCodeValid = !(data.type === 'error' || !res.ok);
    } else {
      isCodeValid = await bcrypt.compare(code.trim(), challenge.codeHash);
    }

    if (!isCodeValid) {
      // Safely increment attempt counter atomically on active, unconsumed challenge up to max 5
      await prisma.otpChallenge.updateMany({
        where: { id: challenge.id, isUsed: false, attempts: { lt: 5 } },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedError('Incorrect verification code. Please check and re-enter.');
    }

    // 3. True atomic single-use consumption:
    // UPDATE otp_challenges SET isUsed = true WHERE id = ? AND isUsed = false AND attempts < 5 AND expiresAt > now()
    // Exactly 1 concurrent execution can update count === 1. Losing requests get count === 0 and throw.
    const result = await prisma.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        isUsed: false,
        attempts: { lt: 5 },
        expiresAt: { gt: new Date() },
      },
      data: {
        isUsed: true,
        attempts: { increment: 1 },
      },
    });

    if (result.count !== 1) {
      throw new UnauthorizedError('This OTP challenge has already been consumed or has expired.');
    }

    return {
      success: true,
      phone: e164,
    };
  }
}

export const smsService = new SmsService();
