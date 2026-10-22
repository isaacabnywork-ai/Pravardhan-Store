import { NextRequest } from 'next/server';
import { requireAuth } from '@/modules/auth/permissions';
import { notificationService } from '@/modules/notifications/service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';

    const notifications = await notificationService.getUserNotifications(
      session.userId,
      unreadOnly
    );

    return apiSuccess(notifications);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await notificationService.markAllAsRead(session.userId);
    return apiSuccess({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return apiError(error);
  }
}
