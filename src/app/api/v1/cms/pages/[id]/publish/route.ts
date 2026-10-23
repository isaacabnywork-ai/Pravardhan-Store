import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    if (!cmsService.hasPermission(role, 'PUBLISH')) {
      throw new ForbiddenError('You do not have permission to publish pages.');
    }

    const published = cmsService.publishPage(id, {
      name: session?.name || 'Administrator',
      role,
    });

    // Invalidate caches
    try {
      if (published.isHomepage || published.slug === 'home') {
        revalidatePath('/');
      } else {
        revalidatePath(`/${published.slug}`);
      }
    } catch {
      // ignore in local runtime
    }

    return apiSuccess(published, 200);
  } catch (error) {
    return apiError(error);
  }
}
