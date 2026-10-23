import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const settings = cmsService.getWebsiteSettings();
    return apiSuccess(settings, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'SETTINGS')) {
      throw new ForbiddenError('You do not have permission to update website settings.');
    }

    const body = await request.json();
    const updated = cmsService.updateWebsiteSettings(body);
    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}
