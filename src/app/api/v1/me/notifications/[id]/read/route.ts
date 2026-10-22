import { NextRequest } from 'next/server';
import { requireAuth } from '@/modules/auth/permissions';
import { notificationService } from '@/modules/notifications/service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    await notificationService.markAsRead(id, session.userId);
    return apiSuccess({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return apiError(error);
  }
}
