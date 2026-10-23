import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = cmsService.getPageById(id);
    if (!page) throw new NotFoundError('CMS Page');
    return apiSuccess(page, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to update pages.');
    }

    const body = await request.json();
    const updated = cmsService.updatePage(id, body, {
      name: session?.name || 'Administrator',
      role,
    });

    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to delete pages.');
    }

    const success = cmsService.deletePage(id);
    return apiSuccess({ success }, 200);
  } catch (error) {
    return apiError(error);
  }
}
