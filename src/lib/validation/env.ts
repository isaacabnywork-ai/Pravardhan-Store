import { z } from 'zod';

export const serverEnvSchema = z.object({
  // Database Configuration (Neon PostgreSQL)
  DATABASE_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // Authentication & Security
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters').default('pravdhan-store-dev-secret-32-chars-long-minimum'),
  AUTH_URL: z.string().url().optional().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Staff Bootstrapping
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional().default('admin@pravdhanstore.in'),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional().default('PravdhanAdmin@2026!'),

  // Payment Gateway (Razorpay)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Phase 2: MSG91 SMS / OTP Gateway
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional().default('PRVDHN'),

  // Phase 3: Cloudinary Image Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Phase 4: Sentry Error Monitoring
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Phase 5: Firebase Cloud Messaging (FCM)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),

  // Phase 7: Redis & BullMQ
  REDIS_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function validateEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const isProduction = process.env.NODE_ENV === 'production';
    console.error('❌ [Config Error] Invalid environment configuration:', result.error.format());

    // In production, strictly fail closed on invalid critical environment
    if (isProduction) {
      throw new Error(`Production environment validation failed: ${JSON.stringify(result.error.format())}`);
    }

    // In development or test, provide safe local defaults
    cachedEnv = serverEnvSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pravdhan_store?schema=public',
      ...process.env,
    });
  } else {
    // If in live production runtime (not static build phase), verify mandatory secrets are not default
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build';
    if (result.data.NODE_ENV === 'production' && !isBuildPhase) {
      if (result.data.AUTH_SECRET === 'pravdhan-store-dev-secret-32-chars-long-minimum') {
        throw new Error('Production security violation: AUTH_SECRET cannot use insecure development default value.');
      }
    }
    cachedEnv = result.data;
  }

  return cachedEnv;
}
