import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { normalizePhoneNumber } from '@/lib/validation/common';
import { SmsDeliveryStatus } from '@prisma/client';
import { encryptPayload, decryptPayload } from '@/lib/security/crypto';

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
   * Process a single transactional outbox SMS delivery job.
   * Dispatches external HTTP request to MSG91 outside database locks.
   * Employs fencing claimToken to prevent stale worker completions.
   * Records attempts, delivery status, and sanitized error messages.
   * On delivery or terminal failure, encryptedCode is immediately nullified.
   */
  async processDeliveryJob(jobId: string, workerId: string = 'worker-inline'): Promise<boolean> {
    const isDev = process.env.NODE_ENV !== 'production';
    const now = new Date();
    const staleLockThreshold = new Date(now.getTime() - 30000); // 30s stale lease
    const newClaimToken = crypto.randomUUID();

    // 1. Hardened conditional claim of delivery job:
    // Guards:
    // - status must be PENDING (with nextAttemptAt <= now) OR PROCESSING (with expired lease lockedAt < staleLockThreshold)
    // - attempts must be < maxAttempts
    // - OTP challenge must NOT be expired (if challenge is expired, mark FAILED immediately and do not deliver)
    // - sets lockedAt = now, lockedBy = workerId, claimToken = newClaimToken, attempts += 1
    const claimedJob = await prisma.$transaction(async (tx) => {
      const candidate = await tx.smsDeliveryJob.findUnique({
        where: { id: jobId },
        include: { challenge: true },
      });

      if (!candidate) return null;

      if (candidate.status === SmsDeliveryStatus.DELIVERED || candidate.status === SmsDeliveryStatus.FAILED) {
        return null;
      }

      if (candidate.attempts >= candidate.maxAttempts) {
        return null;
      }

      // Expired OTP Challenge Guard: Expired OTP jobs must NEVER be dispatched/delivered
      if (candidate.challenge && candidate.challenge.expiresAt <= now) {
        await tx.smsDeliveryJob.update({
          where: { id: jobId },
          data: {
            status: SmsDeliveryStatus.FAILED,
            encryptedCode: null, // Wipe sensitive OTP code
            lastError: 'OTP challenge expired prior to delivery',
            lockedAt: null,
            lockedBy: null,
          },
        });
        return null;
      }

      // If PENDING, must not be scheduled in future
      if (candidate.status === SmsDeliveryStatus.PENDING && candidate.nextAttemptAt > now) {
        return null;
      }

      // If PROCESSING, lease must be stale (>30s)
      if (
        candidate.status === SmsDeliveryStatus.PROCESSING &&
        candidate.lockedAt &&
        candidate.lockedAt >= staleLockThreshold
      ) {
        return null;
      }

      return tx.smsDeliveryJob.update({
        where: { id: jobId },
        data: {
          status: SmsDeliveryStatus.PROCESSING,
          lockedAt: now,
          lockedBy: workerId,
          claimToken: newClaimToken,
          attempts: { increment: 1 },
        },
      });
    });

    if (!claimedJob) {
      return false;
    }

    // 2. Non-production or unconfigured simulation: Mark DELIVERED immediately
    if (!this.isConfigured || isDev) {
      await prisma.smsDeliveryJob.updateMany({
        where: { id: jobId, claimToken: newClaimToken },
        data: {
          status: SmsDeliveryStatus.DELIVERED,
          encryptedCode: null, // Zero sensitive payload
          lockedAt: null,
          lockedBy: null,
        },
      });
      return true;
    }

    // 3. Obtain OTP code:
    // If encryptedCode is present, decrypt it safely using AES-256-GCM.
    // If MSG91_MANAGED without custom encryptedCode, MSG91 generates code directly.
    let otpToSend: string | undefined;
    if (claimedJob.encryptedCode) {
      try {
        otpToSend = decryptPayload(claimedJob.encryptedCode);
      } catch (decErr: any) {
        // Safe Failure: Missing, unknown, or corrupted key/ciphertext fails closed without provider invocation
        await prisma.smsDeliveryJob.updateMany({
          where: { id: jobId, claimToken: newClaimToken },
          data: {
            status: SmsDeliveryStatus.FAILED,
            encryptedCode: null, // Wipe unprocessable payload
            lastError: `Decryption failure: ${decErr?.message || 'invalid key or ciphertext'}`,
            lockedAt: null,
            lockedBy: null,
          },
        });
        return false;
      }
    }

    // 4. Production External MSG91 HTTP Request outside of DB transaction
    const clean10 = normalizePhoneNumber(claimedJob.phone);
    const msg91Mobile = `91${clean10}`;
    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.set('template_id', this.templateId || '');
    url.searchParams.set('mobile', msg91Mobile);
    url.searchParams.set('authkey', this.authKey || '');
    if (otpToSend) {
      url.searchParams.set('otp', otpToSend);
    } else {
      url.searchParams.set('otp_length', '6');
      url.searchParams.set('otp_expiry', '5');
    }

    let dispatchSuccess = false;
    let isPermanentClientError = false;
    let sanitizedError = '';
    let providerMsgId = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        providerMsgId = resData?.message || resData?.request_id || 'OK';
        dispatchSuccess = true;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error(`[MSG91 Dispatch HTTP ${res.status}]`, errData);

        if (res.status >= 400 && res.status < 500) {
          isPermanentClientError = true;
          sanitizedError = `Provider rejected request (HTTP ${res.status})`;
        } else {
          sanitizedError = `Provider temporary error (HTTP ${res.status})`;
        }
      }
    } catch (err: any) {
      console.error('[SMS Dispatch Network Error]:', err?.message || err);
      sanitizedError = err?.name === 'AbortError' ? 'Provider timeout after 8s' : 'Network connectivity failure';
    }

    if (dispatchSuccess) {
      // Complete job guarded by claimToken fencing
      const updateRes = await prisma.smsDeliveryJob.updateMany({
        where: { id: jobId, claimToken: newClaimToken },
        data: {
          status: SmsDeliveryStatus.DELIVERED,
          encryptedCode: null, // Immediately wipe encrypted OTP
          providerMsgId,
          lastError: null,
          lockedAt: null,
          lockedBy: null,
        },
      });
      return updateRes.count > 0;
    }

    // 5. Handle Failure with Terminal State or Bounded Exponential Backoff
    const isExhausted = claimedJob.attempts >= claimedJob.maxAttempts || isPermanentClientError;

    if (isExhausted) {
      // Terminal Failure State
      await prisma.$transaction(async (tx) => {
        await tx.smsDeliveryJob.updateMany({
          where: { id: jobId, claimToken: newClaimToken },
          data: {
            status: SmsDeliveryStatus.FAILED,
            encryptedCode: null, // Wipe encrypted OTP
            lastError: sanitizedError,
            lockedAt: null,
            lockedBy: null,
          },
        });

        // Invalidate challenge so customer is not locked out by an undelivered challenge
        await tx.otpChallenge.updateMany({
          where: { id: claimedJob.challengeId, isUsed: false },
          data: { isUsed: true },
        });
      });
      return false;
    }

    // Schedule transient retry with bounded exponential backoff (e.g. 1s, 2s)
    const backoffMs = Math.min(1000 * Math.pow(2, claimedJob.attempts - 1), 5000);
    await prisma.smsDeliveryJob.updateMany({
      where: { id: jobId, claimToken: newClaimToken },
      data: {
        status: SmsDeliveryStatus.PENDING,
        lastError: sanitizedError,
        nextAttemptAt: new Date(Date.now() + backoffMs),
        lockedAt: null,
        lockedBy: null,
      },
    });

    return false;
  }

  /**
   * Background recovery worker: Scans for abandoned/pending SMS delivery jobs and executes them.
   * Safe for process restarts, multiple worker processes, and crash recovery.
   */
  async recoverPendingJobs(workerId: string = 'worker-recovery', limit: number = 10): Promise<number> {
    const staleLockThreshold = new Date(Date.now() - 30000); // 30s stale lock
    const now = new Date();

    const jobs = await prisma.smsDeliveryJob.findMany({
      where: {
        attempts: { lt: 3 },
        OR: [
          { status: SmsDeliveryStatus.PENDING, nextAttemptAt: { lte: now } },
          { status: SmsDeliveryStatus.PROCESSING, lockedAt: { lt: staleLockThreshold } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    let processedCount = 0;
    for (const job of jobs) {
      const ok = await this.processDeliveryJob(job.id, workerId);
      if (ok) processedCount++;
    }

    return processedCount;
  }

  /**
   * Request / Send OTP via MSG91 (or local secure challenge fallback)
   * Hardened with transaction-scoped PostgreSQL advisory locks and durable outbox job persistence.
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
    let deliveryJobId: string | undefined;

    // 1. Transactional rate-limit check, OTP challenge persistence, and delivery outbox creation
    // CRITICAL: Guaranteed atomic persistence under PostgreSQL advisory lock.
    await prisma.$transaction(async (tx) => {
      // 1. Transaction-scoped PostgreSQL advisory lock keyed on normalized E.164 phone hash
      const isSqlite = process.env.DATABASE_URL?.startsWith('file:') || process.env.DATABASE_URL?.startsWith('sqlite:');
      if (!isSqlite) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${e164}));`;
      }

      // 2. Rolling Window Abuse Rate Limit Check: Maximum 4 requests in last 10 minutes
      // Checked first so that quota exhaustion reliably surfaces the 10-minute rate limit.
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
      // Only active uninvalidated challenges (isUsed = false) enforce the 60-second cooldown.
      // If a previous challenge suffered a permanent delivery failure (isUsed = true),
      // the customer is allowed an immediate recovery attempt without waiting 60s,
      // while still strictly bounded by the 4-per-10-minute quota above.
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentActiveChallenge = await tx.otpChallenge.findFirst({
        where: {
          phone: e164,
          isUsed: false,
          createdAt: { gte: oneMinuteAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentActiveChallenge) {
        const remainingSeconds = Math.max(
          1,
          60 - Math.floor((Date.now() - recentActiveChallenge.createdAt.getTime()) / 1000)
        );
        throw new ValidationError(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
        );
      }

      // 4. Persistence of OTP Challenge and SmsDeliveryJob atomically inside transaction
      let codeHash = 'MSG91_MANAGED';
      let encryptedCode: string | null = null;

      if (!this.isConfigured || isDev) {
        const generatedCode = clean10.endsWith('000000') || clean10.endsWith('43210')
          ? '123456'
          : Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcrypt.genSalt(10);
        codeHash = await bcrypt.hash(generatedCode, salt);
        encryptedCode = encryptPayload(generatedCode);
        if (isDev) {
          devCode = generatedCode;
        }
      }

      const challenge = await tx.otpChallenge.create({
        data: {
          phone: e164,
          codeHash,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      const outboxJob = await tx.smsDeliveryJob.create({
        data: {
          challengeId: challenge.id,
          phone: e164,
          encryptedCode,
          status: SmsDeliveryStatus.PENDING,
          attempts: 0,
          maxAttempts: 3,
          nextAttemptAt: new Date(),
        },
      });

      deliveryJobId = outboxJob.id;
    });

    // 2. Post-commit immediate delivery attempt outside of database transaction
    if (deliveryJobId) {
      if (this.isConfigured && !isDev) {
        let delivered = await this.processDeliveryJob(deliveryJobId, 'worker-inline');

        // If transient failure, synchronously execute retry loop up to maxAttempts so caller gets clear feedback
        while (!delivered) {
          const job = await prisma.smsDeliveryJob.findUnique({
            where: { id: deliveryJobId },
          });

          if (!job || job.status === SmsDeliveryStatus.FAILED || job.status === SmsDeliveryStatus.DELIVERED) {
            break;
          }

          // Wait brief delay before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
          delivered = await this.processDeliveryJob(deliveryJobId, 'worker-inline');
        }

        if (!delivered) {
          const finalJob = await prisma.smsDeliveryJob.findUnique({
            where: { id: deliveryJobId },
          });

          if (finalJob?.status === SmsDeliveryStatus.FAILED) {
            throw new ValidationError(
              'Could not deliver verification code via SMS. Please check mobile connectivity or try again in a few moments.'
            );
          }
        }
      } else {
        // Development or Simulation: Process immediately to mark DELIVERED and wipe encryptedCode
        await this.processDeliveryJob(deliveryJobId, 'worker-sim');
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
      data: { isUsed: true },
    });

    if (result.count === 0) {
      throw new UnauthorizedError('OTP has already been used or expired. Please request a new code.');
    }

    return {
      success: true,
      phone: e164,
    };
  }
}

export const smsService = new SmsService();
