import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { apiSuccess, apiError } from '@/lib/api-response';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // Verify webhook signature if secret is configured
    if (env.RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('❌ Invalid Razorpay webhook signature');
        return apiError(new Error('Invalid signature'));
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return apiSuccess({ received: true });
    }

    const gatewayPaymentId = paymentEntity.id;
    const gatewayOrderId = paymentEntity.order_id;

    // Idempotent processing: find payment by gateway order or ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { gatewayOrderId },
          { gatewayPaymentId },
        ],
      },
      include: { order: true },
    });

    if (!payment) {
      console.warn(`[Razorpay Webhook]: No matching payment found for order ${gatewayOrderId}`);
      return apiSuccess({ received: true, note: 'unmatched_payment' });
    }

    // Process event idempotently
    if (event === 'payment.captured' || event === 'payment.authorized') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            gatewayPaymentId,
            gatewayRawResponse: paymentEntity,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            orderStatus: OrderStatus.CONFIRMED,
            statusHistory: {
              create: {
                status: OrderStatus.CONFIRMED,
                label: 'Payment Verified & Order Confirmed',
                note: `Paid online via Razorpay (Payment ID: ${gatewayPaymentId})`,
              },
            },
          },
        }),
      ]);
    } else if (event === 'payment.failed') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          gatewayPaymentId,
          gatewayRawResponse: paymentEntity,
        },
      });
    }

    return apiSuccess({ received: true, event });
  } catch (error) {
    return apiError(error);
  }
}
