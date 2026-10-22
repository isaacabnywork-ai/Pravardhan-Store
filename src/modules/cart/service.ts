import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors';

export class CartService {
  /**
   * Resolve existing cart or create a new one (tied to user or guest session)
   */
  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      let userCart = await prisma.cart.findUnique({
        where: { userId },
      });
      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId },
        });
      }
      return userCart;
    }

    if (sessionId) {
      let sessionCart = await prisma.cart.findUnique({
        where: { sessionId },
      });
      if (!sessionCart) {
        sessionCart = await prisma.cart.create({
          data: { sessionId },
        });
      }
      return sessionCart;
    }

    // Fallback: create anonymous cart
    return prisma.cart.create({
      data: {},
    });
  }

  /**
   * Get full cart details with real-time recalculated prices, stock, and totals
   */
  async getCartDetails(cartId: string, storeId?: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true, brand: true, images: true },
                },
                inventory: storeId ? { where: { storeId } } : true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      throw new NotFoundError('Cart');
    }

    // Resolve store settings
    const store = storeId
      ? await prisma.store.findUnique({ where: { id: storeId } })
      : await prisma.store.findFirst();

    const minOrderValue = store?.minOrderValue ?? 10000; // 10000 paise = ₹100
    const defaultDeliveryFee = store?.deliveryFee ?? 0;
    const freeDeliveryThreshold = store?.freeDeliveryThreshold ?? 0;

    let subtotal = 0;
    let totalMrp = 0;

    const formattedItems = cart.items.map((item) => {
      const v = item.variant;
      const stockRecord = v.inventory?.[0];
      const availableStock = stockRecord
        ? Math.max(0, stockRecord.quantity - stockRecord.reservedQuantity)
        : 50;

      const itemMrpTotal = v.mrp * item.quantity;
      const itemPriceTotal = v.price * item.quantity;

      subtotal += itemPriceTotal;
      totalMrp += itemMrpTotal;

      return {
        id: item.id,
        variantId: v.id,
        productId: v.product.id,
        name: v.product.name,
        variantTitle: v.title,
        brand: v.product.brand,
        unit: v.unit,
        price: v.price, // in paise
        mrp: v.mrp,     // in paise
        image: v.image || v.product.images[0] || null,
        quantity: item.quantity,
        total: itemPriceTotal,
        inStock: availableStock >= item.quantity,
        availableStock,
      };
    });

    const productDiscount = Math.max(0, totalMrp - subtotal);

    // Validate and calculate coupon discount
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (cart.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cart.couponCode },
      });

      if (coupon && coupon.isActive && coupon.validTill > new Date()) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            const rawDiscount = Math.round((subtotal * coupon.discountValue) / 100);
            couponDiscount = coupon.maxDiscount
              ? Math.min(rawDiscount, coupon.maxDiscount)
              : rawDiscount;
          } else {
            couponDiscount = coupon.discountValue;
          }

          appliedCoupon = {
            code: coupon.code,
            title: coupon.title,
            discount: couponDiscount,
          };
        } else {
          // Subtotal fell below coupon minOrderValue
          await prisma.cart.update({
            where: { id: cart.id },
            data: { couponCode: null },
          });
        }
      } else {
        // Expired or invalid coupon
        await prisma.cart.update({
          where: { id: cart.id },
          data: { couponCode: null },
        });
      }
    }

    const deliveryFee =
      freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold
        ? 0
        : defaultDeliveryFee;

    const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

    return {
      id: cart.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      summary: {
        totalMrp,
        subtotal,
        productDiscount,
        couponDiscount,
        deliveryFee,
        grandTotal,
        currency: 'INR',
        appliedCoupon,
        isEligibleForCheckout: subtotal >= minOrderValue && formattedItems.length > 0,
        minOrderValue,
      },
    };
  }

  /**
   * Add variant to cart with real-time stock ceiling check
   */
  async addItem(cartId: string, variantId: string, quantity = 1, storeId?: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        inventory: storeId ? { where: { storeId } } : true,
      },
    });

    if (!variant || !variant.isActive) {
      throw new NotFoundError('Product variant is not available');
    }

    const stockRecord = variant.inventory?.[0];
    const availableStock = stockRecord
      ? Math.max(0, stockRecord.quantity - stockRecord.reservedQuantity)
      : 50;

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > availableStock) {
      throw new ConflictError(
        `Only ${availableStock} units of "${variant.title}" are available in stock`
      );
    }

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId,
        variantId,
        quantity,
      },
    });
  }

  /**
   * Update quantity of a cart item
   */
  async updateItemQuantity(cartId: string, cartItemId: string, quantity: number, storeId?: string) {
    if (quantity <= 0) {
      return this.removeItem(cartId, cartItemId);
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId },
      include: {
        variant: {
          include: {
            inventory: storeId ? { where: { storeId } } : true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Cart item');
    }

    const stockRecord = item.variant.inventory?.[0];
    const availableStock = stockRecord
      ? Math.max(0, stockRecord.quantity - stockRecord.reservedQuantity)
      : 50;

    if (quantity > availableStock) {
      throw new ConflictError(
        `Only ${availableStock} units available for this item`
      );
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, cartItemId: string) {
    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId },
    });

    if (!item) {
      throw new NotFoundError('Cart item');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { success: true };
  }

  /**
   * Clear all items in cart
   */
  async clearCart(cartId: string) {
    await prisma.cartItem.deleteMany({
      where: { cartId },
    });
    await prisma.cart.update({
      where: { id: cartId },
      data: { couponCode: null },
    });
    return { success: true };
  }

  /**
   * Apply a promotional coupon
   */
  async applyCoupon(cartId: string, code: string, userId?: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new ValidationError(`Coupon code "${code}" is invalid or inactive`);
    }

    if (coupon.validTill < new Date()) {
      throw new ValidationError(`Coupon code "${code}" has expired`);
    }

    // Check per-user redemption limit if user is authenticated
    if (userId) {
      const userRedemptions = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });
      if (userRedemptions >= coupon.perUserLimit) {
        throw new ValidationError(`You have already redeemed this coupon`);
      }
    }

    // Check cart subtotal against coupon minOrderValue
    const cartDetails = await this.getCartDetails(cartId);
    if (cartDetails.summary.subtotal < coupon.minOrderValue) {
      const minInRupees = Math.round(coupon.minOrderValue / 100);
      throw new ValidationError(
        `Coupon "${code}" is valid on minimum orders of ₹${minInRupees}. Add more items to apply!`
      );
    }

    await prisma.cart.update({
      where: { id: cartId },
      data: { couponCode: coupon.code },
    });

    return this.getCartDetails(cartId);
  }

  /**
   * Remove applied coupon
   */
  async removeCoupon(cartId: string) {
    await prisma.cart.update({
      where: { id: cartId },
      data: { couponCode: null },
    });
    return this.getCartDetails(cartId);
  }

  /**
   * Merge guest session cart items into customer cart after login
   */
  async mergeGuestCart(userId: string, guestSessionId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId: guestSessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      await this.addItem(userCart.id, item.variantId, item.quantity);
    }

    // Delete guest cart after merge
    await prisma.cart.delete({ where: { id: guestCart.id } }).catch(() => null);
  }
}

export const cartService = new CartService();
