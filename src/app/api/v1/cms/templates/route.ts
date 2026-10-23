import { cmsService } from '@/modules/cms/service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const templates = cmsService.listTemplates();
    return apiSuccess(templates, 200);
  } catch (error) {
    return apiError(error);
  }
}
