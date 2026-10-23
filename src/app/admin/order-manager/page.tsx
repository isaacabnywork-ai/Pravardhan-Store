'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Bike,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function OrderManagerPage() {
  const { orders, updateOrderStatus } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const placedCount = orders.filter((o) => o.orderStatus === 'ORDER_PLACED').length;
  const confirmedCount = orders.filter((o) => o.orderStatus === 'ORDER_CONFIRMED').length;
  const pickingCount = orders.filter((o) => o.orderStatus === 'BEING_PREPARED').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'READY_FOR_DELIVERY').length;
  const outCount = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  const advanceOrder = (orderId: string, currentStatus: OrderStatus) => {
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
      updateOrderStatus(orderId, next, `Advanced by Order Manager Desk`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStage === 'ALL') return true;
    return o.orderStatus === filterStage;
  });

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Order Manager Fulfillment Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Role: Order Manager
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Warehouse Fulfillment • Inbound orders, item picking lists, dark store packing, and rider dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          <Link
            href="/admin/delivery"
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Bike className="w-4 h-4 text-amber-600" />
            <span>Rider Queue</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 flex items-center gap-2 transition-all"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Full Orders Board</span>
          </Link>
        </div>
      </div>

      {/* Fulfillment Pipeline Funnel */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Order Fulfillment Funnel
            </h3>
            <p className="text-xs text-slate-500">
              Real-time progress across dark store fulfillment stations
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilterStage('ALL')}
            className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors ${
              filterStage === 'ALL'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            View All ({orders.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { stage: 'ORDER_PLACED', label: '1. Placed', count: placedCount, color: 'border-slate-300 bg-slate-50 text-slate-700' },
            { stage: 'ORDER_CONFIRMED', label: '2. Confirmed', count: confirmedCount, color: 'border-blue-300 bg-blue-50 text-blue-700' },
            { stage: 'BEING_PREPARED', label: '3. Picking', count: pickingCount, color: 'border-amber-300 bg-amber-50 text-amber-700' },
            { stage: 'READY_FOR_DELIVERY', label: '4. Ready', count: readyCount, color: 'border-purple-300 bg-purple-50 text-purple-700' },
            { stage: 'OUT_FOR_DELIVERY', label: '5. In Transit', count: outCount, color: 'border-teal-300 bg-teal-50 text-teal-700' },
            { stage: 'DELIVERED', label: '6. Delivered', count: deliveredCount, color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
          ].map((item) => (
            <button
              key={item.stage}
              type="button"
              onClick={() => setFilterStage(item.stage)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${item.color} ${
                filterStage === item.stage ? 'ring-2 ring-purple-600 shadow-xs' : 'hover:opacity-90'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-xl sm:text-2xl font-black mt-1">{item.count}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Action Station */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Fulfillment Queue ({filteredOrders.length})
            </h3>
            <p className="text-xs text-slate-500">
              Click &quot;Advance Station&quot; to progress order through dark store picking and rider handover
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            Open Picking View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <PackageCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No orders currently in this station</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isDelivered = order.orderStatus === 'DELIVERED';
              const isCancelled = order.orderStatus === 'CANCELLED';

              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {order.paymentMethod}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800">
                      Customer: {order.customerName} ({order.customerPhone})
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {order.deliveryAddress?.completeAddress ||
                        order.deliveryAddress?.street ||
                        'Gurugram Store Pickup'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>{order.items.length} Items</span>
                      <span>•</span>
                      <span>Total: <strong className="text-slate-800">{formatPrice(order.grandTotal)}</strong></span>
                      <span>•</span>
                      <span>Placed: {formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Advance Station Button */}
                  <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                    <Link
                      href={`/admin/orders`}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                    >
                      Inspect Slip
                    </Link>

                    {!isDelivered && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => advanceOrder(order.id, order.orderStatus)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>
                          {order.orderStatus === 'ORDER_PLACED'
                            ? 'Confirm Order'
                            : order.orderStatus === 'ORDER_CONFIRMED'
                            ? 'Start Picking'
                            : order.orderStatus === 'BEING_PREPARED'
                            ? 'Mark Packed & Ready'
                            : order.orderStatus === 'READY_FOR_DELIVERY'
                            ? 'Hand to Rider'
                            : order.orderStatus === 'OUT_FOR_DELIVERY'
                            ? 'Mark Delivered'
                            : 'Next Step'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
