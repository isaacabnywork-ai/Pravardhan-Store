import { NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/service';
import { productListQuerySchema } from '@/modules/catalog/schemas';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = productListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      throw new ValidationError('Invalid query parameters', parsed.error.format());
    }

    const { products, pagination } = await catalogService.listProducts(parsed.data);
    return apiSuccess(products, 200, pagination);
  } catch (error) {
    return apiError(error);
  }
}
