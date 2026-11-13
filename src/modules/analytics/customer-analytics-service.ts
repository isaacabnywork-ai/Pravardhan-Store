import { prisma } from '@/lib/prisma';
import { Role, OrderStatus } from '@prisma/client';
import { ValidatedAnalyticsQuery, resolveDateRange } from './analytics-validation';
import { analyticsQueryService } from './analytics-query-service';
import { CustomerCrmReport } from './analytics-types';

export class CustomerAnalyticsService {
  /**
   * Generates Customer CRM & Cohort analytics without exposing sensitive PII
   */
  async getCustomerReport(query: ValidatedAnalyticsQuery): Promise<CustomerCrmReport> {
    const { days } = resolveDateRange(query);

    // Retrieve customers with their order history
    const customers = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            grandTotal: true,
            orderStatus: true,
            createdAt: true,
          },
        },
      },
    });

    let newCustomers = 0;
    let repeatCustomers = 0;
    let totalSpendPaise = 0;

    const cohortMap: Record<string, { newUsers: number; activeInPeriod: number }> = {};

    for (const customer of customers) {
      // Invariant: Privacy Protection - no passwords, OTPs, or auth tokens exposed
      const validOrders = customer.orders.filter(
        (o) => o.orderStatus !== OrderStatus.CANCELLED && o.orderStatus !== OrderStatus.REFUNDED
      );

      const customerSpend = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      totalSpendPaise += customerSpend;

      if (validOrders.length === 1) {
        newCustomers++;
      } else if (validOrders.length > 1) {
        repeatCustomers++;
      }

      // Cohort month assignment (YYYY-MM)
      const cohortMonth = customer.createdAt.toISOString().slice(0, 7);
      if (!cohortMap[cohortMonth]) {
        cohortMap[cohortMonth] = { newUsers: 0, activeInPeriod: 0 };
      }
      cohortMap[cohortMonth].newUsers++;
      if (validOrders.length > 0) {
        cohortMap[cohortMonth].activeInPeriod++;
      }
    }

    const totalCustomersWithOrders = newCustomers + repeatCustomers;
    const repeatRate =
      totalCustomersWithOrders > 0
        ? Math.round((repeatCustomers / totalCustomersWithOrders) * 100)
        : 0;

    const avgClv =
      customers.length > 0 ? Math.round(totalSpendPaise / customers.length) : 0;

    const cohorts = Object.entries(cohortMap).map(([cohortMonth, data]) => ({
      cohortMonth,
      newUsers: data.newUsers,
      activeInPeriod: data.activeInPeriod,
      retentionRatePercent:
        data.newUsers > 0 ? Math.round((data.activeInPeriod / data.newUsers) * 100) : 0,
    }));

    return {
      periodDays: days,
      totalCustomers: customers.length,
      newCustomers,
      repeatCustomers,
      repeatPurchaseRatePercent: repeatRate,
      averageCustomerLifetimeValuePaise: avgClv,
      formattedAverageClv: analyticsQueryService.formatPaiseToInr(avgClv),
      cohorts,
    };
  }
}

export const customerAnalyticsService = new CustomerAnalyticsService();
