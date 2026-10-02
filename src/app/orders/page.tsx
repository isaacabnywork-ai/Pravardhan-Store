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
      <div className="max-w-md mx-auto px-4 py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-xs my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-inner">
          <PackageCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1.5">
          No orders yet
        </h2>
        <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
          Browse fresh groceries, farm veggies, dairy and schedule your first doorstep delivery.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      <div className="mb-5">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track active deliveries and reorder your grocery staples in 1 click
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div>
                <span className="font-black text-slate-900">Order #{order.orderNumber}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span
                  className={`font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200/80'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Items Preview */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                {order.items.slice(0, 4).map((it) => (
                  <div
                    key={it.id}
                    className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0"
                    title={it.productName}
                  >
                    <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500 font-medium">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  ₹{order.total}
                </div>
              </div>
            </div>

            {/* Delivery Slot info */}
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Slot: <b className="text-slate-700 font-bold">{order.deliverySlot?.label}</b></span>
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
              <Link
                href={`/orders/${order.id}`}
                className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Track Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => handleOrderAgain(order)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Order Again</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
