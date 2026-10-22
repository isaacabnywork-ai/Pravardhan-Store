'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Truck,
  ShieldCheck,
  X,
  AlertCircle,
  ShoppingBag,
  Printer,
  ChevronRight,
  Layers,
  CheckSquare,
  Square,
  Camera,
  Bike,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, assignDeliveryStaff, toggleOrderItemPicked } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      if (!matchNum && !matchCust && !matchPhone) return false;
    }
    return true;
  });

  const handleAdvanceStatus = (orderId: string, nextStatus: OrderStatus, note?: string) => {
    updateOrderStatus(orderId, nextStatus, note);
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = orders.find((o) => o.id === orderId);
      if (updated) setSelectedOrder({ ...updated, orderStatus: nextStatus });
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Orders & Warehouse Fulfillment
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <PackageCheck className="w-3.5 h-3.5" />
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fulfillment desk: Order verification, dark-store item picking, packing slip generation, and rider dispatch
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { key: 'ALL', label: 'All Orders', icon: Layers },
          { key: 'ORDER_PLACED', label: 'New Orders', icon: AlertCircle },
          { key: 'ORDER_CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
          { key: 'BEING_PREPARED', label: 'Picking & Packing', icon: ShoppingBag },
          { key: 'READY_FOR_DELIVERY', label: 'Ready for Dispatch', icon: PackageCheck },
          { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
          { key: 'DELIVERED', label: 'Delivered', icon: ShieldCheck },
        ].map((tab) => {
          const isSelected = statusFilter === tab.key;
          const count =
            tab.key === 'ALL'
              ? orders.length
              : orders.filter((o) => o.orderStatus === tab.key).length;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shadow-2xs ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input & Counter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Order #, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Showing <strong className="text-slate-800">{filteredOrders.length}</strong> matching orders
        </span>
      </div>

      {/* Full-Width Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Order Details</th>
                <th className="py-3.5 px-4">Customer & Location</th>
                <th className="py-3.5 px-4">Delivery Slot</th>
                <th className="py-3.5 px-4">Amount & Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No orders matching your criteria found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDateTime(ord.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-bold mt-1">
                        <ShoppingBag className="w-3 h-3 text-slate-400" />
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 text-xs">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        +91 {ord.customerPhone}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        {ord.deliverySlot.dateLabel}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                        {ord.deliverySlot.timeSlot}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatPrice(ord.grandTotal)}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.paymentMethod !== 'COD'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {ord.paymentMethod !== 'COD' ? 'Razorpay Online' : 'Cash On Delivery'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'OUT_FOR_DELIVERY'
                            ? 'bg-purple-100 text-purple-900 animate-pulse'
                            : ord.orderStatus === 'READY_FOR_DELIVERY'
                            ? 'bg-indigo-100 text-indigo-900'
                            : ord.orderStatus === 'BEING_PREPARED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-500'
                              : ord.orderStatus === 'OUT_FOR_DELIVERY'
                              ? 'bg-purple-500'
                              : ord.orderStatus === 'READY_FOR_DELIVERY'
                              ? 'bg-indigo-500'
                              : ord.orderStatus === 'BEING_PREPARED'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ml-auto"
                      >
                        <span>Process</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Fulfillment Drawer / Modal */}
      {selectedOrder && (() => {
        const order = orders.find((o) => o.id === selectedOrder.id) || selectedOrder;
        const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
        const pickedCount = order.items.reduce((acc, i) => {
          return acc + (order.pickedItems?.[i.variantId] ? i.quantity : 0);
        }, 0);
        const isAllPicked = pickedCount >= totalItemsCount;

        const stages = [
          { status: 'ORDER_PLACED', label: '1. Placed', desc: 'New from customer' },
          { status: 'ORDER_CONFIRMED', label: '2. Confirmed', desc: 'Store verified' },
          { status: 'BEING_PREPARED', label: '3. Picking', desc: 'Dark store aisles' },
          { status: 'READY_FOR_DELIVERY', label: '4. Dispatched', desc: 'Rider dock' },
          { status: 'OUT_FOR_DELIVERY', label: '5. Out for Delivery', desc: 'Rider route' },
          { status: 'DELIVERED', label: '6. Delivered', desc: 'Doorstep POD' },
        ];

        const currentStageIdx = stages.findIndex((s) => s.status === order.orderStatus);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base truncate">
                      Fulfill Order #{order.orderNumber}
                    </h3>
                    <span className="hidden sm:inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Store Operations Desk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Customer: {order.customerName} • +91 {order.customerPhone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs flex-1">
                {/* 1. Live Visual Stepper */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider">
                      Fulfillment Lifecycle Pipeline
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Current: {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {stages.map((st, idx) => {
                      const isPast = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      return (
                        <div
                          key={st.status}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : isPast
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : 'bg-white text-slate-400 border-slate-200 opacity-60'
                          }`}
                        >
                          <span className="block font-black text-[10px] leading-tight truncate">
                            {st.label}
                          </span>
                          <span className="text-[9px] opacity-75 truncate block mt-0.5">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Primary Next Action Card based on Store Lifecycle */}
                <div className="p-4 rounded-2xl border bg-white shadow-xs">
                  {order.orderStatus === 'ORDER_PLACED' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            Step 1: Confirm Order & Lock Stock
                          </h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            New order received. Confirming locks dark-store inventory and signals the warehouse team to prepare items.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() =>
                            handleAdvanceStatus(
                              order.id,
                              'ORDER_CONFIRMED',
                              'Order confirmed by store manager. Inventory locked.'
                            )
                          }
                          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Order (Mark as Processed)</span>
                        </button>
                        <button
                          onClick={() =>
                            handleAdvanceStatus(order.id, 'CANCELLED', 'Cancelled by store manager')
                          }
                          className="px-3.5 py-2.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {order.orderStatus === 'ORDER_CONFIRMED' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            Step 2: Forward to Dark-Store Pickers
                          </h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Order is verified. Move to picking state to enable item checklist verification in dark store aisles.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order.id,
                            'BEING_PREPARED',
                            'Items being picked from dark store aisles by warehouse picker'
                          )
                        }
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Start Item Picking</span>
                      </button>
                    </div>
                  )}

                  {order.orderStatus === 'BEING_PREPARED' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shrink-0">
                          3
                        </div>
                        <div className="flex-1">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            Step 3: Pack & Dispatch to Rider Panel
                          </h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Check off items in the checklist below. Once packed in the crate, dispatch it to make it immediately available for rider pickup in the Rider Panel.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-[11px] text-slate-700">
                              Picking Progress: {pickedCount} / {totalItemsCount} units
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAllPicked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isAllPicked ? '✓ All Items Picked' : 'Picking in progress'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            assignDeliveryStaff(order.id, 'user-del-staff', 'Amit Singh');
                            handleAdvanceStatus(
                              order.id,
                              'READY_FOR_DELIVERY',
                              'Packed in insulated bag and staged at dispatch dock for rider pickup'
                            );
                          }}
                          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>Ready to Dispatch (Send to Rider Panel)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {order.orderStatus === 'READY_FOR_DELIVERY' && (
                    <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Bike className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-indigo-950 text-sm">
                            Dispatched & Staged at Hub Dispatch Dock!
                          </h4>
                          <p className="text-indigo-900/80 text-[11px] mt-0.5">
                            This consignment is now visible in the <strong>Rider Panel</strong> (`/admin/delivery`) where the delivery rider will accept it, confirm pickup, and start out for delivery.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/admin/delivery"
                          className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <span>Go to Rider Panel (Delivery & Fleet)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <div className="p-3.5 bg-purple-50/80 rounded-xl border border-purple-200 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <Truck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <h4 className="font-extrabold text-purple-950 text-sm">
                            Consignment Out for Delivery
                          </h4>
                          <p className="text-purple-900/80 text-[11px] mt-0.5">
                            Rider <strong>{order.deliveryStaffName || 'Amit Singh'}</strong> picked up this parcel and is currently en route to the customer doorstep.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/admin/delivery"
                        className="px-3.5 py-1.5 bg-white border border-purple-300 text-purple-900 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 hover:bg-purple-50"
                      >
                        <span>View Rider Live Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {order.orderStatus === 'DELIVERED' && (
                    <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-emerald-950 text-sm">
                            Successfully Delivered at Doorstep!
                          </h4>
                          <p className="text-emerald-900/80 text-[11px] mt-0.5">
                            Consignment handed over to customer. Doorstep proof of delivery has been captured by rider.
                          </p>
                        </div>
                      </div>

                      {/* Proof of Delivery Photo Preview */}
                      {order.deliveryProofPhoto ? (
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                          <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-emerald-700" />
                            Doorstep Proof of Delivery Photo (Captured by Rider)
                          </span>
                          <div className="relative max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                            <img
                              src={order.deliveryProofPhoto}
                              alt="Proof of Delivery"
                              className="w-full h-44 object-cover"
                            />
                            <div className="p-2 bg-slate-950/80 text-white text-[10px] font-medium flex items-center justify-between">
                              <span>✓ Handover Photo Verified</span>
                              {order.deliveryProofTimestamp && (
                                <span>{formatDateTime(order.deliveryProofTimestamp)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Delivered with customer doorstep OTP confirmation.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Items picking checklist with interactive checkboxes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold text-slate-800">
                      Warehouse Item Checklist ({order.items.length} SKUs • {totalItemsCount} units)
                    </h4>
                    <button
                      onClick={handlePrintSlip}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Packing Slip</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {order.items.map((i, idx) => {
                      const isPicked = !!order.pickedItems?.[i.variantId];
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 flex items-center justify-between transition-colors ${
                            isPicked ? 'bg-emerald-50/50' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Interactive checkbox for warehouse picker */}
                            <button
                              type="button"
                              onClick={() => toggleOrderItemPicked(order.id, i.variantId)}
                              aria-label={`Mark ${i.productName} as picked`}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                                isPicked
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-300'
                              }`}
                            >
                              {isPicked ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>

                            <img
                              src={i.image}
                              alt=""
                              className="w-11 h-11 object-cover rounded-xl border border-slate-200 bg-white"
                            />
                            <div>
                              <p className={`font-bold ${isPicked ? 'text-emerald-950' : 'text-slate-900'}`}>
                                {i.productName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {i.variantTitle} ({i.unit})
                                </span>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                  Shelf A{idx + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-xl font-black text-xs ${
                                isPicked
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              Qty: {i.quantity}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-bold mt-1">
                              {formatPrice(i.purchasedPrice * i.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Delivery Details & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-extrabold text-slate-400 text-[10px] uppercase block mb-1">
                      Delivery Address
                    </span>
                    <p className="font-bold text-slate-900">{order.deliveryAddress.name}</p>
                    <p className="text-slate-600 mt-0.5">
                      {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}
                    </p>
                    <p className="text-slate-700 font-mono font-bold mt-1">
                      Ph: +91 {order.customerPhone}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-extrabold text-slate-400 text-[10px] uppercase block mb-1">
                      Fulfillment Slot & Payment
                    </span>
                    <p className="font-bold text-slate-900">{order.deliverySlot.dateLabel}</p>
                    <p className="text-emerald-700 font-extrabold">{order.deliverySlot.timeSlot}</p>
                    <p className="text-slate-700 font-bold mt-1">
                      {order.paymentMethod !== 'COD' ? 'Razorpay Online' : 'Cash on Delivery'} • {formatPrice(order.grandTotal)}
                    </p>
                  </div>
                </div>

                {/* 5. Fast Manual Override Toolbar (Optional for store manager / testing) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-600">Quick Status Override:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'ORDER_CONFIRMED', 'Manual override')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'BEING_PREPARED', 'Manual override')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Picking
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'READY_FOR_DELIVERY', 'Manual override')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Ready
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'OUT_FOR_DELIVERY', 'Manual override')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Out
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'DELIVERED', 'Manual override')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Delivered
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Close Desk
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
