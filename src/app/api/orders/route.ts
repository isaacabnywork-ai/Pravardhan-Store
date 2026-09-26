import { NextRequest, NextResponse } from 'next/server';
import { StoreService } from '@/services/storeService';
import { CartItem, Address, DeliverySlot } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, address, deliverySlot, couponCode, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!address || !deliverySlot) {
      return NextResponse.json({ error: 'Address and delivery slot required' }, { status: 400 });
    }

    // 1. Validate each product and variant against the catalog server-side
    const validatedItems = [];
    for (const item of items as CartItem[]) {
      const product = await StoreService.getProductBySlug(item.product.slug);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.product.name}" is no longer available` },
          { status: 400 }
        );
      }
      const variant = product.variants.find((v) => v.id === item.variant.id);
      if (!variant) {
        return NextResponse.json(
          { error: `Variant for "${item.product.name}" is no longer available` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Only ${variant.stock} units available for "${item.product.name}"`,
          },
          { status: 400 }
        );
      }

      validatedItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        weight: variant.weight,
        price: variant.price, // Server price
        mrp: variant.mrp,
        quantity: item.quantity,
        image: product.image,
        subtotal: variant.price * item.quantity,
      });
    }

    // 2. Validate coupon server-side
    let coupon = null;
    const subtotal = validatedItems.reduce((sum, i) => sum + i.subtotal, 0);
    if (couponCode) {
      const couponRes = StoreService.validateCoupon(couponCode, subtotal);
      if (couponRes.valid && couponRes.coupon) {
        coupon = couponRes.coupon;
      }
    }

    // 3. Recalculate bill strictly on server
    const bill = StoreService.calculateBill(items, coupon);

    // 4. Create Order
    const order = StoreService.createOrder({
      customerId: 'cust-guest-1',
      customerName: address.name,
      customerPhone: address.phone,
      items: validatedItems,
      address,
      deliverySlot,
      subtotal: bill.subtotal,
      discount: bill.productDiscount,
      couponDiscount: bill.couponDiscount,
      deliveryFee: bill.deliveryFee,
      tax: bill.tax,
      total: bill.total,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Order Placed',
      estimatedDelivery: deliverySlot.label,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Server error creating order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
