export type ProviderStatus =
  | 'NOT_CONFIGURED'
  | 'CONFIGURED'
  | 'CONNECTION_VERIFIED'
  | 'DELIVERY_VERIFIED'
  | 'FAILED';

export interface ProviderDiagnostic {
  name: string;
  category: 'database' | 'payment' | 'sms' | 'storage' | 'notifications';
  status: ProviderStatus;
  details: string;
  isCritical: boolean;
}

export class DiagnosticsService {
  /**
   * Evaluates external providers and infrastructure readiness without exposing secrets
   */
  async getReadinessReport(): Promise<{
    timestamp: string;
    overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    providers: ProviderDiagnostic[];
  }> {
    const providers: ProviderDiagnostic[] = [];

    // 1. Database (Neon PostgreSQL)
    const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      providers.push({
        name: 'Neon PostgreSQL',
        category: 'database',
        status: 'NOT_CONFIGURED',
        details: 'POSTGRES_PRISMA_URL or DATABASE_URL environment variable is missing',
        isCritical: true,
      });
    } else {
      providers.push({
        name: 'Neon PostgreSQL',
        category: 'database',
        status: 'CONFIGURED',
        details: 'Database connection string configured with pooling support',
        isCritical: true,
      });
    }

    // 2. Razorpay Payment Gateway
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    const rzpWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!rzpKeyId || !rzpSecret) {
      providers.push({
        name: 'Razorpay Gateway',
        category: 'payment',
        status: 'NOT_CONFIGURED',
        details: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured',
        isCritical: true,
      });
    } else {
      providers.push({
        name: 'Razorpay Gateway',
        category: 'payment',
        status: 'CONFIGURED',
        details: `Configured (Webhook secret ${rzpWebhookSecret ? 'present' : 'missing'})`,
        isCritical: true,
      });
    }

    // 3. MSG91 SMS / OTP Gateway
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;
    const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

    if (!msg91AuthKey || !msg91TemplateId) {
      providers.push({
        name: 'MSG91 OTP',
        category: 'sms',
        status: 'NOT_CONFIGURED',
        details: 'MSG91_AUTH_KEY or MSG91_TEMPLATE_ID is not configured. Falling back to test OTP 123456.',
        isCritical: false,
      });
    } else {
      providers.push({
        name: 'MSG91 OTP',
        category: 'sms',
        status: 'CONFIGURED',
        details: 'MSG91 OTP Gateway credentials configured',
        isCritical: false,
      });
    }

    // 4. S3 Object Storage (Cloudinary / S3)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      providers.push({
        name: 'S3/Cloudinary Storage',
        category: 'storage',
        status: 'NOT_CONFIGURED',
        details: 'Storage credentials missing. Production POD storage strictly fails closed.',
        isCritical: true,
      });
    } else {
      providers.push({
        name: 'S3/Cloudinary Storage',
        category: 'storage',
        status: 'CONFIGURED',
        details: 'Object storage credentials configured with signature validation',
        isCritical: true,
      });
    }

    // 5. Firebase Cloud Messaging (FCM)
    const fcmProjectId = process.env.FIREBASE_PROJECT_ID;
    if (!fcmProjectId) {
      providers.push({
        name: 'Firebase Cloud Messaging',
        category: 'notifications',
        status: 'NOT_CONFIGURED',
        details: 'FCM push notification credentials not configured',
        isCritical: false,
      });
    } else {
      providers.push({
        name: 'Firebase Cloud Messaging',
        category: 'notifications',
        status: 'CONFIGURED',
        details: 'FCM project configured for push notifications',
        isCritical: false,
      });
    }

    const hasCriticalMissing = providers.some((p) => p.isCritical && p.status === 'NOT_CONFIGURED');
    const hasNonCriticalMissing = providers.some((p) => !p.isCritical && p.status === 'NOT_CONFIGURED');

    const overallStatus = hasCriticalMissing ? 'DEGRADED' : hasNonCriticalMissing ? 'HEALTHY' : 'HEALTHY';

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      providers,
    };
  }
}

export const diagnosticsService = new DiagnosticsService();
