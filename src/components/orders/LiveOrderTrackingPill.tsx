'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
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

  const handleOpenTracking = () => {
    router.push(`/account/orders/${activeOrder.id}`);
  };

  const totalAmount = activeOrder.grandTotal || activeOrder.subtotal || 0;

  return (
    <div
      aria-label="Live Order Tracking Popup"
      className="fixed bottom-20 right-3.5 z-40 select-none print:hidden animate-in slide-in-from-bottom-3 duration-200"
    >
      <div
        onClick={handleOpenTracking}
        className="group relative bg-white/95 hover:bg-white backdrop-blur-md border border-slate-200 hover:border-emerald-500 rounded-xl px-3 py-2 shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all cursor-pointer flex items-center gap-2.5 ring-1 ring-black/5"
      >
        {/* Pulsing radar green dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        {/* Text Details: Order Placed & Cart Total */}
        <div className="flex flex-col text-left">
          <span className="text-[12px] font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
            Order Placed
          </span>
          <span className="text-[11px] font-black text-emerald-600 leading-tight">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Small dismiss button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          aria-label="Dismiss tracking popup"
          className="ml-1 w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
