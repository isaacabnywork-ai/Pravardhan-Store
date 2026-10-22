import { NextRequest } from 'next/server';
import { requireRole } from '@/modules/auth/permissions';
import { apiSuccess, apiError } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ValidationError, NotFoundError } from '@/lib/errors';

const walletAdjustmentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['CREDIT', 'DEBIT']),
  reason: z.string().min(3, 'Reason is required'),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'ORDER_MANAGER']);
    const { id: customerId } = await params;

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, phone: true, role: true },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    const body = await request.json();
    const parsed = walletAdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid wallet adjustment payload', parsed.error.format());
    }

    const { amount, type, reason, notes } = parsed.data;

    // Log this operation into AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.role,
        action: `WALLET_${type}`,
        entity: 'USER_WALLET',
        entityId: customerId,
        details: {
          customerName: customer.name,
          customerPhone: customer.phone,
          amountRupees: amount,
          type,
          reason,
          notes: notes || '',
          timestamp: new Date().toISOString(),
        },
      },
    });

    return apiSuccess({
      success: true,
      customerId,
      customerName: customer.name,
      amount,
      type,
      reason,
      message: `Successfully recorded ${type} of ₹${amount} for ${customer.name}.`,
    });
  } catch (error) {
    return apiError(error);
  }
}
