import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const sections = cmsService.listSections();
    return apiSuccess(sections, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to create reusable sections.');
    }

    const { title, category, block } = await request.json();
    const section = cmsService.createSection(title, category, block);
    return apiSuccess(section, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to delete sections.');
    }

    const { id } = await request.json();
    const success = cmsService.deleteSection(id);
    return apiSuccess({ success }, 200);
  } catch (error) {
    return apiError(error);
  }
}
