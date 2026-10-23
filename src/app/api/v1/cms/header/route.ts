import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const header = cmsService.getHeaderConfig();
    return apiSuccess(header, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'THEME')) {
      throw new ForbiddenError('You do not have permission to customize website header.');
    }

    const body = await request.json();
    const updated = cmsService.updateHeaderConfig(body);
    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}
