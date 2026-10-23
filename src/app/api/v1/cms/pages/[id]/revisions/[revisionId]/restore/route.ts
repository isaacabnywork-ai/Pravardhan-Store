import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { id, revisionId } = await params;
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'PUBLISH')) {
      throw new ForbiddenError('You do not have permission to restore revisions.');
    }

    const updated = cmsService.restoreRevision(id, revisionId, {
      name: session?.name || 'Administrator',
      role,
    });

    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}
