'use client';

import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  X,
  Phone,
  MapPin,
  AlertCircle,
  User,
  ShoppingBag,
  ArrowRight,
  Filter,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Orders & Warehouse Fulfillment
          </h1>
          <p className="text-xs text-slate-500">
            Fulfillment desk: Picking, packing, dispatch, and delivery partner handoffs (Spec Section 16)
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'ORDER_PLACED', label: 'New Orders' },
          { key: 'ORDER_CONFIRMED', label: 'Confirmed' },
          { key: 'BEING_PREPARED', label: 'Packing & Picking' },
          { key: 'READY_FOR_DELIVERY', label: 'Ready for Dispatch' },
          { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
          { key: 'DELIVERED', label: 'Delivered' },
        ].map((tab) => {
          const isSelected = statusFilter === tab.key;
          const count =
            tab.key === 'ALL'
              ? orders.length
              : orders.filter((o) => o.orderStatus === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order #, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          Showing {filteredOrders.length} orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3 px-4">Customer & Address</th>
                <th className="py-3 px-4">Delivery Slot</th>
                <th className="py-3 px-4">Amount & Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-slate-900 text-xs block">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(ord.createdAt)}
                    </span>
                    <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                      {ord.items.length} items
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{ord.customerName}</p>
                    <p className="text-[11px] text-slate-500">
                      {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      +91 {ord.customerPhone}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block text-xs">
                      {ord.deliverySlot.dateLabel}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      {ord.deliverySlot.timeSlot}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 text-sm block">
                      {formatPrice(ord.grandTotal)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {ord.paymentMethod} •{' '}
                      <span className={ord.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}>
                        {ord.paymentStatus}
                      </span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : ord.orderStatus === 'BEING_PREPARED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Process ➜
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Fulfillment Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Fulfill Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-300">
                  Customer: {selectedOrder.customerName} • {selectedOrder.customerPhone}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Order Status Advancement Control */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="font-bold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
                  Update Order Lifecycle Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'ORDER_CONFIRMED', 'Order verified and inventory locked')
                    }
                    className={`p-2 rounded-xl border text-xs font-bold text-left ${
                      selectedOrder.orderStatus === 'ORDER_CONFIRMED'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    1. Confirm Order
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'BEING_PREPARED', 'Items being picked from aisle B4')
                    }
                    className={`p-2 rounded-xl border text-xs font-bold text-left ${
                      selectedOrder.orderStatus === 'BEING_PREPARED'
                        ? 'bg-purple-800 text-white border-purple-800'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    2. Start Packing
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'READY_FOR_DELIVERY', 'Packed in crate & ready at dispatch counter')
                    }
                    className={`p-2 rounded-xl border text-xs font-bold text-left ${
                      selectedOrder.orderStatus === 'READY_FOR_DELIVERY'
                        ? 'bg-blue-800 text-white border-blue-800'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    3. Ready for Dispatch
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
                    className={`p-2 rounded-xl border text-xs font-bold text-left ${
                      selectedOrder.orderStatus === 'OUT_FOR_DELIVERY'
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    4. Out for Delivery
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'DELIVERED', 'Delivered to customer at doorstep')
                    }
                    className={`p-2 rounded-xl border text-xs font-bold text-left ${
                      selectedOrder.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    5. Mark Delivered
                  </button>

                  <button
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, 'CANCELLED', 'Order cancelled by store operator')
                    }
                    className={`p-2 rounded-xl border text-xs font-bold text-left text-rose-700 ${
                      selectedOrder.orderStatus === 'CANCELLED'
                        ? 'bg-rose-700 text-white border-rose-700'
                        : 'bg-white hover:bg-rose-50 border-rose-300'
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Items picking checklist */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Warehouse Item Checklist ({selectedOrder.items.length} items)
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={i.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{i.productName}</p>
                          <span className="text-[11px] text-slate-500">
                            {i.variantTitle} ({i.unit})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs">
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
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                    Customer Address
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrder.deliveryAddress.name}</p>
                  <p className="text-slate-600">
                    {selectedOrder.deliveryAddress.houseNumber}, {selectedOrder.deliveryAddress.street}
                  </p>
                  <p className="text-slate-500 font-bold">Ph: +91 {selectedOrder.customerPhone}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                    Slot & Payment
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrder.deliverySlot.dateLabel}</p>
                  <p className="text-emerald-800 font-black">{selectedOrder.deliverySlot.timeSlot}</p>
                  <p className="text-slate-700 font-semibold mt-1">
                    {selectedOrder.paymentMethod} • {formatPrice(selectedOrder.grandTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
