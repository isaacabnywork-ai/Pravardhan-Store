import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function GET() {
  try {
    const redirects = cmsService.listRedirects();
    return apiSuccess(redirects, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'SETTINGS')) {
      throw new ForbiddenError('You do not have permission to manage URL redirects.');
    }

    const { fromPath, toPath, statusCode } = await request.json();
    const redirect = cmsService.createRedirect(fromPath, toPath, statusCode || 301);
    return apiSuccess(redirect, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'SETTINGS')) {
      throw new ForbiddenError('You do not have permission to delete redirects.');
    }

    const { id } = await request.json();
    const success = cmsService.deleteRedirect(id);
    return apiSuccess({ success }, 200);
  } catch (error) {
    return apiError(error);
  }
}
