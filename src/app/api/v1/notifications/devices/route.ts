import { NextRequest } from 'next/server';
import { requireAuth } from '@/modules/auth/permissions';
import { fcmService } from '@/lib/services/fcm';
import { apiSuccess, apiError } from '@/lib/api-response';
import { z } from 'zod';

const registerDeviceSchema = z.object({
  token: z.string().min(10, 'FCM registration token is required'),
  platform: z.enum(['web', 'android', 'ios']).default('web'),
});

const removeDeviceSchema = z.object({
  token: z.string().min(10, 'FCM registration token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const parsed = registerDeviceSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    const device = await fcmService.registerDeviceToken(
      session.userId,
      parsed.data.token,
      parsed.data.platform
    );

    return apiSuccess({ registered: true, device }, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const parsed = removeDeviceSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    await fcmService.removeDeviceToken(session.userId, parsed.data.token);
    return apiSuccess({ removed: true });
  } catch (error) {
    return apiError(error);
  }
}
