import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { ValidatedAnalyticsQuery, resolveDateRange } from './analytics-validation';
import { analyticsQueryService } from './analytics-query-service';
import { SalesReportSummary } from './analytics-types';

export class SalesAnalyticsService {
  /**
   * Computes comprehensive Sales Report with strict financial disaggregation
   */
  async getSalesReport(query: ValidatedAnalyticsQuery): Promise<SalesReportSummary> {
    const { start, end, days } = resolveDateRange(query);
    const where = analyticsQueryService.buildOrderWhere(query);

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        discount: true,
        deliveryFee: true,
        deliveryTip: true,
        handlingFee: true,
        grandTotal: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            purchasedPrice: true,
            quantity: true,
          },
        },
        payments: {
          select: {
            paymentStatus: true,
            amount: true,
            paymentMethod: true,
          },
        },
        cashCollections: {
          select: {
            collectedAmount: true,
            collectionStatus: true,
          },
        },
      },
    });

    const totalOrders = orders.length;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let returnedOrders = 0;

    let gmvPaise = 0;
    let netSalesPaise = 0;
    let completedRevenuePaise = 0;
    let totalDiscountsPaise = 0;
    let deliveryChargesCollectedPaise = 0;
    let deliveryTipsCollectedPaise = 0;
    let handlingFeesCollectedPaise = 0;

    for (const order of orders) {
      if (order.orderStatus === OrderStatus.CANCELLED) {
        cancelledOrders++;
        continue; // Invariant 7: Cancelled orders are never counted as completed sales or GMV
      }

      if (order.orderStatus === OrderStatus.REFUNDED) {
        returnedOrders++;
      }

      // Calculate merchandise item total
      const merchandiseValue = order.items.reduce(
        (sum, item) => sum + item.purchasedPrice * item.quantity,
        0
      );

      // Invariant: GMV counts active and completed merchandise volume
      const isActiveOrCompleted = (
        [
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY_FOR_PICKUP,
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.DELIVERED,
        ] as OrderStatus[]
      ).includes(order.orderStatus);

      if (isActiveOrCompleted) {
        gmvPaise += merchandiseValue;
        totalDiscountsPaise += order.discount;

        // Invariant: Net Sales = merchandise value - discounts - refunded orders
        if (order.orderStatus !== OrderStatus.REFUNDED) {
          netSalesPaise += Math.max(0, merchandiseValue - order.discount);
        }
      }

      // Invariant: Completed Revenue represents physically collected funds
      // For prepaid (UPI/CARD/WALLET), requires PaymentStatus.PAID
      // For COD, strictly requires persisted CashCollection with collectedAmount > 0 (Rule A: Delivered != Collected)
      const isPaidPrepaid =
        order.paymentMethod !== 'COD' && order.paymentStatus === PaymentStatus.PAID;
      const verifiedCodCollection = order.cashCollections?.[0];
      const isVerifiedCollectedCod =
        order.paymentMethod === 'COD' &&
        Boolean(verifiedCodCollection && verifiedCodCollection.collectedAmount > 0);

      if ((isPaidPrepaid || isVerifiedCollectedCod) && order.orderStatus !== OrderStatus.REFUNDED) {
        completedOrders++;
        const revenueContribution = isVerifiedCollectedCod
          ? (verifiedCodCollection?.collectedAmount ?? order.grandTotal)
          : order.grandTotal;
        completedRevenuePaise += revenueContribution;
        deliveryChargesCollectedPaise += order.deliveryFee;
        deliveryTipsCollectedPaise += order.deliveryTip;
        handlingFeesCollectedPaise += order.handlingFee;
      }
    }

    const aovPaise =
      completedOrders > 0 ? Math.round(completedRevenuePaise / completedOrders) : 0;

    return {
      periodDays: days,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalOrders,
      completedOrders,
      cancelledOrders,
      returnedOrders,
      grossMerchandiseValuePaise: gmvPaise,
      netSalesPaise,
      completedRevenuePaise,
      totalDiscountsPaise,
      deliveryChargesCollectedPaise,
      deliveryTipsCollectedPaise,
      handlingFeesCollectedPaise,
      averageOrderValuePaise: aovPaise,
      formattedGmv: analyticsQueryService.formatPaiseToInr(gmvPaise),
      formattedNetSales: analyticsQueryService.formatPaiseToInr(netSalesPaise),
      formattedCompletedRevenue: analyticsQueryService.formatPaiseToInr(completedRevenuePaise),
      formattedTotalDiscounts: analyticsQueryService.formatPaiseToInr(totalDiscountsPaise),
      formattedAov: analyticsQueryService.formatPaiseToInr(aovPaise),
    };
  }
}

export const salesAnalyticsService = new SalesAnalyticsService();
