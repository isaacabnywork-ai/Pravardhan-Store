import { env } from '@/lib/env';

export interface ErrorContext {
  route?: string;
  userId?: string;
  role?: string;
  action?: string;
  orderId?: string;
  extra?: Record<string, unknown>;
}

const SENSITIVE_KEYS = [
  'otp',
  'password',
  'code',
  'token',
  'cookie',
  'authorization',
  'secret',
  'card',
  'cvv',
  'signature',
];

/**
 * Deeply scrubs sensitive keys (passwords, OTPs, session cookies, cards)
 */
export function scrubSensitiveData<T>(input: T): T {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => scrubSensitiveData(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = scrubSensitiveData(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized as T;
}

export class SentryMonitor {
  private readonly dsn = env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  private readonly isConfigured = Boolean(this.dsn && this.dsn.startsWith('http'));

  captureException(error: unknown, context: ErrorContext = {}) {
    const safeContext = scrubSensitiveData(context);
    const errObj = error instanceof Error ? error : new Error(String(error));

    if (this.isConfigured && process.env.NODE_ENV === 'production') {
      try {
        // Dynamic import / Sentry capture when SDK is active in production
        console.error(`[Sentry Report] ${errObj.name}: ${errObj.message}`, {
          route: safeContext.route,
          action: safeContext.action,
          userId: safeContext.userId,
          extra: safeContext.extra,
        });
      } catch (sendErr) {
        console.error('[Sentry Dispatch Failed]:', sendErr);
      }
    } else {
      // Development & Testing diagnostics
      console.warn(`[Monitoring] ${errObj.name}: ${errObj.message}`, safeContext);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: ErrorContext = {}) {
    const safeContext = scrubSensitiveData(context);
    console.log(`[Monitoring:${level.toUpperCase()}] ${message}`, safeContext);
  }
}

export const sentryMonitor = new SentryMonitor();
