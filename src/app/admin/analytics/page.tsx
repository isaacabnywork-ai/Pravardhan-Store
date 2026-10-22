'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  Percent,
  Download,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { orders } = useStore();
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'ALL'>('30');
  const [isExporting, setIsExporting] = useState(false);

  // Derived metrics from store orders
  const paidOrders = orders.filter(
    (o) => o.orderStatus === 'DELIVERED' || o.paymentMethod !== 'COD'
  );
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const aov = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // Payment Breakdown
  const onlineOrders = orders.filter((o) => o.paymentMethod !== 'COD');
  const codOrders = orders.filter((o) => o.paymentMethod === 'COD');
  const onlineShare = orders.length > 0 ? Math.round((onlineOrders.length / orders.length) * 100) : 0;
  const codShare = 100 - onlineShare;

  // Daily Trends Mock/Derived
  const days = [
    { day: 'Mon', revenue: totalRevenue * 0.12, orders: Math.max(1, Math.round(orders.length * 0.12)) },
    { day: 'Tue', revenue: totalRevenue * 0.15, orders: Math.max(1, Math.round(orders.length * 0.14)) },
    { day: 'Wed', revenue: totalRevenue * 0.11, orders: Math.max(1, Math.round(orders.length * 0.11)) },
    { day: 'Thu', revenue: totalRevenue * 0.18, orders: Math.max(2, Math.round(orders.length * 0.18)) },
    { day: 'Fri', revenue: totalRevenue * 0.22, orders: Math.max(2, Math.round(orders.length * 0.21)) },
    { day: 'Sat', revenue: totalRevenue * 0.25, orders: Math.max(3, Math.round(orders.length * 0.26)) },
    { day: 'Sun', revenue: totalRevenue * 0.28, orders: Math.max(3, Math.round(orders.length * 0.28)) },
  ];
  const maxDailyRevenue = Math.max(...days.map((d) => d.revenue), 1000);

  // Top SKUs Velocity
  const skuCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      if (!skuCounts[item.productId]) {
        skuCounts[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      skuCounts[item.productId].quantity += item.quantity;
      skuCounts[item.productId].revenue += item.purchasedPrice * item.quantity;
    }
  }

  const topSkus = Object.values(skuCounts)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Simulate CSV file download
      const csvData =
        'Date,OrderNumber,Customer,GrandTotal,PaymentMethod,Status\n' +
        orders
          .map(
            (o) =>
              `${o.createdAt},${o.orderNumber},${o.customerName},${o.grandTotal},${o.paymentMethod},${o.orderStatus}`
          )
          .join('\n');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pravdhan-sales-report-${period}d.csv`;
      a.click();
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Analytics & GMV Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              Live Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Financial performance, dark-store order velocity, and customer payment breakdown
          </p>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center shadow-xs overflow-x-auto">
            {(['7', '30', '90', 'ALL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  period === p
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {p === 'ALL' ? 'All Time' : `${p}D`}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3.5 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Responsive 2x2 on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total GMV */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Realized GMV
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(totalRevenue)}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs font-bold text-emerald-700 truncate">
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span>+18.6% vs cycle</span>
            </div>
          </div>
        </div>

        {/* Total Orders Completed */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Paid Orders
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {paidOrders.length}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs font-bold text-blue-700 truncate">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              <span>{orders.length} total placed</span>
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              AOV
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(aov)}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs font-bold text-indigo-700 truncate">
              <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
              <span>Healthy basket</span>
            </div>
          </div>
        </div>

        {/* Discounts & Coupon Burn */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Promos Burn
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(totalDiscounts)}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs font-bold text-amber-700 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>Coupon discounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Velocity Visual Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Revenue & Velocity Trend
              </h3>
              <p className="text-xs text-slate-500">
                Estimated sales trajectory across the 7-day operating cycle
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
              Hub #01 Telemetry
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-60 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {days.map((item) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxDailyRevenue) * 100));
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white px-2 py-1 rounded-lg font-bold shadow-md pointer-events-none whitespace-nowrap mb-1">
                    {formatPrice(item.revenue)} ({item.orders} orders)
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl group-hover:from-emerald-700 group-hover:to-teal-500 transition-all shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-bold text-slate-600 mt-1">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span>Fulfilled Orders GMV</span>
            </span>
            <span>Peak Demand: Weekends (Sat - Sun)</span>
          </div>
        </div>

        {/* Right 1 Col: Payment Mode Share */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Payment Gateway Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Razorpay UPI/Cards vs Cash on Delivery share
            </p>
          </div>

          <div className="space-y-4">
            {/* Visual Bar Split */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Razorpay ({onlineShare}%)
                </span>
                <span className="text-amber-800 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" /> COD ({codShare}%)
                </span>
              </div>
              <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full transition-all"
                  style={{ width: `${onlineShare}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${codShare}%` }}
                />
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Online Transactions</span>
                <span className="font-extrabold text-slate-900">{onlineOrders.length} orders</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">COD Doorstep Collections</span>
                <span className="font-extrabold text-slate-900">{codOrders.length} orders</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <span className="text-slate-600">Payment Gateway SLA</span>
                <span className="font-bold text-emerald-700">100% Success</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-[11px] text-blue-900 leading-snug">
              <strong>Quick Commerce Tip:</strong> Razorpay payments reduce rider cash handling delays by an average of 3.4 minutes per doorstep delivery.
            </div>
          </div>
        </div>
      </div>

      {/* Top SKUs Table & Peak Slot Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Top Revenue Generating SKUs
              </h3>
              <p className="text-xs text-slate-500">Highest velocity products by volume and gross revenue</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Item & Variant</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topSkus.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No order velocity recorded yet in this cycle.
                    </td>
                  </tr>
                ) : (
                  topSkus.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{sku.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Rank #{idx + 1} SKU</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {sku.quantity} units
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatPrice(sku.revenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <TrendingUp className="w-3 h-3" /> High Velocity
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peak Slot Utilization */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">
              Delivery Slot Demand
            </h3>
            <p className="text-xs text-slate-500">Peak ordering hours across daytime dispatch windows</p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { slot: 'Morning (07:00 AM - 10:00 AM)', pct: 45, status: 'Peak Demand 🚀', color: 'bg-emerald-600' },
              { slot: 'Midday (11:00 AM - 02:00 PM)', pct: 20, status: 'Moderate', color: 'bg-blue-500' },
              { slot: 'Evening (05:00 PM - 08:00 PM)', pct: 75, status: 'Super Peak ⚡', color: 'bg-purple-600' },
              { slot: 'Night (08:00 PM - 10:00 PM)', pct: 30, status: 'Steady', color: 'bg-slate-600' },
            ].map((slot) => (
              <div key={slot.slot} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">{slot.slot}</span>
                  <span className="text-[10px] text-slate-500">{slot.status}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${slot.color}`} style={{ width: `${slot.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
