import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus, Role, AssignmentStatus } from '@prisma/client';

export class AnalyticsService {
  /**
   * Sales & Revenue Analytics (historical & daily)
   */
  async getSalesReport(storeId?: string, days = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const where: any = {
      createdAt: { gte: sinceDate },
    };
    if (storeId) where.storeId = storeId;

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        grandTotal: true,
        subtotal: true,
        discount: true,
        deliveryFee: true,
        deliveryTip: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        payments: {
          select: { paymentMethod: true, paymentStatus: true, amount: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const paidOrders = orders.filter(
      (o) => o.orderStatus === OrderStatus.DELIVERED || o.paymentStatus === PaymentStatus.PAID
    );

    const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalDiscountsPaise = paidOrders.reduce((sum, o) => sum + o.discount, 0);
    const aovPaise = paidOrders.length > 0 ? Math.round(totalRevenuePaise / paidOrders.length) : 0;

    // Daily breakdown
    const dailyMap: Record<string, { date: string; revenue: number; orderCount: number }> = {};
    for (const order of paidOrders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, revenue: 0, orderCount: 0 };
      }
      dailyMap[dateKey].revenue += order.grandTotal;
      dailyMap[dateKey].orderCount += 1;
    }

    // Payment method breakdown
    let codCount = 0;
    let onlineCount = 0;
    for (const order of orders) {
      const isCod = order.payments.some((p) => p.paymentMethod === 'COD');
      if (isCod) codCount++;
      else onlineCount++;
    }

    return {
      summary: {
        periodDays: days,
        totalOrders: orders.length,
        completedOrders: paidOrders.length,
        totalRevenuePaise,
        formattedTotalRevenue: `₹${(totalRevenuePaise / 100).toFixed(2)}`,
        totalDiscountsPaise,
        formattedTotalDiscounts: `₹${(totalDiscountsPaise / 100).toFixed(2)}`,
        averageOrderValuePaise: aovPaise,
        formattedAov: `₹${(aovPaise / 100).toFixed(2)}`,
      },
      paymentBreakdown: {
        cod: codCount,
        online: onlineCount,
      },
      dailyTrends: Object.values(dailyMap),
    };
  }

  /**
   * Inventory & Stock Valuation Analytics
   */
  async getInventoryReport(storeId?: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        variant: {
          select: {
            sku: true,
            price: true,
            mrp: true,
            unit: true,
            product: { select: { name: true, brand: true } },
          },
        },
      },
    });

    let totalValuationPaise = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let totalStockUnits = 0;

    const criticalItems: any[] = [];

    for (const item of inventory) {
      totalStockUnits += item.quantity;
      totalValuationPaise += item.quantity * item.variant.price;

      if (item.quantity === 0) {
        outOfStockCount++;
        criticalItems.push({
          sku: item.variant.sku,
          name: `${item.variant.product.name} (${item.variant.unit})`,
          quantity: 0,
          status: 'OUT_OF_STOCK',
        });
      } else if (item.quantity <= 5) {
        lowStockCount++;
        criticalItems.push({
          sku: item.variant.sku,
          name: `${item.variant.product.name} (${item.variant.unit})`,
          quantity: item.quantity,
          status: 'LOW_STOCK',
        });
      }
    }

    return {
      valuation: {
        totalSkus: inventory.length,
        totalUnits: totalStockUnits,
        totalValuationPaise,
        formattedValuation: `₹${(totalValuationPaise / 100).toFixed(2)}`,
      },
      health: {
        outOfStockCount,
        lowStockCount,
        healthyCount: inventory.length - (outOfStockCount + lowStockCount),
      },
      criticalItems: criticalItems.slice(0, 20),
    };
  }

  /**
   * Rider & Logistics Efficiency Analytics
   */
  async getRiderPerformanceReport() {
    const riders = await prisma.user.findMany({
      where: { role: Role.DELIVERY_STAFF },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        riderAssignments: {
          select: {
            id: true,
            status: true,
            assignedAt: true,
            deliveredAt: true,
            failedAt: true,
          },
        },
      },
    });

    return riders.map((rider) => {
      const total = rider.riderAssignments.length;
      const delivered = rider.riderAssignments.filter(
        (a) => a.status === AssignmentStatus.DELIVERED
      ).length;
      const failed = rider.riderAssignments.filter(
        (a) => a.status === AssignmentStatus.FAILED
      ).length;
      const active = rider.riderAssignments.filter(
        (a) =>
          a.status === AssignmentStatus.ASSIGNED ||
          a.status === AssignmentStatus.ACCEPTED ||
          a.status === AssignmentStatus.PICKED_UP
      ).length;

      // Calculate average turnaround in minutes for delivered orders
      const durations = rider.riderAssignments
        .filter((a) => a.status === AssignmentStatus.DELIVERED && a.deliveredAt && a.assignedAt)
        .map((a) => (a.deliveredAt!.getTime() - a.assignedAt.getTime()) / (1000 * 60));

      const avgTurnaroundMins =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : null;

      return {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        isActive: rider.isActive,
        stats: {
          totalAssigned: total,
          delivered,
          failed,
          active,
          successRate: total > 0 ? `${Math.round((delivered / total) * 100)}%` : 'N/A',
          avgTurnaroundMinutes: avgTurnaroundMins,
        },
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
