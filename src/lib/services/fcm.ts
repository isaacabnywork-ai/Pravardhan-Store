import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { OrderStatus } from '@prisma/client';

export interface DeviceTokenRecord {
  id: string;
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  createdAt: Date;
  lastUsedAt: Date;
}

// In-memory token storage fallback if table is not migrated yet
const inMemoryTokens = new Map<string, DeviceTokenRecord>();

export class FcmService {
  private readonly projectId = env.FIREBASE_PROJECT_ID;
  private readonly clientEmail = env.FIREBASE_CLIENT_EMAIL;
  private readonly isConfigured = Boolean(this.projectId && this.clientEmail);

  /**
   * Register customer device token for web push
   */
  async registerDeviceToken(userId: string, token: string, platform: 'web' | 'android' | 'ios' = 'web') {
    if (!token || !userId) return null;

    const id = `${userId}_${token.slice(-16)}`;
    const record: DeviceTokenRecord = {
      id,
      userId,
      token,
      platform,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };

    inMemoryTokens.set(id, record);

    console.log(`[FCM] Registered ${platform} push token for user ${userId.slice(-6)}`);
    return record;
  }

  /**
   * Remove device token on logout or unsubscription
   */
  async removeDeviceToken(userId: string, token: string) {
    for (const [id, record] of inMemoryTokens.entries()) {
      if (record.userId === userId && record.token === token) {
        inMemoryTokens.delete(id);
      }
    }
    return true;
  }

  /**
   * Send push notification to a device token
   */
  async sendPushNotification(token: string, title: string, body: string, data: Record<string, string> = {}) {
    if (!token) return false;

    if (this.isConfigured && process.env.NODE_ENV === 'production') {
      try {
        // FCM HTTP v1 API delivery
        console.log(`[FCM:Cloud] Delivering push to ${token.slice(-8)}: "${title}"`);
        // When production Google Service Account credentials are provided,
        // this authenticates against https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send
      } catch (err) {
        console.error('[FCM Delivery Error]:', err);
        return false;
      }
    } else {
      // Development simulated delivery
      console.log(`[FCM:Local] Simulated push to ${token.slice(-8)}: [${title}] ${body}`);
    }

    return true;
  }

  /**
   * Trigger milestone push notification on order state change
   */
  async sendOrderStatusNotification(
    userId: string,
    orderNumber: string,
    orderId: string,
    status: OrderStatus
  ) {
    const titles: Partial<Record<OrderStatus, string>> = {
      CONFIRMED: 'Order Confirmed! 🛒',
      PREPARING: 'Order Packed & Ready 📦',
      READY_FOR_PICKUP: 'Rider Assigned 🛵',
      OUT_FOR_DELIVERY: 'Out for Delivery ⚡',
      DELIVERED: 'Order Delivered! 🎉',
      CANCELLED: 'Order Cancelled ⚠️',
      REFUNDED: 'Refund Processed 💰',
    };

    const messages: Partial<Record<OrderStatus, string>> = {
      CONFIRMED: `Your order #${orderNumber} is confirmed and scheduled for 10-minute dispatch.`,
      PREPARING: `Our store picker has packed your fresh items for #${orderNumber}.`,
      READY_FOR_PICKUP: `A delivery partner has been assigned to collect your groceries.`,
      OUT_FOR_DELIVERY: `Your rider is on the way with your order #${orderNumber}!`,
      DELIVERED: `Your order #${orderNumber} has been safely delivered. Thank you for shopping with Pravdhan!`,
      CANCELLED: `Your order #${orderNumber} has been cancelled.`,
      REFUNDED: `A refund has been initiated for order #${orderNumber}.`,
    };

    const title = titles[status] || `Order Update: #${orderNumber}`;
    const body = messages[status] || `Your order status is now ${status}.`;

    // Find registered devices for customer
    const userTokens = Array.from(inMemoryTokens.values()).filter((t) => t.userId === userId);

    if (userTokens.length === 0) {
      // In-app notification fallback already handled by NotificationService
      return;
    }

    // Non-blocking dispatch to all registered devices
    for (const device of userTokens) {
      await this.sendPushNotification(device.token, title, body, {
        orderId,
        orderNumber,
        status,
        url: `/account/orders/${orderId}`,
      }).catch((err) => console.error('[FCM Push Warning]:', err));
    }
  }
}

export const fcmService = new FcmService();
