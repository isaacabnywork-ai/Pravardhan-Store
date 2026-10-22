'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Search,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowUpDown,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatDateTime, formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const { products, inventoryHistory, adjustStock } = useStore();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'AUDIT_LOG'>('STOCK');
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [selectedVariant, setSelectedVariant] = useState<{
    id: string;
    productName: string;
    variantTitle: string;
    sku: string;
    currentStock: number;
  } | null>(null);

  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [reason, setReason] = useState('Direct shipment received from ITC / Mandi');

  // Flatten all variants with their parent product
  const flatVariants = products.flatMap((p) =>
    p.variants.map((v) => ({
      ...v,
      productId: p.id,
      productName: p.name,
      brand: p.brand,
      availableToSell: Math.max(0, v.stock - v.reservedStock),
    }))
  );

  const totalStockUnits = flatVariants.reduce((sum, v) => sum + v.stock, 0);
  const totalValuation = flatVariants.reduce((sum, v) => sum + v.stock * v.price, 0);
  const lowStockCount = flatVariants.filter((v) => v.stock <= 5 && v.stock > 0).length;
  const outOfStockCount = flatVariants.filter((v) => v.stock <= 0).length;

  const filteredVariants = flatVariants.filter((v) => {
    if (filterHealth === 'LOW' && (v.stock > 5 || v.stock <= 0)) return false;
    if (filterHealth === 'OUT' && v.stock > 0) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.productName.toLowerCase().includes(q) ||
      v.sku.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.title.toLowerCase().includes(q)
    );
  });

  const handlePerformAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    const change = adjustType === 'ADD' ? Math.abs(adjustQty) : -Math.abs(adjustQty);
    const updatedBy = user ? `${user.name} (${user.role})` : 'Store Operator';

    adjustStock(selectedVariant.id, change, reason, updatedBy);
    setSelectedVariant(null);
  };

  const handleQuickInlineAdjust = (variantId: string, delta: number, currentStock: number) => {
    if (currentStock + delta < 0) return;
    const updatedBy = user ? `${user.name} (${user.role})` : 'Floor Supervisor';
    const reasonText = delta > 0 ? 'Quick Floor Restock' : 'Floor Breakage / Damage';
    adjustStock(variantId, delta, reasonText, updatedBy);
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Real-Time Inventory & Stock Ledger
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Boxes className="w-3.5 h-3.5" />
              {flatVariants.length} Active SKUs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time variant inventory tracking, dark store safety buffers, and immutable audit ledger
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'STOCK'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Ledger ({flatVariants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'AUDIT_LOG'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History ({inventoryHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Stock Health KPI Strip - Responsive 2x2 on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Valuation
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(totalValuation)}
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 block truncate">
              {totalStockUnits} units total
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Stocked & Healthy
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-700 tracking-tight">
              {flatVariants.length - (lowStockCount + outOfStockCount)} SKUs
            </h2>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 block truncate">
              Buffer &gt; 5 units
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Low Stock Alert
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-amber-700 tracking-tight">
              {lowStockCount} SKUs
            </h2>
            <span className="text-[10px] sm:text-xs text-amber-600 font-medium mt-0.5 block truncate">
              Needs reorder
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Out of Stock
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-rose-700 tracking-tight">
              {outOfStockCount} SKUs
            </h2>
            <span className="text-[10px] sm:text-xs text-rose-600 font-medium mt-0.5 block truncate">
              0 availability
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'STOCK' ? (
        <div className="space-y-4">
          {/* Search bar & Quick Health Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search SKU code, item name, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterHealth('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterHealth === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({flatVariants.length})
              </button>
              <button
                onClick={() => setFilterHealth('LOW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterHealth === 'LOW'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Low Stock ({lowStockCount})
              </button>
              <button
                onClick={() => setFilterHealth('OUT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterHealth === 'OUT'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Out of Stock ({outOfStockCount})
              </button>
            </div>
          </div>

          {/* Full Width Stock Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">SKU Code</th>
                    <th className="py-3.5 px-4">Item & Variant</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4 text-center">Physical Stock</th>
                    <th className="py-3.5 px-4 text-center">Reserved</th>
                    <th className="py-3.5 px-4 text-center">Available to Sell</th>
                    <th className="py-3.5 px-4">Health Status</th>
                    <th className="py-3.5 px-4 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredVariants.map((item) => {
                    const isLow = item.stock <= 5 && item.stock > 0;
                    const isOut = item.stock <= 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                          {item.sku}
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900 text-xs line-clamp-1">{item.productName}</p>
                          <span className="text-[11px] text-slate-500">
                            {item.brand} • <strong className="text-slate-700">{item.title}</strong> ({item.unit})
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-800">
                          {formatPrice(item.price)}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => handleQuickInlineAdjust(item.id, -1, item.stock)}
                              className="w-5 h-5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                              title="Deduct 1 unit"
                            >
                              -
                            </button>
                            <span className="font-black text-slate-900 text-sm px-1.5">{item.stock}</span>
                            <button
                              onClick={() => handleQuickInlineAdjust(item.id, 1, item.stock)}
                              className="w-5 h-5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                              title="Add 1 unit"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center text-slate-500 font-semibold">
                          {item.reservedStock}
                        </td>

                        <td className="py-4 px-4 text-center font-black text-emerald-700 text-sm">
                          {item.availableToSell}
                        </td>

                        <td className="py-4 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                              <AlertCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> Low ({item.stock} left)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Optimal
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedVariant({
                                id: item.id,
                                productName: item.productName,
                                variantTitle: item.title,
                                sku: item.sku,
                                currentStock: item.stock,
                              })
                            }
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-300 transition-colors inline-flex items-center gap-1.5"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span>Batch Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Log Tab */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                Immutable Inventory Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every stock delta recorded with timestamp, operator, and business reason
              </p>
            </div>
            <span className="text-xs text-slate-500 font-bold bg-white px-3 py-1 rounded-xl border border-slate-200">
              Total events: {inventoryHistory.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Delta</th>
                  <th className="py-3 px-4">Before ➜ After</th>
                  <th className="py-3 px-4">Reason & Notes</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventoryHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          item.changeType === 'STOCK_RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.changeType === 'ORDER_RESERVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.changeType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.variantTitle} • {item.sku}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-sm ${
                          item.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {item.previousStock} ➜ <strong>{item.newStock}</strong>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">{item.reason}</td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap font-medium">
                      {item.updatedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="font-bold text-sm sm:text-base truncate">Adjust Inventory Stock</h3>
                <p className="text-xs text-slate-300 truncate">Audited dark-store stock correction</p>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePerformAdjustment} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{selectedVariant.productName}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {selectedVariant.variantTitle} • SKU: {selectedVariant.sku}
                </p>
                <p className="text-xs font-bold text-emerald-800 mt-2">
                  Current Stock: <strong>{selectedVariant.currentStock} units</strong>
                </p>
              </div>

              {/* Adjust Type */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${
                    adjustType === 'ADD'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('REMOVE')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${
                    adjustType === 'REMOVE'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  - Deduct / Damage
                </button>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Reason for Audit Record
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white outline-none focus:border-emerald-600"
                >
                  <option value="Direct shipment received from ITC / Mandi">
                    Direct shipment received from ITC / Mandi
                  </option>
                  <option value="Warehouse count correction (physical recount)">
                    Warehouse count correction (physical recount)
                  </option>
                  <option value="Damaged / broken packaging in aisle">
                    Damaged / broken packaging in aisle
                  </option>
                  <option value="Expired / near-expiry stock removed">
                    Expired / near-expiry stock removed
                  </option>
                  <option value="Quality check rejection">Quality check rejection</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-sm shadow-emerald-700/20 hover:bg-emerald-800 transition-colors"
                >
                  Confirm & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
