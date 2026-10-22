import { NextRequest } from 'next/server';
import { requireRole } from '@/modules/auth/permissions';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { AssignmentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['DELIVERY_STAFF', 'SUPER_ADMIN']);

    const [user, assignments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.deliveryAssignment.findMany({
        where: { riderId: session.userId },
        select: { status: true },
      }),
    ]);

    const activeStatuses: AssignmentStatus[] = [
      AssignmentStatus.ASSIGNED,
      AssignmentStatus.ACCEPTED,
      AssignmentStatus.PICKED_UP,
    ];

    const activeAssignments = assignments.filter((a) => activeStatuses.includes(a.status)).length;

    const completedDeliveries = assignments.filter(
      (a) => a.status === AssignmentStatus.DELIVERED
    ).length;

    return apiSuccess({
      rider: user,
      metrics: {
        activeAssignments,
        completedDeliveries,
        totalAssigned: assignments.length,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
