'use client';

import React from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  ChevronRight,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { orders } = useStore();

  // If user is logged in, show orders matching user or all demo customer orders
  const userOrders = orders.filter(
    (o) => !user || o.userId === user.id || o.customerPhone === user.phone
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/account" className="hover:text-emerald-700">My Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Order History</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Orders & Live Deliveries
            </h1>
            <p className="text-xs text-slate-500">
              Track status timeline and view tax receipts for your grocery purchases
            </p>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">No orders yet</h2>
            <p className="text-xs text-slate-500 mb-6">
              You haven&apos;t placed any orders yet. Try adding fresh produce or pantry essentials!
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'OUT_FOR_DELIVERY'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ordered on {formatDateTime(ord.createdAt)} • Slot: {ord.deliverySlot.dateLabel} ({ord.deliverySlot.timeSlot})
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900 block">
                      {formatPrice(ord.grandTotal)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {ord.paymentMethod} • {ord.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 flex-shrink-0"
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="w-7 h-7 object-cover rounded-lg"
                        />
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-slate-800 line-clamp-1 max-w-[140px]">
                            {item.productName}
                          </p>
                          <p className="text-[9px] text-slate-500">
                            {item.variantTitle} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/account/orders/${ord.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white rounded-xl text-xs font-bold border border-emerald-300 hover:border-emerald-700 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live Status</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Delivering to: {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}</span>
                  {ord.deliveryStaffName && (
                    <span className="font-semibold text-emerald-800">
                      Rider: {ord.deliveryStaffName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
