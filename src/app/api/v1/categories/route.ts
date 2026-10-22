import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(_request: NextRequest) {
  try {
    const categories = await catalogService.listCategories();
    return apiSuccess(categories);
  } catch (error) {
    return apiError(error);
  }
}
