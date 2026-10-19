'use client';

import React from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function AdminDeliveryPage() {
  const { orders, deliverySlots, updateOrderStatus, assignDeliveryStaff } = useStore();
  const { role, user } = useAuth();

  const handleStatusUpdate = (orderId: string, status: OrderStatus, note: string) => {
    updateOrderStatus(orderId, status, note);
  };

  const deliveryOrders = orders.filter(
    (o) =>
      o.orderStatus === 'READY_FOR_DELIVERY' ||
      o.orderStatus === 'OUT_FOR_DELIVERY' ||
      o.orderStatus === 'DELIVERED'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Delivery & Logistics Desk
          </h1>
          <p className="text-xs text-slate-500">
            Field delivery operations: Route dispatch, slot capacities, and doorstep confirmations (Spec Section 6 & 15.4)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
            🚚 Assigned Executive: Amit Singh (+91 9833445566)
          </span>
        </div>
      </div>

      {/* Delivery Slots Capacity Tracker */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Today & Tomorrow&apos;s Delivery Slot Capacity
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Zone: Sector 14 Hub
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {deliverySlots.map((slot) => {
            const fillPercentage = Math.round((slot.bookedCount / slot.capacity) * 100);
            return (
              <div
                key={slot.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{slot.timeSlot}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {slot.dateType}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Capacity: {slot.capacity} orders</span>
                  <span className="font-bold text-slate-800">{slot.bookedCount} booked</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fillPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Delivery Queue for Rider */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Doorstep Delivery Queue ({deliveryOrders.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Driver action checklist for assigned orders
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {deliveryOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No orders currently in delivery queue.
            </p>
          ) : (
            deliveryOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Left: Customer address & slot */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">
                      #{ord.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Slot: {ord.deliverySlot.timeSlot}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs">
                    {ord.customerName} ({ord.deliveryAddress.label})
                  </p>
                  <p className="text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>
                      {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}, {ord.deliveryAddress.area}
                    </span>
                  </p>
                  {ord.deliveryAddress.landmark && (
                    <p className="text-[11px] text-slate-400 pl-4">
                      Landmark: {ord.deliveryAddress.landmark}
                    </p>
                  )}
                  {ord.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      Customer Note: &ldquo;{ord.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="font-black text-slate-900 text-sm block">
                      {formatPrice(ord.grandTotal)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                    </span>
                  </div>

                  <a
                    href={`tel:${ord.customerPhone}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Customer</span>
                  </a>

                  {ord.orderStatus === 'READY_FOR_DELIVERY' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          ord.id,
                          'OUT_FOR_DELIVERY',
                          'Rider Amit Singh picked order and is on the way'
                        )
                      }
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm"
                    >
                      Start Delivery ➜
                    </button>
                  )}

                  {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          ord.id,
                          'DELIVERED',
                          'Successfully handed over to customer'
                        )
                      }
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Delivered</span>
                    </button>
                  )}

                  {ord.orderStatus === 'DELIVERED' && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
