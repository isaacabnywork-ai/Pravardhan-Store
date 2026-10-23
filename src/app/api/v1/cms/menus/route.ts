import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const menus = cmsService.listMenus();
    return apiSuccess(menus, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'MENUS')) {
      throw new ForbiddenError('You do not have permission to manage navigation menus.');
    }

    const { id, items } = await request.json();
    const updated = cmsService.updateMenu(id, { items });
    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}
