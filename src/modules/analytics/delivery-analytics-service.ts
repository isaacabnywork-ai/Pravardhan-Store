import { prisma } from '@/lib/prisma';
import { Role, AssignmentStatus } from '@prisma/client';
import { ValidatedAnalyticsQuery, resolveDateRange } from './analytics-validation';
import { RiderEfficiencyStat } from './analytics-types';

export class DeliveryAnalyticsService {
  /**
   * Evaluates Rider & Logistics efficiency with explicit target SLA
   */
  async getDeliveryReport(query: ValidatedAnalyticsQuery): Promise<RiderEfficiencyStat[]> {
    const { start, end } = resolveDateRange(query);

    const riders = await prisma.user.findMany({
      where: {
        role: Role.DELIVERY_STAFF,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        riderAssignments: {
          where: {
            assignedAt: {
              gte: start,
              lte: end,
            },
          },
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

    // Invariant: Target SLA of 30 minutes (1800000 ms)
    const SLA_LIMIT_MINUTES = 30;

    return riders.map((rider) => {
      const assignments = rider.riderAssignments;
      const totalAssignments = assignments.length;

      let deliveredCount = 0;
      let failedCount = 0;
      let activeCount = 0;
      let cancelledCount = 0;
      let onTimeDeliveries = 0;
      const durations: number[] = [];

      for (const a of assignments) {
        if (a.status === AssignmentStatus.DELIVERED) {
          deliveredCount++;
          if (a.assignedAt && a.deliveredAt) {
            const durationMins = (a.deliveredAt.getTime() - a.assignedAt.getTime()) / (1000 * 60);
            if (durationMins >= 0) {
              durations.push(durationMins);
              if (durationMins <= SLA_LIMIT_MINUTES) {
                onTimeDeliveries++;
              }
            }
          }
        } else if (a.status === AssignmentStatus.FAILED) {
          failedCount++;
        } else if (a.status === AssignmentStatus.REJECTED) {
          cancelledCount++;
        } else {
          activeCount++;
        }
      }

      const avgDuration =
        durations.length > 0
          ? Math.round(durations.reduce((acc, d) => acc + d, 0) / durations.length)
          : null;

      const onTimeRate =
        deliveredCount > 0 ? Math.round((onTimeDeliveries / deliveredCount) * 100) : null;

      return {
        riderId: rider.id,
        riderName: rider.name,
        phone: rider.phone ? `${rider.phone.slice(0, 3)}****${rider.phone.slice(-3)}` : 'N/A', // Privacy-safe masked phone
        isActive: rider.isActive,
        totalAssignments,
        deliveredCount,
        failedCount,
        activeCount,
        cancelledCount,
        onTimeDeliveries,
        onTimeRatePercent: onTimeRate,
        averageDeliveryDurationMinutes: avgDuration,
        riderEarningsPaise: 'NOT_CONFIGURED', // Invariant: Rider earnings remain NOT_CONFIGURED when commission policy is absent
      };
    });
  }
}

export const deliveryAnalyticsService = new DeliveryAnalyticsService();
