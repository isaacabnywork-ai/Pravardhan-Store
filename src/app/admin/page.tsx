'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  Boxes,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Plus,
  RefreshCw,
  IndianRupee,
  Activity,
  CheckCircle2,
  ChevronRight,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function AdminDashboardPage() {
  const { orders, products, storeSettings, updateOrderStatus } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name, brand: p.brand }))
  );
  const lowStockVariants = allVariants.filter((v) => v.stock <= 5);
  const totalStockUnits = allVariants.reduce((sum, v) => sum + v.stock, 0);
  const inventoryValuation = allVariants.reduce((sum, v) => sum + v.stock * v.price, 0);

  // Pipeline counts
  const placedCount = orders.filter((o) => o.orderStatus === 'ORDER_PLACED').length;
  const confirmedCount = orders.filter((o) => o.orderStatus === 'ORDER_CONFIRMED').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'BEING_PREPARED').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'READY_FOR_DELIVERY').length;
  const outCount = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const advanceOrderStatus = (orderId: string, currentStatus: OrderStatus) => {
    const sequence: Record<OrderStatus, OrderStatus | null> = {
      ORDER_PLACED: 'ORDER_CONFIRMED',
      ORDER_CONFIRMED: 'BEING_PREPARED',
      BEING_PREPARED: 'READY_FOR_DELIVERY',
      READY_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERED',
      DELIVERED: null,
      CANCELLED: null,
      REFUNDED: null,
    };
    const next = sequence[currentStatus];
    if (next) {
      updateOrderStatus(orderId, next, `Advanced from Command Center dashboard`);
    }
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry for <strong>{storeSettings.storeName}</strong> • {storeSettings.serviceArea} • Target SLA: 15-min delivery
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Live Telemetry"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <Link
            href="/admin/products"
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add SKU</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-2 transition-all"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Fulfillment Desk</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total GMV Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Gross Merchandise Value
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(totalRevenue)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3" /> +14.2%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Active In-Progress Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Fulfillment
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeOrders.length} Orders
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3" /> {placedCount + confirmedCount} Pending
              </span>
              <span className="text-[11px] text-slate-400 font-medium">in queue</span>
            </div>
          </div>
        </div>

        {/* Inventory Stock Health */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inventory Valuation
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(inventoryValuation)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {lowStockVariants.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3 h-3" /> {lowStockVariants.length} Low Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> 100% Stocked
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium">({totalStockUnits} units)</span>
            </div>
          </div>
        </div>

        {/* Fleet & Delivery SLA */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Fleet & Delivery SLA
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              13.8 Mins
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                <Zap className="w-3 h-3" /> 99.4% On-Time
              </span>
              <span className="text-[11px] text-slate-400 font-medium">4 active riders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Order Funnel Pipeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Dark Store Fulfillment Funnel</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live status progression of all customer orders across dark store workstations
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Open Order Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {[
            {
              label: 'Placed',
              count: placedCount,
              status: 'ORDER_PLACED',
              bg: 'bg-slate-50 border-slate-200 text-slate-700',
              accent: 'bg-slate-500',
            },
            {
              label: 'Confirmed',
              count: confirmedCount,
              status: 'ORDER_CONFIRMED',
              bg: 'bg-blue-50/70 border-blue-200 text-blue-900',
              accent: 'bg-blue-500',
            },
            {
              label: 'Picking & Packing',
              count: preparingCount,
              status: 'BEING_PREPARED',
              bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
              accent: 'bg-amber-500',
            },
            {
              label: 'Ready to Dispatch',
              count: readyCount,
              status: 'READY_FOR_DELIVERY',
              bg: 'bg-indigo-50/70 border-indigo-200 text-indigo-900',
              accent: 'bg-indigo-500',
            },
            {
              label: 'Out for Delivery',
              count: outCount,
              status: 'OUT_FOR_DELIVERY',
              bg: 'bg-purple-50/70 border-purple-200 text-purple-900',
              accent: 'bg-purple-500',
            },
            {
              label: 'Delivered',
              count: deliveredCount,
              status: 'DELIVERED',
              bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
              accent: 'bg-emerald-500',
            },
          ].map((stage, idx) => (
            <Link
              key={stage.label}
              href={`/admin/orders?status=${stage.status}`}
              className={`p-4 rounded-2xl border transition-all hover:shadow-xs hover:border-slate-400 flex flex-col justify-between ${stage.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                  Step 0{idx + 1}
                </span>
                <span className={`w-2 h-2 rounded-full ${stage.accent}`} />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black block tracking-tight">{stage.count}</span>
                <span className="text-xs font-bold block mt-0.5 leading-snug">{stage.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Live Orders Stream & Quick Ops */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Order Stream */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Live Fulfillment Stream
              </h3>
              <p className="text-xs text-slate-500">
                Latest inbound orders requiring picking, packaging, or rider dispatch
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All {orders.length}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-50/50 p-2.5 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      #{ord.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-purple-100 text-purple-900'
                          : ord.orderStatus === 'READY_FOR_DELIVERY'
                          ? 'bg-indigo-100 text-indigo-900'
                          : ord.orderStatus === 'BEING_PREPARED'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ord.paymentMethod !== 'COD'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {ord.paymentMethod !== 'COD' ? 'Razorpay Paid' : 'Cash On Delivery'}
                    </span>
                  </div>

                  <p className="text-slate-700 font-semibold">
                    {ord.customerName} • <span className="text-slate-500 font-normal">{ord.customerPhone}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}, {ord.deliveryAddress.city}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Slot: {ord.deliverySlot.dateLabel} ({ord.deliverySlot.timeSlot})
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 sm:gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm block">
                      {formatPrice(ord.grandTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.orderStatus !== 'DELIVERED' && (
                      <button
                        onClick={() => advanceOrderStatus(ord.id, ord.orderStatus)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                        title="Advance to next fulfillment step"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                    <Link
                      href={`/admin/orders?highlight=${ord.id}`}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Restock Alerts & Rider Telemetry */}
        <div className="space-y-6">
          {/* Low Stock SKUs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Restock Priority Alerts</span>
                </h3>
                <p className="text-xs text-slate-500">Items below minimum dark store threshold</p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Stock Desk
              </Link>
            </div>

            <div className="space-y-2.5">
              {lowStockVariants.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">All SKUs Healthy</p>
                  <p className="text-[11px] text-slate-400">No items below minimum safety buffer</p>
                </div>
              ) : (
                lowStockVariants.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.title} • {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 font-black text-[11px] block">
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
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Open Stock Ledger & Restock</span>
              </Link>
            </div>
          </div>

          {/* Quick Hub Operating Health */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dark Store Station Health</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Picking Station #1</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active (2 pickers)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Packing Table #A</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Fleet Radar</span>
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> 4 Riders On Duty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
