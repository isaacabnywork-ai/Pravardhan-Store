'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Printer,
  ChevronRight,
  User,
  ShoppingBag,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { orders, storeSettings } = useStore();

  const order = orders.find((o) => o.id === resolvedParams.id);

  if (!order) {
    notFound();
  }

  const statusSequence: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'ORDER_PLACED', label: 'Order Placed', icon: PackageCheck },
    { status: 'ORDER_CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
    { status: 'BEING_PREPARED', label: 'Being Prepared', icon: ShoppingBag },
    { status: 'READY_FOR_DELIVERY', label: 'Ready for Delivery', icon: ShieldCheck },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: MapPin },
  ];

  const currentStatusIndex = statusSequence.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/account/orders" className="hover:text-emerald-700">My Orders</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-semibold">{order.orderNumber}</span>
          </nav>

          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Orders</span>
          </Link>
        </div>

        {/* Top Order Overview Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Placed on {formatDateTime(order.createdAt)} • Slot: {order.deliverySlot.dateLabel} ({order.deliverySlot.timeSlot})
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* 17. Status Timeline Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <span>Live Order Status Timeline</span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time progression from local store warehouse to your doorstep
            </p>
          </div>

          {/* Stepped Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {statusSequence.map((step, idx) => {
              const isPast = idx < currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;

              const historyItem = order.statusHistory.find((h) => h.status === step.status);

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Step Marker Dot / Icon */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-300'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-slate-950" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-amber-800 font-black'
                            : isPast
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      {historyItem && historyItem.timestamp && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          {historyItem.timestamp}
                        </span>
                      )}
                    </div>
                    {historyItem?.note && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {historyItem.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Staff Card if assigned */}
          {order.deliveryStaffName && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                    Assigned Delivery Partner
                  </p>
                  <p className="text-sm font-bold text-slate-900">{order.deliveryStaffName}</p>
                </div>
              </div>
              <a
                href={`tel:${storeSettings.supportPhone}`}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-50"
              >
                <Phone className="w-3.5 h-3.5" /> Call Rider
              </a>
            </div>
          )}
        </div>

        {/* Address and Items Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Address */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              Delivery Location
            </h3>
            <p className="text-xs font-bold text-slate-800 mt-2">
              {order.deliveryAddress.name} ({order.deliveryAddress.label})
            </p>
            <p className="text-xs text-slate-600 leading-snug">
              {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}
            </p>
            {order.deliveryAddress.landmark && (
              <p className="text-[11px] text-slate-400">
                Landmark: {order.deliveryAddress.landmark}
              </p>
            )}
            <p className="text-[11px] text-slate-600 font-semibold">
              {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
            <p className="text-xs text-slate-800 font-bold pt-1">
              Ph: +91 {order.deliveryAddress.phone}
            </p>
          </div>

          {/* Delivery Slot */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              Delivery Window
            </h3>
            <p className="text-xs font-bold text-slate-800 mt-2">
              {order.deliverySlot.dateLabel}
            </p>
            <p className="text-sm font-black text-emerald-800">
              {order.deliverySlot.timeSlot}
            </p>
            <p className="text-[11px] text-slate-500">
              Dispatched directly from Pravdhan Hub 1 ({storeSettings.serviceArea})
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Payment Summary
            </h3>
            <div className="text-xs space-y-1 pt-1">
              <div className="flex justify-between text-slate-600">
                <span>Method:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Paid:</span>
                <span className="font-black text-slate-900">{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items with Historical Prices (Spec Section 42) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Purchased Items ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</p>
                    <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
                    <p className="text-slate-500 text-xs">
                      Variant: <span className="font-semibold text-slate-800">{item.variantTitle}</span> • Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">
                    {formatPrice(item.purchasedPrice * item.quantity)}
                  </span>
                  {item.purchasedMrp > item.purchasedPrice && (
                    <span className="block text-[10px] text-slate-400 line-through">
                      {formatPrice(item.purchasedMrp * item.quantity)}
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    {formatPrice(item.purchasedPrice)} each
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Calculation */}
          <div className="pt-4 border-t border-slate-200 max-w-xs ml-auto text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Product Savings</span>
                <span>- {formatPrice(order.discount)}</span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon ({order.couponCode})</span>
                <span>- {formatPrice(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-bold text-emerald-700">
                {order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}
              </span>
            </div>
            {Boolean(order.handlingFee && order.handlingFee > 0) && (
              <div className="flex justify-between text-slate-600">
                <span>Handling Charge</span>
                <span>{formatPrice(order.handlingFee!)}</span>
              </div>
            )}
            {Boolean(order.deliveryTip && order.deliveryTip > 0) && (
              <div className="flex justify-between text-amber-800 font-bold">
                <span>Delivery Partner Tip</span>
                <span>+{formatPrice(order.deliveryTip!)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Grand Total</span>
              <span className="text-base text-emerald-800">{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
