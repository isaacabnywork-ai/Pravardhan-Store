'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  Boxes,
  Store,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { orders, products, storeSettings, updateOrderStatus } = useStore();
  const { role } = useAuth();

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name, brand: p.brand }))
  );
  const lowStockVariants = allVariants.filter((v) => v.stock <= 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry for {storeSettings.storeName} ({storeSettings.serviceArea})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <PackageCheck className="w-4 h-4 text-emerald-700" /> Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Order Revenue
            </p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {formatPrice(totalRevenue)}
            </h2>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Live local receipts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active In-Progress
            </p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {activeOrders.length} Orders
            </h2>
            <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Same-day slots
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Variants
            </p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {lowStockVariants.length} SKUs
            </h2>
            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Requires restocking
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Total Catalog Capacity */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Catalog Size
            </p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {allVariants.length} SKUs
            </h2>
            <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1 mt-1">
              <Store className="w-3 h-3" /> {products.length} Products
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Orders Flow */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Incoming & Ongoing Orders
              </h3>
              <p className="text-xs text-slate-500">
                Update status as items are packed in the physical warehouse
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">#{ord.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium mt-1">
                    {ord.customerName} • {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Slot: {ord.deliverySlot.dateLabel} ({ord.deliverySlot.timeSlot})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">
                      {formatPrice(ord.grandTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ord.items.length} items
                    </span>
                  </div>

                  <Link
                    href={`/admin/orders?highlight=${ord.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px]"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Low Stock Attention Required */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Restock Alerts</span>
              </h3>
              <p className="text-xs text-slate-500">Inventory critically low</p>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Inventory Desk
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockVariants.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                All SKUs are sufficiently stocked!
              </p>
            ) : (
              lowStockVariants.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {item.title} • {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[11px]">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/inventory"
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Perform Stock Adjustment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
