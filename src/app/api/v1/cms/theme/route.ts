import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const theme = cmsService.getThemeSettings();
    return apiSuccess(theme, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'THEME')) {
      throw new ForbiddenError('You do not have permission to customize website theme.');
    }

    const body = await request.json();
    const updated = cmsService.updateThemeSettings(body);
    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}
