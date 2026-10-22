import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters').default('pravdhan-store-development-secret-key-32-chars-min'),
  AUTH_URL: z.string().url().optional().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional().default('admin@pravdhanstore.in'),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional().default('PravdhanAdmin@2026!'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    // In build or edge environments, provide safe defaults where possible
    parsedEnv = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pravdhan_store?schema=public',
      ...process.env,
    });
  } else {
    parsedEnv = result.data;
  }

  return parsedEnv;
}

export const env = getEnv();
