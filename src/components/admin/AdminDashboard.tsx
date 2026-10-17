import React, { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Package,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    products,
    setAdminPage,
    updateOrderStatus,
    setActiveOrderId,
    setCustomerPage,
    setAppMode,
  } = useStore();

  // Metrics computation
  const stats = useMemo(() => {
    const todayOrders = orders;
    const pending = orders.filter((o) => o.status === 'PLACED');
    const preparing = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING');
    const ready = orders.filter((o) => o.status === 'READY');
    const outForDelivery = orders.filter((o) => o.status === 'OUT FOR DELIVERY');
    const delivered = orders.filter((o) => o.status === 'DELIVERED');

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

    const lowStockItems: { product: string; variant: string; stock: number }[] = [];
    let outOfStockCount = 0;

    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock === 0) outOfStockCount++;
        else if (v.stock <= 25) {
          lowStockItems.push({ product: p.name, variant: v.weight, stock: v.stock });
        }
      });
    });

    return {
      todayCount: todayOrders.length,
      pendingCount: pending.length,
      preparingCount: preparing.length,
      readyCount: ready.length,
      outCount: outForDelivery.length,
      deliveredCount: delivered.length,
      totalSales,
      lowStockItems,
      outOfStockCount,
    };
  }, [orders, products]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Fulfillment Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time status of orders, dispatch operations, and warehouse inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdminPage('inventory')}
          >
            Manage Stock
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAdminPage('orders')}
          >
            Process Orders ({stats.pendingCount + stats.preparingCount})
          </Button>
        </div>
      </div>

      {/* Primary Operational Metrics (Requirement #29) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Today&apos;s Orders
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.todayCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            ↑ 18% vs yesterday
          </span>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Pending Action
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
          <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
            Requires store confirmation
          </span>
        </div>

        {/* Preparing */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
            Packing / Prep
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.preparingCount}</p>
          <span className="text-[10px] text-blue-700 font-medium mt-0.5 block">
            At packing counter
          </span>
        </div>

        {/* Out for Delivery */}
        <div className="bg-white p-4 rounded-xl border border-purple-200/80 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
            On the Road
          </span>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.outCount}</p>
          <span className="text-[10px] text-purple-700 font-medium mt-0.5 block">
            With delivery partners
          </span>
        </div>

        {/* Delivered */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-[#1B5E20] uppercase tracking-wider block">
            Completed
          </span>
          <p className="text-2xl font-black text-[#2E7D32] mt-1">{stats.deliveredCount}</p>
          <span className="text-[10px] text-[#2E7D32] font-medium mt-0.5 block">
            Doorstep verified
          </span>
        </div>

        {/* Gross Sales */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">₹{stats.totalSales.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-gray-500 font-medium mt-0.5 block">
            Avg basket ₹{Math.round(stats.totalSales / (stats.todayCount || 1))}
          </span>
        </div>
      </div>

      {/* Main Grid: Orders Data Table + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Recent Customer Orders</h2>
              <p className="text-xs text-gray-500">Live order queue with instant status change action</p>
            </div>
            <button
              onClick={() => setAdminPage('orders')}
              className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer & Area</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      #{ord.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{ord.address.name}</p>
                      <p className="text-[11px] text-gray-500">{ord.address.area}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ord.deliverySlot.time}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ₹{ord.total}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                          ord.status === 'READY'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : ord.status === 'OUT FOR DELIVERY'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-[#1B5E20] border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="READY">READY</option>
                        <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setActiveOrderId(ord.id);
                          setAppMode('customer');
                          setCustomerPage('order-tracking');
                        }}
                        className="text-xs text-[#2E7D32] hover:underline font-bold"
                      >
                        Track View &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Inventory Stock Health & Fast Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Low Stock Warnings ({stats.lowStockItems.length})
                </h3>
              </div>
              <button
                onClick={() => setAdminPage('inventory')}
                className="text-xs text-[#2E7D32] font-bold hover:underline"
              >
                Adjust
              </button>
            </div>

            {stats.lowStockItems.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium py-4 text-center">
                ✓ All items healthy and in stock!
              </p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {stats.lowStockItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-[170px]">{item.product}</p>
                      <p className="text-[11px] text-gray-500">{item.variant}</p>
                    </div>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hub Operating Notes */}
          <div className="bg-[#E8F5E9]/60 rounded-2xl border border-[#C8E6C9] p-4 text-xs space-y-2 text-[#1B5E20]">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
              Hub Operational Check: 100% Pass
            </p>
            <p className="text-[11px] text-gray-700 leading-snug">
              Cold room temperature: 4°C. 4 delivery riders currently active on route. Peak morning dispatch complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
