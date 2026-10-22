import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await catalogService.getCategoryBySlug(slug);
    return apiSuccess(category);
  } catch (error) {
    return apiError(error);
  }
}
