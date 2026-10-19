'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  Search,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatDateTime } from '@/lib/utils';
import { InventoryChangeType } from '@/types';

export default function AdminInventoryPage() {
  const { products, inventoryHistory, adjustStock } = useStore();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'AUDIT_LOG'>('STOCK');
  const [search, setSearch] = useState('');
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

  const filteredVariants = flatVariants.filter((v) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Stock Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Real-time variant inventory tracking with immutable audit trail (Spec Section 13)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'STOCK'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Stock ({flatVariants.length} SKUs)
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT_LOG'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History ({inventoryHistory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'STOCK' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search SKU code, product, or variant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Single-Warehouse Hub 1
            </span>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Product Name & Variant</th>
                    <th className="py-3 px-4">Total Stock</th>
                    <th className="py-3 px-4">Reserved</th>
                    <th className="py-3 px-4">Available to Sell</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredVariants.map((item) => {
                    const isLow = item.stock <= 5 && item.stock > 0;
                    const isOut = item.stock <= 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {item.sku}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                          <span className="text-[10px] text-slate-500">
                            {item.brand} • <strong className="text-slate-700">{item.title}</strong> ({item.unit})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {item.stock}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-semibold">
                          {item.reservedStock}
                        </td>

                        <td className="py-3.5 px-4 font-black text-emerald-800 text-sm">
                          {item.availableToSell}
                        </td>

                        <td className="py-3.5 px-4">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Low ({item.stock} left)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Healthy
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
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
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-300 transition-colors inline-flex items-center gap-1"
                          >
                            <ArrowUpDown className="w-3 h-3" /> Adjust
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
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Immutable Inventory Audit Log
              </h3>
              <p className="text-[11px] text-slate-500">
                Every stock delta recorded with timestamp, operator, and business reason
              </p>
            </div>
            <span className="text-xs text-slate-500 font-bold">
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
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.variantTitle} • {item.sku}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-black text-sm ${
                          item.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {item.previousStock} ➜ <strong>{item.newStock}</strong>
                    </td>

                    <td className="py-3 px-4 text-slate-700 max-w-xs">{item.reason}</td>

                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Adjust Inventory Stock</h3>
                <p className="text-[10px] text-slate-300">Audited stock correction</p>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePerformAdjustment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900">{selectedVariant.productName}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedVariant.variantTitle} • SKU: {selectedVariant.sku}
                </p>
                <p className="text-xs font-bold text-emerald-800 mt-1">
                  Current Stock: {selectedVariant.currentStock} units
                </p>
              </div>

              {/* Adjust Type */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    adjustType === 'ADD'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  + Add Received Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('REMOVE')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    adjustType === 'REMOVE'
                      ? 'bg-rose-700 text-white border-rose-700'
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
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Reason for Audit Record
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-sm hover:bg-emerald-800"
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
