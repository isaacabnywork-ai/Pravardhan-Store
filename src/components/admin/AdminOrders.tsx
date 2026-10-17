import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses: OrderStatus[] = [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'ALL' || o.status === activeTab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.phone.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const handlePrintSlip = (orderNum: string) => {
    showToast(`Printing dispatch packing slip for #${orderNum}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process orders, assign to dispatch riders, and print packing slips
          </p>
        </div>
      </div>

      {/* Status Filter Tabs (Requirement #32) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          ALL ({orders.length})
        </button>

        {statuses.map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          const isActive = activeTab === st;

          return (
            <button
              key={st}
              onClick={() => setActiveTab(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by order #, customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-xs text-gray-500">
          Showing {filteredOrders.length} orders
        </span>
      </div>

      {/* Orders Operational Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Delivery Window</th>
                <th className="px-4 py-3">Amount & Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">
                    #{ord.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{ord.address.name}</p>
                    <p className="text-[11px] text-gray-500">{ord.address.phone}</p>
                    <p className="text-[11px] text-gray-400">{ord.address.area}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-800">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                    </span>
                    <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
                      {ord.items.map((i) => i.product.name).join(', ')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{ord.deliverySlot.time}</p>
                    <p className="text-[11px] text-gray-500">{ord.deliverySlot.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">₹{ord.total}</p>
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.2 rounded font-semibold text-gray-700">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold px-2.5 py-1 rounded border outline-none cursor-pointer ${
                        ord.status === 'READY'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : ord.status === 'OUT FOR DELIVERY'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : ord.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-[#1B5E20] border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePrintSlip(ord.orderNumber)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                        title="Print Packing Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <Drawer
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber} Details`}
          subtitle={`Placed on ${new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          maxWidth="md"
        >
          <div className="space-y-6 text-xs -mx-5 -my-5 p-5">
            {/* Status changer & Quick Progression */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Fulfillment Status:</span>
                <span className="font-extrabold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded">
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedOrder.status === 'PLACED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'CONFIRMED');
                      setSelectedOrder({ ...selectedOrder, status: 'CONFIRMED' });
                    }}
                  >
                    Confirm Order
                  </Button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'PREPARING');
                      setSelectedOrder({ ...selectedOrder, status: 'PREPARING' });
                    }}
                  >
                    Start Packing
                  </Button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'READY');
                      setSelectedOrder({ ...selectedOrder, status: 'READY' });
                    }}
                  >
                    Mark Ready for Dispatch
                  </Button>
                )}
                {selectedOrder.status === 'READY' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'OUT FOR DELIVERY');
                      setSelectedOrder({ ...selectedOrder, status: 'OUT FOR DELIVERY' });
                    }}
                  >
                    Dispatch with Rider
                  </Button>
                )}
                {selectedOrder.status === 'OUT FOR DELIVERY' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'DELIVERED');
                      setSelectedOrder({ ...selectedOrder, status: 'DELIVERED' });
                    }}
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="space-y-1.5 p-3.5 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Customer Destination
              </span>
              <p className="font-bold text-gray-900 text-sm">{selectedOrder.address.name}</p>
              <p className="text-gray-600">{selectedOrder.address.phone}</p>
              <p className="text-gray-600">
                {selectedOrder.address.houseNo}, {selectedOrder.address.street}, {selectedOrder.address.area}, {selectedOrder.address.city} - {selectedOrder.address.pincode}
              </p>
            </div>

            {/* Packing Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                Warehouse Packing Checklist ({selectedOrder.items.length} items)
              </span>

              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="p-3 flex items-center justify-between bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.product.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          SKU: {item.variant.sku} • {item.variant.weight}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-gray-900 bg-gray-50 px-2.5 py-1 rounded">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-gray-50 rounded-xl space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.savings > 0 && (
                <div className="flex justify-between text-[#2E7D32]">
                  <span>Product Savings</span>
                  <span>-₹{selectedOrder.savings}</span>
                </div>
              )}
              {selectedOrder.couponDiscount > 0 && (
                <div className="flex justify-between text-[#2E7D32]">
                  <span>Coupon ({selectedOrder.couponCode})</span>
                  <span>-₹{selectedOrder.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-gray-200 font-bold text-sm text-gray-900">
                <span>Total Amount</span>
                <span>₹{selectedOrder.total} ({selectedOrder.paymentStatus})</span>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => handlePrintSlip(selectedOrder.orderNumber)}
            >
              Print Receipt & Packing Slip
            </Button>
          </div>
        </Drawer>
      )}
    </div>
  );
};
