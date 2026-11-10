import { prisma } from '@/lib/prisma';
import { RefundStatus, RefundReason, PaymentStatus } from '@prisma/client';
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors';

export interface CreateRefundParams {
  orderId: string;
  paymentId: string;
  amountPaise: number;
  reason?: RefundReason;
  idempotencyKey?: string;
  notes?: string;
  gatewayRefundId?: string;
}

export class RefundService {
  /**
   * Concurrency-safe, atomic refund creation with refundable balance enforcement
   */
  async createRefund(params: CreateRefundParams) {
    const {
      orderId,
      paymentId,
      amountPaise,
      reason = RefundReason.CUSTOMER_CANCELLATION,
      idempotencyKey,
      notes,
      gatewayRefundId,
    } = params;

    if (amountPaise <= 0) {
      throw new ValidationError('Refund amount must be greater than zero');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Idempotency Check
      if (idempotencyKey) {
        const existing = await tx.refund.findUnique({
          where: { idempotencyKey },
        });
        if (existing) {
          return existing; // Idempotent return
        }
      }

      // 2. Validate Payment
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          refunds: {
            where: { status: { in: [RefundStatus.PROCESSED, RefundStatus.PENDING] } },
          },
        },
      });

      if (!payment) {
        throw new NotFoundError('Payment record');
      }

      if (payment.orderId !== orderId) {
        throw new ValidationError('Payment does not belong to the specified order');
      }

      if (payment.paymentStatus !== PaymentStatus.PAID) {
        throw new ConflictError(`Cannot refund payment in "${payment.paymentStatus}" state. Only PAID payments are refundable.`);
      }

      // 3. Calculate already refunded / pending amount
      const alreadyRefundedPaise = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
      const remainingRefundablePaise = payment.amount - alreadyRefundedPaise;

      if (amountPaise > remainingRefundablePaise) {
        throw new ConflictError(
          `Requested refund amount (₹${Math.round(amountPaise / 100)}) exceeds remaining refundable balance (₹${Math.round(
            remainingRefundablePaise / 100
          )}) on this payment.`
        );
      }

      // 4. Create Refund Record (default to PROCESSED if internal/wallet/direct, or PENDING if external gateway)
      const isGateway = Boolean(payment.gatewayPaymentId && !gatewayRefundId);
      const initialStatus = isGateway ? RefundStatus.PENDING : RefundStatus.PROCESSED;

      const refund = await tx.refund.create({
        data: {
          orderId,
          paymentId,
          amount: amountPaise,
          status: initialStatus,
          reason,
          gatewayRefundId: gatewayRefundId || (payment.gatewayPaymentId ? `rfnd_${Date.now()}` : undefined),
          idempotencyKey,
          notes,
          processedAt: initialStatus === RefundStatus.PROCESSED ? new Date() : null,
        },
      });

      // 5. If this refund completely covers the payment, update payment status to REFUNDED
      if (alreadyRefundedPaise + amountPaise >= payment.amount) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });
      }

      return refund;
    });
  }

  /**
   * Process refund webhook or callback from external gateway (e.g. Razorpay)
   */
  async processGatewayRefundWebhook(params: {
    gatewayRefundId: string;
    gatewayPaymentId: string;
    amountPaise: number;
    status: 'PROCESSED' | 'FAILED';
    rawResponse?: any;
    failureReason?: string;
  }) {
    const { gatewayRefundId, gatewayPaymentId, amountPaise, status, rawResponse, failureReason } = params;

    return prisma.$transaction(async (tx) => {
      // Find matching payment
      const payment = await tx.payment.findFirst({
        where: { gatewayPaymentId },
      });

      if (!payment) {
        console.warn(`[Refund Webhook] Payment not found for gatewayPaymentId: ${gatewayPaymentId}`);
        return null;
      }

      // Check if refund record already exists by gatewayRefundId
      let refund = await tx.refund.findFirst({
        where: { gatewayRefundId },
      });

      if (refund) {
        if (refund.status === RefundStatus.PROCESSED) {
          return refund; // Idempotent return
        }

        return tx.refund.update({
          where: { id: refund.id },
          data: {
            status: status === 'PROCESSED' ? RefundStatus.PROCESSED : RefundStatus.FAILED,
            processedAt: status === 'PROCESSED' ? new Date() : refund.processedAt,
            failedAt: status === 'FAILED' ? new Date() : refund.failedAt,
            failureReason: failureReason || refund.failureReason,
            rawGatewayResponse: rawResponse,
          },
        });
      }

      // Create new refund from webhook if missing
      refund = await tx.refund.create({
        data: {
          orderId: payment.orderId,
          paymentId: payment.id,
          amount: amountPaise,
          status: status === 'PROCESSED' ? RefundStatus.PROCESSED : RefundStatus.FAILED,
          reason: RefundReason.OTHER,
          gatewayRefundId,
          rawGatewayResponse: rawResponse,
          processedAt: status === 'PROCESSED' ? new Date() : null,
          failedAt: status === 'FAILED' ? new Date() : null,
          failureReason,
          notes: 'Created via Razorpay webhook',
        },
      });

      return refund;
    });
  }
}

export const refundService = new RefundService();
