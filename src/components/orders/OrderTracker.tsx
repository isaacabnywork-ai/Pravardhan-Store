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
  MapPin
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { useCart } from '@/context/CartContext';
import { StoreService } from '@/services/storeService';

interface OrderTrackerProps {
  order: Order;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Order Placed', label: 'Order Placed', desc: 'We received your order' },
  { status: 'Confirmed', label: 'Order Confirmed', desc: 'Store accepted the items' },
  { status: 'Packing', label: 'Packing at Store', desc: 'Freshly packed & checked' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Delivery partner is on the way' },
  { status: 'Delivered', label: 'Delivered', desc: 'Arrived at your doorstep' },
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
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3.5">
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </Link>
        <span className="text-xs font-bold text-[#64748B]">
          ID: {order.orderNumber}
        </span>
      </div>

      {/* Order Status Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded inline-block mb-1">
            Status: {order.orderStatus}
          </span>
          <h1 className="text-base sm:text-lg font-black text-[#0F172A]">
            Thank you for ordering with Pravdhan Store
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Scheduled Slot: <b>{order.deliverySlot?.label}</b> • Local Store Delivery
          </p>
        </div>

        <button
          onClick={handleOrderAgain}
          disabled={reordering}
          className="shrink-0 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{reordering ? 'Adding...' : 'Order Again'}</span>
        </button>
      </div>

      {/* Visual Timeline Progress */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-4 shadow-xs">
        <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#2563EB]" /> Delivery Milestones
        </h2>

        <div className="relative pl-6 sm:pl-7 space-y-5">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[10px] sm:left-[14px] top-2 bottom-2 w-0.5 bg-[#E2E8F0]" />

          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.status} className="relative flex items-start gap-3">
                {/* Milestone Node */}
                <div
                  className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center -ml-[21px] sm:-ml-[25px] border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : isCurrent
                      ? 'bg-white border-[#2563EB] text-[#2563EB] ring-2 ring-blue-100'
                      : 'bg-white border-[#E2E8F0] text-[#E2E8F0]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#2563EB]' : 'bg-transparent'}`} />
                  )}
                </div>

                {/* Text Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#2563EB] font-black'
                          : isCompleted
                          ? 'text-[#0F172A]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-blue-100 text-[#2563EB] font-black px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items in this Order */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-4 shadow-xs">
        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
          Items Ordered ({order.items?.length || 0})
        </h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-lg bg-[#F8FAFC] overflow-hidden border border-[#E2E8F0] shrink-0">
                  <Image src={item.image} alt={item.productName} fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] block">{item.productName}</span>
                  <span className="text-[#64748B] text-[10px]">
                    {item.weight} × {item.quantity}
                  </span>
                </div>
              </div>
              <span className="font-black text-[#0F172A]">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Bill summary */}
        <div className="pt-2.5 border-t border-[#E2E8F0] space-y-1 text-xs text-[#64748B]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#16A34A] font-semibold">
              <span>Savings</span>
              <span>- ₹{order.discount}</span>
            </div>
          )}
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-[#16A34A] font-semibold">
              <span>Coupon</span>
              <span>- ₹{order.couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="pt-2 border-t border-[#E2E8F0] flex justify-between font-black text-sm text-[#0F172A]">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 shadow-xs text-xs">
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
          Delivery Address
        </span>
        <div className="flex items-start gap-2 text-[#0F172A]">
          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{order.address?.name}</span> ({order.address?.label})
            <p className="text-[#64748B] mt-0.5">
              {order.address?.houseFlat}, {order.address?.street}, {order.address?.area}, {order.address?.city} - {order.address?.pincode}
            </p>
            <p className="text-[#64748B] mt-0.5">Mobile: {order.address?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
