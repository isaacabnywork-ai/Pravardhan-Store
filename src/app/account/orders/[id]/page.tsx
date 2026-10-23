'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Camera,
  ShoppingBasket,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;
  const { orders, storeSettings } = useStore();

  const [mounted, setMounted] = useState(false);
  const [localOrder, setLocalOrder] = useState<Order | null>(null);
  const [apiOrder, setApiOrder] = useState<Order | null>(null);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Direct search in StoreContext orders (by ID or Order Number)
  const storeOrder = useMemo(() => {
    if (!orders || orders.length === 0 || !targetId) return null;
    return (
      orders.find(
        (o) =>
          o.id === targetId ||
          o.orderNumber === targetId ||
          o.orderNumber.toLowerCase() === targetId.toLowerCase()
      ) || null
    );
  }, [orders, targetId]);

  // 2. Direct localStorage search & cross-tab sync
  useEffect(() => {
    const checkLocalStorage = () => {
      if (typeof window === 'undefined' || !targetId) return;
      try {
        const raw = localStorage.getItem('pravdhan_orders_v1');
        if (raw) {
          const list: Order[] = JSON.parse(raw);
          const found = list.find(
            (o) =>
              o.id === targetId ||
              o.orderNumber === targetId ||
              o.orderNumber.toLowerCase() === targetId.toLowerCase()
          );
          if (found) {
            setLocalOrder(found);
          }
        }
      } catch {}
    };

    checkLocalStorage();

    // Re-check whenever an order update occurs in another tab or window regains focus
    window.addEventListener('storage', checkLocalStorage);
    window.addEventListener('focus', checkLocalStorage);
    return () => {
      window.removeEventListener('storage', checkLocalStorage);
      window.removeEventListener('focus', checkLocalStorage);
    };
  }, [targetId]);

  // 3. Fallback backend API search
  useEffect(() => {
    if (!storeOrder && !localOrder && targetId) {
      setIsSearchingApi(true);
      fetch(`/api/v1/orders/${targetId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res && res.data) {
            const o = res.data;
            const mapped: Order = {
              id: o.id,
              orderNumber: o.orderNumber,
              userId: o.userId || 'user-cust-01',
              customerName: o.customerName || 'Customer',
              customerPhone: o.customerPhone || '',
              deliveryAddress: o.deliveryAddress,
              deliverySlot: {
                id: 'slot-instant',
                dateType: 'TODAY' as const,
                dateLabel: 'Today',
                dateString: new Date().toISOString().split('T')[0],
                timeSlot: o.deliverySlot || 'Instant (10-15 mins)',
                isAvailable: true,
                capacity: 50,
                bookedCount: 1,
              },
              items: (o.items || []).map((i: any) => ({
                productId: i.productId,
                variantId: i.variantId,
                productName: i.productName,
                variantTitle: i.variantTitle,
                brand: i.brand,
                unit: i.unit,
                purchasedPrice: Math.round((i.purchasedPrice || 0) / 100),
                purchasedMrp: Math.round((i.purchasedMrp || 0) / 100),
                quantity: i.quantity,
                image: i.image,
              })),
              subtotal: Math.round((o.subtotal || 0) / 100),
              discount: Math.round((o.discount || 0) / 100),
              couponCode: o.couponCode,
              couponDiscount: Math.round((o.couponDiscount || 0) / 100),
              deliveryCharge: Math.round((o.deliveryFee || 0) / 100),
              deliveryTip: Math.round((o.deliveryTip || 0) / 100),
              handlingFee: Math.round((o.handlingFee || 0) / 100),
              grandTotal: Math.round((o.grandTotal || 0) / 100),
              paymentMethod: o.paymentMethod,
              paymentStatus: o.paymentStatus,
              orderStatus:
                o.orderStatus === 'PLACED'
                  ? 'ORDER_PLACED'
                  : o.orderStatus === 'CONFIRMED'
                  ? 'ORDER_CONFIRMED'
                  : o.orderStatus === 'PREPARING'
                  ? 'BEING_PREPARED'
                  : o.orderStatus === 'READY_FOR_PICKUP'
                  ? 'READY_FOR_DELIVERY'
                  : o.orderStatus,
              statusHistory: (o.statusHistory || []).map((h: any) => ({
                status: h.status,
                label: h.label,
                timestamp: new Date(h.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                note: h.note,
                completed: true,
              })),
              deliveryStaffName: o.rider?.name || o.deliveryStaffName,
              deliveryProofPhoto: o.deliveryProofPhoto,
              deliveryProofTimestamp: o.deliveryProofTimestamp,
              createdAt: o.createdAt,
              updatedAt: o.updatedAt,
            };
            setApiOrder(mapped);
          }
        })
        .catch(() => null)
        .finally(() => setIsSearchingApi(false));
    }
  }, [storeOrder, localOrder, targetId]);

  // Prefer the freshest version: storeOrder if available, or localOrder, or apiOrder
  const order: Order | null = storeOrder || localOrder || apiOrder;

  const statusSequence: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'ORDER_PLACED', label: 'Order Placed', icon: PackageCheck },
    { status: 'ORDER_CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
    { status: 'BEING_PREPARED', label: 'Being Prepared', icon: ShoppingBag },
    { status: 'READY_FOR_DELIVERY', label: 'Ready for Delivery', icon: ShieldCheck },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: MapPin },
  ];

  // Loading skeleton while mounting or searching
  if (!mounted || (!order && isSearchingApi)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-8">
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-28 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // Graceful fallback if order is not found anywhere
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-8">
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <PackageCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Order Details Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find an active order matching <span className="font-mono font-bold text-slate-700">#{targetId}</span>. It may have been updated, or you may be browsing under a different session.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/account/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>View All My Orders</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all text-center flex items-center justify-center gap-2"
            >
              <ShoppingBasket className="w-4 h-4" />
              <span>Return to Store</span>
            </Link>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const currentStatusIndex = statusSequence.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-8">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* Top App Bar with Back Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/account/orders')}
              aria-label="Back to orders"
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-slate-200/80 flex items-center justify-center text-gray-800 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                Order Tracking
              </h1>
              <p className="text-[11px] text-slate-500">
                Order #{order.orderNumber}
              </p>
            </div>
          </div>

          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs transition-colors"
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
              Placed on {formatDateTime(order.createdAt)} • Slot: {order.deliverySlot?.dateLabel || 'Today'} ({order.deliverySlot?.timeSlot || 'Express Delivery'})
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

          {/* Doorstep Proof of Delivery Photo if delivered */}
          {order.deliveryProofPhoto && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Doorstep Proof of Delivery Photo
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ✓ Verified Handover
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Your delivery executive took this photograph at your doorstep to confirm successful handover.
              </p>
              <div className="relative max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={order.deliveryProofPhoto}
                  alt="Delivery Proof"
                  className="w-full h-56 object-cover"
                />
                {order.deliveryProofTimestamp && (
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2 text-white text-[10px] font-mono flex items-center justify-between backdrop-blur-xs">
                    <span>Delivered at Doorstep</span>
                    <span>{formatDateTime(order.deliveryProofTimestamp)}</span>
                  </div>
                )}
              </div>
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
