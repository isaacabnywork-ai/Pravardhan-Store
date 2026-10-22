import { NextRequest } from 'next/server';
import { inventoryService } from '@/modules/inventory/service';
import { serviceabilityQuerySchema } from '@/modules/inventory/schemas';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const pincode = request.nextUrl.searchParams.get('pincode') || '';
    const parsed = serviceabilityQuerySchema.safeParse({ pincode });

    if (!parsed.success) {
      throw new ValidationError(
        'Please provide a valid 6-digit Indian PIN code (e.g. ?pincode=122001)',
        parsed.error.format()
      );
    }

    const result = await inventoryService.checkServiceability(parsed.data.pincode);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
