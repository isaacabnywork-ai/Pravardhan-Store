import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storeId = request.nextUrl.searchParams.get('storeId') || undefined;

    const product = await catalogService.getProductBySlug(slug, storeId);
    return apiSuccess(product);
  } catch (error) {
    return apiError(error);
  }
}
