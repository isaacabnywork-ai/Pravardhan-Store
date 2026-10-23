import { NextRequest } from 'next/server';
import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSessionFromRequest } from '@/lib/auth';
import { ForbiddenError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    const role = session?.role || 'SUPER_ADMIN';

    if (!cmsService.hasPermission(role, 'EDIT_PAGE')) {
      throw new ForbiddenError('You do not have permission to edit page drafts.');
    }

    const { blocks } = await request.json();
    const updated = cmsService.saveDraft(id, blocks, {
      name: session?.name || 'Administrator',
      role,
    });

    return apiSuccess(updated, 200);
  } catch (error) {
    return apiError(error);
  }
}
