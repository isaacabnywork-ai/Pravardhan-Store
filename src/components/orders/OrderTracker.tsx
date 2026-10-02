'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  RotateCcw,
  ArrowLeft,
  MapPin,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { useCart } from '@/context/CartContext';
import { StoreService } from '@/services/storeService';

interface OrderTrackerProps {
  order: Order;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Order Placed', label: 'Order Placed', desc: 'We received your grocery order' },
  { status: 'Confirmed', label: 'Order Confirmed', desc: 'Store accepted your items' },
  { status: 'Packing', label: 'Packing at Store', desc: 'Freshly packed & quality checked' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Delivery partner is on the way' },
  { status: 'Delivered', label: 'Delivered', desc: 'Handed over at your doorstep' },
];

export function OrderTracker({ order }: OrderTrackerProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [reordering, setReordering] = React.useState(false);

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Confirmed': return 1;
      case 'Packing': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);

  const handleOrderAgain = async () => {
    setReordering(true);
    for (const item of order.items) {
      const prod = await StoreService.getProductBySlug(item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId) || prod.variants[0];
        addToCart(prod, variant);
      }
    }
    setReordering(false);
    router.push('/cart');
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>All Orders</span>
        </Link>
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {order.orderNumber}
        </span>
      </div>

      {/* Order Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-green-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Status: {order.orderStatus}
          </span>
          <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            Thank you for shopping with Pravdhan Store
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Slot: <b className="text-slate-800 font-bold">{order.deliverySlot?.label}</b> • Scheduled Neighborhood Delivery
          </p>
        </div>

        <button
          onClick={handleOrderAgain}
          disabled={reordering}
          className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{reordering ? 'Adding items...' : 'Order Again'}</span>
        </button>
      </div>

      {/* Visual Timeline Progress */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 mb-5 shadow-xs">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" /> Delivery Progress
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />

          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.status} className="relative flex items-start gap-3.5">
                {/* Milestone Node */}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center -ml-[23px] sm:-ml-[27px] border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white border-emerald-600 text-emerald-600 ring-4 ring-emerald-100 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-emerald-600' : 'bg-transparent'}`} />
                  )}
                </div>

                {/* Text Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-emerald-700 font-black'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items in this Order */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-5 shadow-xs">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
          Items Ordered ({order.items?.length || 0})
        </h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-200 shrink-0">
                  <Image src={item.image} alt={item.productName} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{item.productName}</span>
                  <span className="text-slate-500 text-[11px]">
                    {item.weight} × {item.quantity}
                  </span>
                </div>
              </div>
              <span className="font-black text-slate-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Bill summary */}
        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Savings</span>
              <span>- ₹{order.discount}</span>
            </div>
          )}
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon</span>
              <span>- ₹{order.couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="pt-2.5 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
            <span>Total Paid</span>
            <span className="font-black text-base text-slate-900">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs text-xs">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
          Delivery Destination
        </span>
        <div className="flex items-start gap-3 text-slate-900">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-slate-900">{order.address?.name}</span>
            <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
              {order.address?.label}
            </span>
            <p className="text-slate-600 mt-1 leading-snug">
              {order.address?.houseFlat}, {order.address?.street}, {order.address?.area}, {order.address?.city} - {order.address?.pincode}
            </p>
            <p className="text-slate-500 text-[11px] mt-1 font-medium">Contact: +91 {order.address?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
