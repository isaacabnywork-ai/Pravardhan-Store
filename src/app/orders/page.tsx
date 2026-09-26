'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PackageCheck, Clock, ArrowRight, RotateCcw, ChevronRight } from 'lucide-react';
import { Order } from '@/types';
import { StoreService } from '@/services/storeService';
import { useCart } from '@/context/CartContext';

export default function OrdersPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = StoreService.getOrders();
    if (existing.length === 0) {
      const sample = StoreService.createOrder({
        customerId: 'cust-1',
        customerName: 'Abhinav Sharma',
        customerPhone: '9876543210',
        items: [
          {
            id: 'oi-sample-1',
            productId: 'prod-veg-onion',
            variantId: 'var-onion-1kg',
            productName: 'Nashik Fresh Red Onion (Pyaaz)',
            variantName: '1 kg',
            weight: '1 kg',
            price: 36,
            mrp: 45,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
            subtotal: 72,
          },
          {
            id: 'oi-sample-2',
            productId: 'prod-snack-maggi',
            variantId: 'var-maggi-4pack',
            productName: 'Maggi 2-Minute Masala Instant Noodles',
            variantName: '280 g (Pack of 4)',
            weight: '280 g',
            price: 56,
            mrp: 60,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
            subtotal: 56,
          },
          {
            id: 'oi-sample-3',
            productId: 'prod-dairy-butter',
            variantId: 'var-butter-100g',
            productName: 'Amul Pasteurised Salted Butter',
            variantName: '100 g',
            weight: '100 g',
            price: 56,
            mrp: 60,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
            subtotal: 56,
          },
        ],
        address: StoreService.getAddresses()[0],
        deliverySlot: {
          id: 'slot-today-1',
          day: 'Today',
          date: 'Today, 26 Sep',
          startTime: '4:00 PM',
          endTime: '6:00 PM',
          label: 'Today (4 PM – 6 PM)',
          isAvailable: true,
          fee: 35,
        },
        subtotal: 184,
        discount: 26,
        couponDiscount: 0,
        deliveryFee: 35,
        tax: 0,
        total: 219,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        orderStatus: 'Packing',
        estimatedDelivery: 'Today (4 PM – 6 PM)',
      });
      setOrders([sample]);
    } else {
      setOrders(existing);
    }
    setLoading(false);
  }, []);

  const handleOrderAgain = async (order: Order) => {
    for (const item of order.items) {
      const prod = await StoreService.getProductBySlug(item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId) || prod.variants[0];
        addToCart(prod, variant);
      }
    }
    router.push('/cart');
  };

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-xs">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-2.5">
          <PackageCheck className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-[#0F172A] mb-1">
          No orders yet
        </h2>
        <p className="text-xs text-[#64748B] mb-4">
          Browse daily groceries and schedule your first delivery.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-xl"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-black text-[#0F172A]">
          Order History
        </h1>
        <p className="text-xs text-[#64748B]">
          Track active orders and reorder in 1 click
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 sm:p-4 shadow-xs hover:border-blue-200 transition-colors"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0] text-xs">
              <div>
                <span className="font-bold text-[#0F172A]">Order #{order.orderNumber}</span>
                <span className="text-[#64748B] block text-[11px]">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span
                  className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-green-100 text-[#16A34A]'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-[#DC2626]'
                      : 'bg-blue-100 text-[#2563EB]'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Items Preview */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {order.items.slice(0, 4).map((it) => (
                  <div
                    key={it.id}
                    className="relative w-11 h-11 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden shrink-0"
                    title={it.productName}
                  >
                    <Image src={it.image} alt="" fill sizes="44px" className="object-cover" />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-11 h-11 rounded-lg bg-slate-100 text-[#64748B] flex items-center justify-center font-bold text-xs shrink-0">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-[#64748B]">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </div>
                <div className="text-sm font-black text-[#0F172A]">
                  ₹{order.total}
                </div>
              </div>
            </div>

            {/* Delivery Slot info */}
            <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>Slot: {order.deliverySlot?.label}</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
              <Link
                href={`/orders/${order.id}`}
                className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Track Order</span>
                <ChevronRight className="w-3 h-3" />
              </Link>

              <button
                onClick={() => handleOrderAgain(order)}
                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Order Again</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
