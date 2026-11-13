'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Truck, Package, Clock, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Order } from '@/types';

export function LiveOrderTrackingPill() {
  const pathname = usePathname();
  const router = useRouter();
  const { orders } = useStore();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Load latest active order
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setActiveOrder(null);
      return;
    }

    // Filter active orders that are not DELIVERED or CANCELLED or REFUNDED
    const pendingOrders = orders
      .filter((o) => {
        const isNotFinal =
          o.orderStatus !== 'DELIVERED' &&
          o.orderStatus !== 'CANCELLED' &&
          o.orderStatus !== 'REFUNDED';
        if (!isNotFinal) return false;
        if (user && o.userId) {
          return o.userId === user.id || o.customerPhone === user.phone;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latest = pendingOrders[0] || null;
    setActiveOrder(latest);
  }, [orders, user]);

  // Don't show on admin panel, checkout, or when already viewing that order's tracking page
  if (
    !activeOrder ||
    isDismissed ||
    pathname.startsWith('/admin') ||
    pathname === '/checkout' ||
    pathname === `/account/orders/${activeOrder.id}`
  ) {
    return null;
  }

  const getStatusDisplay = () => {
    switch (activeOrder.orderStatus) {
      case 'ORDER_PLACED':
        return {
          title: 'Order Placed',
          desc: 'Store confirmed your order',
          bg: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'ORDER_CONFIRMED':
        return {
          title: 'Order Confirmed',
          desc: 'Packing fresh items now',
          bg: 'bg-blue-600',
          badge: 'bg-blue-50 text-blue-900 border-blue-200',
        };
      case 'BEING_PREPARED':
        return {
          title: 'Being Prepared',
          desc: 'Quality check & packaging',
          bg: 'bg-indigo-600',
          badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        };
      case 'READY_FOR_DELIVERY':
        return {
          title: 'Ready for Delivery',
          desc: 'Dispatched to delivery partner',
          bg: 'bg-purple-600',
          badge: 'bg-purple-50 text-purple-900 border-purple-200',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          title: 'Out for Delivery',
          desc: 'Rider is on the way to you',
          bg: 'bg-emerald-600',
          badge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        };
      default:
        return {
          title: 'Live Tracking Active',
          desc: 'Order in transit',
          bg: 'bg-emerald-600',
          badge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const timeSlotText = activeOrder.deliverySlot?.timeSlot || '1-Hour / Scheduled Slot';
  const itemCount = activeOrder.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1;

  const handleOpenTracking = () => {
    router.push(`/account/orders/${activeOrder.id}`);
  };

  return (
    <div
      aria-label="Live Order Tracking Popup"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 max-w-sm w-[calc(100%-1.5rem)] sm:w-auto animate-in slide-in-from-bottom-4 duration-300 select-none print:hidden"
    >
      <div
        onClick={handleOpenTracking}
        className="group relative bg-white/95 hover:bg-white backdrop-blur-md border border-slate-200 hover:border-emerald-500 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-emerald-900/15 transition-all cursor-pointer flex items-center justify-between gap-3 ring-1 ring-black/5"
      >
        {/* Pulsing Live indicator & Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-2xl ${statusInfo.bg} text-white flex items-center justify-center shadow-md shrink-0`}
            >
              {activeOrder.orderStatus === 'OUT_FOR_DELIVERY' ? (
                <Truck className="w-5 h-5 animate-bounce" />
              ) : activeOrder.orderStatus === 'BEING_PREPARED' ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            {/* Live radar dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Live Order #{activeOrder.orderNumber.slice(-6)}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                • {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors mt-0.5 truncate">
              {statusInfo.title}
            </h4>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              {timeSlotText} • Tap to view full map & tracking
            </p>
          </div>
        </div>

        {/* Right Arrow & Dismiss Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            aria-label="Dismiss tracking popup"
            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
            title="Dismiss popup"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
