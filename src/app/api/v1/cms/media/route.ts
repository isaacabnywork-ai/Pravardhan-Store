import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const media = cmsService.listMedia();
    return apiSuccess(media, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to upload media.');
    }

    const body = await request.json();
    const mediaItem = cmsService.addMedia(body);
    return apiSuccess(mediaItem, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to delete media.');
    }

    const { id } = await request.json();
    const success = cmsService.deleteMedia(id);
    return apiSuccess({ success }, 200);
  } catch (error) {
    return apiError(error);
  }
}
