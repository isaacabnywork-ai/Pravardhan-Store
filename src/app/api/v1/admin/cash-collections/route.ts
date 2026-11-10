import { NextRequest } from 'next/server';
import { cashCollectionService } from '@/modules/operations/cash-collection-service';
import { requireRole, validateStoreScope } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ForbiddenError } from '@/lib/errors';
import { z } from 'zod';

const recordCollectionSchema = z.object({
  orderId: z.string().min(1),
  riderId: z.string().min(1),
  storeId: z.string().min(1),
  expectedAmountPaise: z.number().int().min(0),
  collectedAmountPaise: z.number().int().min(0),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'STORE_MANAGER', 'DELIVERY_STAFF']);
    const body = await request.json();
    const parsed = recordCollectionSchema.parse(body);

    // Store isolation
    validateStoreScope(session, parsed.storeId);

    // Rider isolation: If caller is DELIVERY_STAFF, riderId must match their authenticated userId
    if (session.role === 'DELIVERY_STAFF' && session.userId !== parsed.riderId) {
      throw new ForbiddenError('Riders can only submit cash collections for their own assignments');
    }

    const record = await cashCollectionService.recordCollection(parsed);
    return apiSuccess(record);
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'STORE_MANAGER']);
    const storeId = request.nextUrl.searchParams.get('storeId') || session.storeId || undefined;

    if (storeId) {
      validateStoreScope(session, storeId);
    }

    const reconciliation = await cashCollectionService.getReconciliation(storeId);
    return apiSuccess(reconciliation);
  } catch (error) {
    return apiError(error);
  }
}
