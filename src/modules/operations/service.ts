import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  OrderStatus,
  AssignmentStatus,
  PaymentStatus,
  Role,
} from '@prisma/client';
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors';
import { createStaffSchema, updateStaffSchema } from './schemas';
import { notificationService } from '@/modules/notifications/service';
import { z } from 'zod';

export class OperationsService {
  /**
   * Super Admin Dashboard: Consolidated business & operational metrics
   */
  async getDashboardMetrics(storeId?: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      allOrders,
      todayOrders,
      inventoryItems,
      lowStockCount,
      activeStoresCount,
    ] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          grandTotal: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: {
          ...where,
          createdAt: { gte: startOfToday },
        },
        select: { grandTotal: true, orderStatus: true, paymentStatus: true },
      }),
      prisma.inventory.count(),
      prisma.inventory.count({
        where: {
          quantity: { lte: 5 },
        },
      }),
      prisma.store.count({ where: { isActive: true } }),
    ]);

    // Financial totals
    const completedOrders = allOrders.filter(
      (o) => o.orderStatus === OrderStatus.DELIVERED || o.paymentStatus === PaymentStatus.PAID
    );
    const totalRevenuePaise = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    const todayDeliveredOrPaid = todayOrders.filter(
      (o) => o.orderStatus === OrderStatus.DELIVERED || o.paymentStatus === PaymentStatus.PAID
    );
    const todayRevenuePaise = todayDeliveredOrPaid.reduce((sum, o) => sum + o.grandTotal, 0);

    const pendingStatuses: OrderStatus[] = [
      OrderStatus.PLACED,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
    ];
    const pendingOrdersCount = allOrders.filter((o) =>
      pendingStatuses.includes(o.orderStatus)
    ).length;

    const activeFulfillmentStatuses: OrderStatus[] = [
      OrderStatus.READY_FOR_PICKUP,
      OrderStatus.OUT_FOR_DELIVERY,
    ];
    const activeFulfillmentCount = allOrders.filter((o) =>
      activeFulfillmentStatuses.includes(o.orderStatus)
    ).length;

    const deliveredCount = allOrders.filter((o) => o.orderStatus === OrderStatus.DELIVERED).length;
    const cancelledCount = allOrders.filter((o) => o.orderStatus === OrderStatus.CANCELLED).length;

    const aovPaise = completedOrders.length > 0
      ? Math.round(totalRevenuePaise / completedOrders.length)
      : 0;

    return {
      revenue: {
        total: totalRevenuePaise,
        today: todayRevenuePaise,
        formattedTotal: `₹${(totalRevenuePaise / 100).toFixed(2)}`,
        formattedToday: `₹${(todayRevenuePaise / 100).toFixed(2)}`,
        currency: 'INR',
      },
      orders: {
        totalCount: allOrders.length,
        todayCount: todayOrders.length,
        pendingCount: pendingOrdersCount,
        activeFulfillmentCount,
        deliveredCount,
        cancelledCount,
        aov: aovPaise,
        formattedAov: `₹${(aovPaise / 100).toFixed(2)}`,
      },
      inventory: {
        totalSkus: inventoryItems,
        lowStockItems: lowStockCount,
      },
      stores: {
        activeCount: activeStoresCount,
      },
    };
  }

  /**
   * Staff Management
   */
  async listStaff(_storeId?: string) {
    return prisma.user.findMany({
      where: {
        role: { not: Role.CUSTOMER },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(data: z.infer<typeof createStaffSchema>, actorId?: string) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existing) {
      throw new ConflictError('A staff member with this email or phone number already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const staff = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        role: data.role,
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorId,
          action: 'STAFF_CREATED',
          entity: 'User',
          entityId: staff.id,
          details: { name: staff.name, email: staff.email, role: staff.role },
        },
      }).catch(() => null);
    }

    return staff;
  }

  async updateStaff(
    staffId: string,
    data: z.infer<typeof updateStaffSchema>,
    actorId?: string
  ) {
    const staff = await prisma.user.update({
      where: { id: staffId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorId,
          action: 'STAFF_UPDATED',
          entity: 'User',
          entityId: staffId,
          details: data,
        },
      }).catch(() => null);
    }

    return staff;
  }

  /**
   * Store Manager: Picking & packing order queue
   */
  async getStoreFulfillmentQueue(storeId?: string) {
    const targetStore = storeId
      ? await prisma.store.findUnique({ where: { id: storeId } })
      : await prisma.store.findFirst();

    if (!targetStore) {
      throw new NotFoundError('Store');
    }

    return prisma.order.findMany({
      where: {
        storeId: targetStore.id,
        orderStatus: {
          in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING],
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markOrderPreparing(orderId: string, actorId?: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.PREPARING,
        statusHistory: {
          create: {
            status: OrderStatus.PREPARING,
            label: 'Being Prepared by Store',
            note: 'Picking & packing in progress',
            actorId,
          },
        },
      },
    });

    await notificationService.notifyOrderStatusChange(
      order.userId,
      order.orderNumber,
      order.id,
      OrderStatus.PREPARING
    ).catch(() => null);

    return order;
  }

  async markOrderReady(orderId: string, actorId?: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.READY_FOR_PICKUP,
        statusHistory: {
          create: {
            status: OrderStatus.READY_FOR_PICKUP,
            label: 'Packed & Ready for Dispatch',
            note: 'Order packed in sealed bags and transferred to dispatch counter',
            actorId,
          },
        },
      },
    });

    await notificationService.notifyOrderStatusChange(
      order.userId,
      order.orderNumber,
      order.id,
      OrderStatus.READY_FOR_PICKUP
    ).catch(() => null);

    return order;
  }

  /**
   * Order Manager / Dispatch: Dispatch queue & Rider assignment
   */
  async getDispatchQueue(storeId?: string) {
    const where: any = {
      orderStatus: OrderStatus.READY_FOR_PICKUP,
    };
    if (storeId) where.storeId = storeId;

    return prisma.order.findMany({
      where,
      include: {
        items: true,
        deliveryAssignments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listAvailableRiders() {
    return prisma.user.findMany({
      where: {
        role: Role.DELIVERY_STAFF,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async assignRider(orderId: string, riderId: string, notes?: string, actorId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundError('Order');
    }

    const rider = await prisma.user.findFirst({
      where: { id: riderId, role: Role.DELIVERY_STAFF, isActive: true },
    });
    if (!rider) {
      throw new NotFoundError('Delivery Staff / Rider');
    }

    // Generate 4-digit customer delivery OTP (e.g. "4829")
    const customerOtp = Math.floor(1000 + Math.random() * 9000).toString();

    return prisma.$transaction(async (tx) => {
      // 1. Create delivery assignment
      const assignment = await tx.deliveryAssignment.create({
        data: {
          orderId,
          riderId,
          status: AssignmentStatus.ASSIGNED,
          customerOtp,
          notes,
        },
      });

      // 2. Update order status and assigned staff
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryStaffId: riderId,
          orderStatus: OrderStatus.OUT_FOR_DELIVERY,
          statusHistory: {
            create: {
              status: OrderStatus.OUT_FOR_DELIVERY,
              label: 'Out for Delivery',
              note: `Assigned to rider ${rider.name} (${rider.phone}). Delivery OTP: ${customerOtp}`,
              actorId,
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
          deliveryAssignments: true,
        },
      });

      await notificationService.notifyOrderStatusChange(
        updatedOrder.userId,
        updatedOrder.orderNumber,
        updatedOrder.id,
        OrderStatus.OUT_FOR_DELIVERY,
        `Rider: ${rider.name} (${rider.phone}). Share OTP ${customerOtp} upon arrival.`
      ).catch(() => null);

      return {
        assignment,
        order: updatedOrder,
      };
    });
  }

  /**
   * Rider Workflow
   */
  async getRiderAssignments(riderId: string) {
    return prisma.deliveryAssignment.findMany({
      where: { riderId },
      include: {
        order: {
          include: {
            items: true,
            store: { select: { name: true, address: true, supportPhone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptAssignment(assignmentId: string, riderId: string) {
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { id: assignmentId, riderId },
    });
    if (!assignment) {
      throw new NotFoundError('Delivery assignment');
    }

    return prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });
  }

  async confirmPickup(assignmentId: string, riderId: string) {
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { id: assignmentId, riderId },
    });
    if (!assignment) {
      throw new NotFoundError('Delivery assignment');
    }

    return prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.PICKED_UP,
        pickedUpAt: new Date(),
      },
    });
  }

  async completeDelivery(assignmentId: string, riderId: string, enteredOtp: string) {
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { id: assignmentId, riderId },
      include: { order: true },
    });
    if (!assignment) {
      throw new NotFoundError('Delivery assignment');
    }

    if (assignment.customerOtp && assignment.customerOtp !== enteredOtp) {
      throw new ValidationError('Invalid Customer Delivery OTP. Please ask the customer for their 4-digit OTP.');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Mark assignment delivered
      const updatedAssignment = await tx.deliveryAssignment.update({
        where: { id: assignmentId },
        data: {
          status: AssignmentStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      // 2. Mark order DELIVERED
      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          orderStatus: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID, // Verified on delivery
          statusHistory: {
            create: {
              status: OrderStatus.DELIVERED,
              label: 'Delivered Successfully',
              note: `Delivered by rider. OTP verified.`,
              actorId: riderId,
            },
          },
        },
      });

      // 3. Mark payment PAID if COD
      await tx.payment.updateMany({
        where: { orderId: assignment.orderId },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      await notificationService.notifyOrderStatusChange(
        assignment.order.userId,
        assignment.order.orderNumber,
        assignment.order.id,
        OrderStatus.DELIVERED
      ).catch(() => null);

      return updatedAssignment;
    });
  }

  async failDelivery(assignmentId: string, riderId: string, reason: string, notes?: string) {
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { id: assignmentId, riderId },
    });
    if (!assignment) {
      throw new NotFoundError('Delivery assignment');
    }

    return prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.FAILED,
        failedAt: new Date(),
        failureReason: reason,
        notes,
      },
    });
  }
}

export const operationsService = new OperationsService();
