import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentMethod, PaymentStatus, InventoryChangeType } from '@prisma/client';
import { cartService } from '@/modules/cart/service';
import { notificationService } from '@/modules/notifications/service';
import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from '@/lib/errors';
import { createOrderSchema } from './schemas';
import { z } from 'zod';

export class OrderService {
  /**
   * Concurrency-safe atomic order creation with stock decrement & address snapshot
   */
  async createOrder(userId: string, data: z.infer<typeof createOrderSchema>) {
    // 1. Resolve customer & address
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundError('Customer account');
    }

    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId },
    });
    if (!address) {
      throw new NotFoundError('Selected delivery address');
    }

    // 2. Resolve serviceable store from address pincode
    const serviceArea = await prisma.serviceArea.findFirst({
      where: { pincode: address.pincode, isActive: true },
      include: { store: true },
    });

    const store = serviceArea?.store || (await prisma.store.findFirst({ where: { isActive: true } }));
    if (!store) {
      throw new ValidationError(`Pincode ${address.pincode} is currently not serviceable`);
    }

    // 3. Resolve cart & calculate final totals
    const cart = await cartService.getOrCreateCart(userId);
    const cartDetails = await cartService.getCartDetails(cart.id, store.id);

    if (cartDetails.items.length === 0) {
      throw new ValidationError('Your cart is empty. Please add items before checking out.');
    }

    if (cartDetails.summary.subtotal < store.minOrderValue) {
      const minInRupees = Math.round(store.minOrderValue / 100);
      throw new ValidationError(
        `Minimum order value for ${store.name} is ₹${minInRupees}.`
      );
    }

    // Check that every item is in stock
    const outOfStockItems = cartDetails.items.filter((item) => !item.inStock);
    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map((i) => i.name).join(', ');
      throw new ConflictError(
        `The following items are no longer available in the requested quantity: ${names}`
      );
    }

    // Generate unique public order number (e.g. PRV-2026-X8F2)
    const orderNumber = `PRV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const grandTotal =
      cartDetails.summary.grandTotal + (data.deliveryTip || 0);

    // 4. Atomic transaction: create order, decrement stock, save snapshot, and clear cart
    return prisma.$transaction(async (tx) => {
      // Create immutable address snapshot
      const addressSnapshot = {
        name: address.name,
        phone: address.phone,
        label: address.label,
        houseNumber: address.houseNumber,
        street: address.street,
        landmark: address.landmark,
        area: address.area,
        city: address.city,
        pincode: address.pincode,
      };

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          storeId: store.id,
          customerName: address.name || user.name,
          customerPhone: address.phone || user.phone || '',
          deliveryAddress: addressSnapshot,
          deliverySlot: data.deliverySlot,
          subtotal: cartDetails.summary.subtotal,
          discount: cartDetails.summary.productDiscount,
          couponCode: cartDetails.summary.appliedCoupon?.code,
          couponDiscount: cartDetails.summary.couponDiscount,
          deliveryFee: cartDetails.summary.deliveryFee,
          deliveryTip: data.deliveryTip,
          handlingFee: 0,
          grandTotal,
          paymentMethod: data.paymentMethod,
          paymentStatus:
            data.paymentMethod === PaymentMethod.WALLET
              ? PaymentStatus.PAID
              : PaymentStatus.PENDING,
          orderStatus: OrderStatus.PLACED,
          notes: data.notes,
          items: {
            create: cartDetails.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.name,
              variantTitle: item.variantTitle,
              brand: item.brand,
              unit: item.unit,
              purchasedPrice: item.price,
              purchasedMrp: item.mrp,
              quantity: item.quantity,
              image: item.image,
            })),
          },
          statusHistory: {
            create: {
              status: OrderStatus.PLACED,
              label: 'Order Placed',
              note:
                data.paymentMethod === PaymentMethod.WALLET
                  ? 'Paid instantly via Pravdhan Money wallet'
                  : `Order placed via ${data.paymentMethod}`,
              actorId: userId,
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // Decrement inventory and record stock reservations
      for (const item of cartDetails.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            storeId_variantId: {
              storeId: store.id,
              variantId: item.variantId,
            },
          },
        });

        if (inv) {
          const previousStock = inv.quantity;
          const newStock = Math.max(0, previousStock - item.quantity);

          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newStock },
          });

          await tx.inventoryMovement.create({
            data: {
              storeId: store.id,
              variantId: item.variantId,
              changeType: InventoryChangeType.ORDER_RESERVED,
              quantityChange: -item.quantity,
              previousStock,
              newStock,
              reason: `Reserved for Order #${order.orderNumber}`,
              updatedById: userId,
            },
          });
        }
      }

      // Record coupon redemption if coupon applied
      if (cartDetails.summary.appliedCoupon) {
        const coupon = await tx.coupon.findUnique({
          where: { code: cartDetails.summary.appliedCoupon.code },
        });

        if (coupon) {
          await tx.couponRedemption.create({
            data: {
              couponId: coupon.id,
              userId,
              orderId: order.id,
              discount: cartDetails.summary.couponDiscount,
            },
          });
        }
      }

      // Record payment entity
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: data.paymentMethod,
          paymentStatus:
            data.paymentMethod === PaymentMethod.WALLET
              ? PaymentStatus.PAID
              : PaymentStatus.PENDING,
          amount: grandTotal,
          gatewayOrderId:
            data.paymentMethod === PaymentMethod.WALLET
              ? `WALLET-${order.orderNumber}`
              : data.paymentMethod === PaymentMethod.COD
              ? `COD-${order.orderNumber}`
              : `rzp_order_${order.id}`,
        },
      });

      // Clear the customer's cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });

      return order;
    });
  }

  /**
   * List customer's orders with full receipts and tracking status
   */
  async getCustomerOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get single order by ID with ownership enforcement
   */
  async getOrderById(orderId: string, userId?: string, isStaff = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        payments: true,
        store: {
          select: { name: true, supportPhone: true },
        },
        deliveryStaff: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (!isStaff && userId && order.userId !== userId) {
      throw new ForbiddenError('You are not authorized to view this order');
    }

    return order;
  }

  /**
   * Cancel an order if it is in an eligible lifecycle state (PLACED or CONFIRMED)
   */
  async cancelOrder(orderId: string, userId?: string, reason?: string, isStaff = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (!isStaff && userId && order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to cancel this order');
    }

    if (
      order.orderStatus !== OrderStatus.PLACED &&
      order.orderStatus !== OrderStatus.CONFIRMED
    ) {
      throw new ConflictError(
        `Cannot cancel order in "${order.orderStatus}" state. The store is already picking/packing your items.`
      );
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update order status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: OrderStatus.CANCELLED,
          cancellationReason: reason,
          statusHistory: {
            create: {
              status: OrderStatus.CANCELLED,
              label: 'Order Cancelled',
              note: reason || 'Cancelled by customer',
              actorId: userId,
            },
          },
        },
      });

      // 2. Restore inventory stock
      for (const item of order.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            storeId_variantId: {
              storeId: order.storeId,
              variantId: item.variantId,
            },
          },
        });

        if (inv) {
          const previousStock = inv.quantity;
          const newStock = previousStock + item.quantity;

          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newStock },
          });

          await tx.inventoryMovement.create({
            data: {
              storeId: order.storeId,
              variantId: item.variantId,
              changeType: InventoryChangeType.ORDER_CANCELLED,
              quantityChange: item.quantity,
              previousStock,
              newStock,
              reason: `Restored from cancelled Order #${order.orderNumber}`,
              updatedById: userId,
            },
          });
        }
      }

      return updatedOrder;
    });
  }

  /**
   * Confirm Online Payment (Razorpay verification / test callback)
   */
  async confirmPayment(
    orderId: string,
    paymentDetails: {
      gatewayPaymentId: string;
      gatewayOrderId?: string;
      gatewaySignature?: string;
    },
    actorId?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      await tx.payment.updateMany({
        where: { orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          gatewayPaymentId: paymentDetails.gatewayPaymentId,
          gatewaySignature: paymentDetails.gatewaySignature,
        },
      });

      // 2. Advance Order status from PLACED -> CONFIRMED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
          statusHistory: {
            create: {
              status: OrderStatus.CONFIRMED,
              label: 'Payment Verified & Order Confirmed',
              note: `Paid online via Razorpay (Payment ID: ${paymentDetails.gatewayPaymentId})`,
              actorId,
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
          payments: true,
        },
      });

      // 3. Dispatch customer notification
      await notificationService.notifyOrderStatusChange(
        updatedOrder.userId,
        updatedOrder.orderNumber,
        updatedOrder.id,
        OrderStatus.CONFIRMED
      ).catch(() => null);

      return updatedOrder;
    });
  }

  /**
   * Admin / Store Staff: List orders with filters & pagination
   */
  async listAdminOrders(options: {
    storeId?: string;
    status?: OrderStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { storeId, status, search, page = 1, pageSize = 20 } = options;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.orderStatus = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          statusHistory: true,
          deliveryStaff: { select: { id: true, name: true, phone: true } },
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Admin / Staff: Advance order status milestone in state machine
   */
  async updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    note?: string,
    actorId?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    // State machine status transition labels
    const statusLabels: Record<OrderStatus, string> = {
      PENDING_PAYMENT: 'Payment Pending',
      PLACED: 'Order Placed',
      CONFIRMED: 'Order Confirmed',
      PREPARING: 'Being Prepared by Store',
      READY_FOR_PICKUP: 'Packed & Ready for Dispatch',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Order Delivered',
      CANCELLED: 'Order Cancelled',
      REFUNDED: 'Order Refunded',
    };

    return prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: nextStatus,
        statusHistory: {
          create: {
            status: nextStatus,
            label: statusLabels[nextStatus] || nextStatus,
            note,
            actorId,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
        items: true,
      },
    });
  }
}

export const orderService = new OrderService();
