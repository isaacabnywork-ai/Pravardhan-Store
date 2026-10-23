'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Boxes,
  PackageCheck,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  ArrowRight,
  RefreshCw,
  Plus,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function StoreManagerPage() {
  const { storeSettings, orders, products, adjustStock } = useStore();

  const [storeStatus, setStoreStatus] = useState<'OPEN' | 'BUSY' | 'PAUSED'>('OPEN');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [restockToast, setRestockToast] = useState<string | null>(null);

  // Filter metrics
  const pendingPickingOrders = orders.filter(
    (o) => o.orderStatus === 'ORDER_PLACED' || o.orderStatus === 'ORDER_CONFIRMED' || o.orderStatus === 'BEING_PREPARED'
  );

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name, brand: p.brand }))
  );
  const lowStockVariants = allVariants.filter((v) => v.stock <= 5);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleQuickRestock = (variantId: string, name: string) => {
    adjustStock(variantId, 25, 'ADD', 'Store Manager Quick Restock +25 units');
    setRestockToast(`Restocked +25 units for ${name}`);
    setTimeout(() => setRestockToast(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {restockToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{restockToast}</span>
        </div>
      )}

      {/* Role Desk Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Store Manager Operations Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Role: Store Manager
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Local Dark Store Operations • Facility intake, inventory replenishment, and workstation efficiency
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Station"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          <Link
            href="/admin/inventory"
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Boxes className="w-4 h-4 text-teal-600" />
            <span>Stock Ledger</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 flex items-center gap-2 transition-all"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Picking Floor</span>
          </Link>
        </div>
      </div>

      {/* Dark Store Facility Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-5 sm:p-6 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                Facility Telemetry • Dark Store #01
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              {storeSettings.storeName} — {storeSettings.serviceArea}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> 5 km Delivery Radius
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" /> Hours: {storeSettings.operatingHours}
              </span>
              <span>•</span>
              <span>Min Order: <strong className="text-white">₹{storeSettings.minimumOrderValue}</strong></span>
              <span>•</span>
              <span>Delivery Fee: <strong className="text-emerald-400">₹{storeSettings.defaultDeliveryCharge}</strong></span>
            </div>
          </div>

          {/* Store Live Dispatch Status Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Live Intake Switch:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStoreStatus('OPEN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  storeStatus === 'OPEN'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                🟢 Open (Normal)
              </button>
              <button
                type="button"
                onClick={() => setStoreStatus('BUSY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  storeStatus === 'BUSY'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                🟡 Rush Surge
              </button>
              <button
                type="button"
                onClick={() => setStoreStatus('PAUSED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  storeStatus === 'PAUSED'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                🔴 Paused
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inbound Queue</span>
            <PackageCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {pendingPickingOrders.length} Orders
            </h3>
            <p className="text-[11px] text-teal-700 font-semibold mt-1">
              Require picking & packing
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {lowStockVariants.length} SKUs
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Below re-order threshold (≤5)
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Staff Shift</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              4 On Duty
            </h3>
            <p className="text-[11px] text-blue-700 font-semibold mt-1">
              1 Manager, 1 Picker, 2 Riders
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dark Store SLA</span>
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              3.8 Mins
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              Avg Order-to-Handover time
            </p>
          </div>
        </div>
      </div>

      {/* Restock Priority Desk & Staff Shift */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alert & 1-Click Intake */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Critical Low Stock Inwarding Desk
                </h3>
                <p className="text-xs text-slate-500">
                  Direct Mandi / ITC replenishment for Gurugram Dark Store
                </p>
              </div>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockVariants.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.productName} ({item.title})
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      SKU: {item.sku}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Brand: {item.brand} • Price: {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Only {item.stock} left
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickRestock(item.id, item.productName)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inward +25</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Staff & Dark Store Workstation Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Dark Store Shift Roster</h3>
                <p className="text-xs text-slate-500">Gurugram Station active staff</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    AG
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Anil Gupta</p>
                    <p className="text-[11px] text-slate-500">Store Manager (Shift In-charge)</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                    SK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Suresh Kumar</p>
                    <p className="text-[11px] text-slate-500">Order & Packing Lead</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    AS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Amit Singh</p>
                    <p className="text-[11px] text-slate-500">Field Rider (DL-04)</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    PV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Priya Verma</p>
                    <p className="text-[11px] text-slate-500">Catalog & Inwarding Desk</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/admin/staff"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Shift Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
