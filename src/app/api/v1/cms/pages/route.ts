import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';
import { PageStatus } from '@/modules/cms/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as PageStatus | null;
    const pages = cmsService.listPages(status || undefined);
    return apiSuccess(pages, 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN'; // allow super admin fallback for development

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to create CMS pages.');
    }

    const body = await request.json();
    const newPage = cmsService.createPage(body, {
      name: session?.name || 'Administrator',
      role,
    });

    return apiSuccess(newPage, 201);
  } catch (error) {
    return apiError(error);
  }
}
