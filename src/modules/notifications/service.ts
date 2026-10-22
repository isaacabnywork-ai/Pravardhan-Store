import { prisma } from '@/lib/prisma';
import { NotificationChannel, OrderStatus } from '@prisma/client';

export interface SendNotificationInput {
  userId: string;
  title: string;
  message: string;
  channel?: NotificationChannel;
  orderId?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Dispatch a notification (records in DB and logs provider dispatch)
   */
  async sendNotification(input: SendNotificationInput) {
    const channel = input.channel || NotificationChannel.IN_APP;

    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        channel,
        orderId: input.orderId,
        metadata: input.metadata || {},
      },
    });

    // Simulated provider dispatch (SMS, Push, Email)
    if (channel === NotificationChannel.SMS || channel === NotificationChannel.PUSH) {
      console.log(`[NotificationService] Dispatched ${channel} to user ${input.userId}: "${input.title} - ${input.message}"`);
    }

    return notification;
  }

  /**
   * Get customer notifications
   */
  async getUserNotifications(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Helper to trigger notification on order status transition
   */
  async notifyOrderStatusChange(
    userId: string,
    orderNumber: string,
    orderId: string,
    status: OrderStatus,
    extraInfo?: string
  ) {
    const templates: Partial<Record<OrderStatus, { title: string; message: string }>> = {
      PENDING_PAYMENT: {
        title: 'Payment Pending',
        message: `Your order #${orderNumber} is awaiting payment confirmation.`,
      },
      PLACED: {
        title: 'Order Placed Successfully',
        message: `Your order #${orderNumber} has been received and is waiting for store confirmation.`,
      },
      CONFIRMED: {
        title: 'Order Confirmed',
        message: `Your order #${orderNumber} is confirmed and sent to our store for fulfillment.`,
      },
      PREPARING: {
        title: 'Packing Your Groceries',
        message: `Our store team is picking and packing the fresh items for order #${orderNumber}.`,
      },
      READY_FOR_PICKUP: {
        title: 'Order Packed & Ready',
        message: `Your order #${orderNumber} is sealed and waiting for rider pickup.`,
      },
      OUT_FOR_DELIVERY: {
        title: 'Out for Delivery 🛵',
        message: `Your order #${orderNumber} is on its way! ${extraInfo || ''}`,
      },
      DELIVERED: {
        title: 'Order Delivered 🎉',
        message: `Your order #${orderNumber} has been delivered. Thank you for shopping with Pravdhan Store!`,
      },
      CANCELLED: {
        title: 'Order Cancelled',
        message: `Your order #${orderNumber} has been cancelled. ${extraInfo || ''}`,
      },
      REFUNDED: {
        title: 'Refund Processed',
        message: `A refund for order #${orderNumber} has been initiated.`,
      },
    };

    const template = templates[status];
    if (!template) return null;

    return this.sendNotification({
      userId,
      title: template.title,
      message: template.message,
      channel: NotificationChannel.IN_APP,
      orderId,
      metadata: { status, orderNumber },
    });
  }
}

export const notificationService = new NotificationService();
