'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, assignDeliveryStaff } = useStore();

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
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
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base">Fulfill Order #{selectedOrder.orderNumber}</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live Dispatch Station
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Customer: {selectedOrder.customerName} • {selectedOrder.customerPhone}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Order Status Advancement Control */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <span className="font-extrabold text-slate-800 block mb-2 uppercase text-[10px] tracking-wider">
                  Update Order Lifecycle Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'ORDER_CONFIRMED', 'Order verified and inventory locked')
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedOrder.orderStatus === 'ORDER_CONFIRMED'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    1. Confirm Order
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'BEING_PREPARED', 'Items being picked from dark store aisles')
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedOrder.orderStatus === 'BEING_PREPARED'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    2. Start Picking
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'READY_FOR_DELIVERY', 'Packed in insulated delivery crate')
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedOrder.orderStatus === 'READY_FOR_DELIVERY'
                        ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    3. Ready to Dispatch
                  </button>

                  <button
                    onClick={() => {
                      assignDeliveryStaff(selectedOrder.id, 'user-del-staff', 'Amit Singh');
                      handleAdvanceStatus(
                        selectedOrder.id,
                        'OUT_FOR_DELIVERY',
                        'Dispatched with Amit Singh (+91 9833445566)'
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedOrder.orderStatus === 'OUT_FOR_DELIVERY'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    4. Out for Delivery
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'DELIVERED', 'Delivered to customer with doorstep OTP verified')
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedOrder.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    5. Mark Delivered
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'CANCELLED', 'Order cancelled by store operator')
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left text-rose-700 transition-all ${
                      selectedOrder.orderStatus === 'CANCELLED'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-white hover:bg-rose-50 border-rose-300'
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Items picking checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-800">
                    Warehouse Item Checklist ({selectedOrder.items.length} items)
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
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={i.image}
                          alt=""
                          className="w-11 h-11 object-cover rounded-xl border border-slate-200 bg-white"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{i.productName}</p>
                          <span className="text-[11px] text-slate-500">
                            {i.variantTitle} ({i.unit})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs">
                          Qty: {i.quantity}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-bold mt-1">
                          {formatPrice(i.purchasedPrice * i.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 text-[10px] uppercase block mb-1">
                    Delivery Address
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrder.deliveryAddress.name}</p>
                  <p className="text-slate-600 mt-0.5">
                    {selectedOrder.deliveryAddress.houseNumber}, {selectedOrder.deliveryAddress.street}
                  </p>
                  <p className="text-slate-700 font-mono font-bold mt-1">Ph: +91 {selectedOrder.customerPhone}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 text-[10px] uppercase block mb-1">
                    Fulfillment Slot & Payment
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrder.deliverySlot.dateLabel}</p>
                  <p className="text-emerald-700 font-extrabold">{selectedOrder.deliverySlot.timeSlot}</p>
                  <p className="text-slate-700 font-bold mt-1">
                    {selectedOrder.paymentMethod !== 'COD' ? 'Razorpay Online' : 'Cash on Delivery'} • {formatPrice(selectedOrder.grandTotal)}
                  </p>
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
      )}
    </div>
  );
}
