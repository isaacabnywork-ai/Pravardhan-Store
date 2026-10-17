import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Package,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { OrderStatus } from '@/types';

export const OrdersScreen: React.FC = () => {
  const {
    orders,
    navigateToOrderTracking,
    setCustomerPage,
    addToCart,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  const displayedOrders =
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'completed'
      ? pastOrders
      : orders;

  const handleReorder = (order: typeof orders[0]) => {
    order.items.forEach((item) => {
      addToCart(item.product, item.variantId, item.quantity);
    });
    showToast(`Items from #${order.orderNumber} added to cart`, 'success');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="text-[10px] font-black uppercase text-[#0C831F] bg-[#F0F8F1] px-2 py-0.5 rounded">
            Delivered
          </span>
        );
      case 'OUT FOR DELIVERY':
        return (
          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded animate-pulse">
            Out for Delivery
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black uppercase text-[#0C831F] bg-[#F0F8F1] px-2 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">Orders</span>
      </nav>

      {/* Header & Filter Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#1C1C1C] tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track active shipments, view bills &amp; 1-click reorder
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-[#1C1C1C] shadow-xs'
                : 'text-gray-500 hover:text-[#1C1C1C]'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white text-[#0C831F] shadow-xs'
                : 'text-gray-500 hover:text-[#1C1C1C]'
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-[#1C1C1C] shadow-xs'
                : 'text-gray-500 hover:text-[#1C1C1C]'
            }`}
          >
            Past ({pastOrders.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 shadow-soft">
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No orders found"
            description="Explore our fresh fruits, vegetables, dairy, and grocery items to place your first order with 15-min delivery!"
            actionText="Start Shopping"
            onAction={() => setCustomerPage('home')}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {displayedOrders.map((order) => {
            const isCompleted = order.status === 'DELIVERED';
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-3.5 hover:border-gray-300 transition-all"
              >
                {/* Top: Order number, date, status */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-[#1C1C1C]">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-[#1C1C1C]">
                      ₹{order.total}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Items preview thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {order.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex items-center gap-1.5 p-1 rounded-lg bg-gray-50 border border-gray-100 shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-7 h-7 object-contain mix-blend-multiply"
                      />
                      <span className="text-[11px] text-gray-700 font-bold max-w-[100px] truncate">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-gray-400">&times;{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom actions: Track Order, Reorder */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 truncate hidden sm:inline">
                    Slot: {order.deliverySlot.date} ({order.deliverySlot.time})
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Reorder
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigateToOrderTracking(order.id)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      {isCompleted ? 'View Receipt' : 'Track Order'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
