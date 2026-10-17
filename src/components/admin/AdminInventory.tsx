import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Layers,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  RotateCw,
  CheckCircle,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { products, updateStock } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [adjustModalItem, setAdjustModalItem] = useState<{
    productId: string;
    variantId: string;
    productName: string;
    variantWeight: string;
    currentStock: number;
  } | null>(null);

  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Restock Batch Arrival');

  // Flatten products and variants
  const inventoryItems = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      variantId: v.id,
      productName: p.name,
      brand: p.brand,
      category: p.category,
      variantWeight: v.weight,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      image: p.images[0],
    }))
  );

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());

    if (stockFilter === 'out') return matchesSearch && item.stock === 0;
    if (stockFilter === 'low') return matchesSearch && item.stock > 0 && item.stock <= 25;
    return matchesSearch;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem) return;

    updateStock(
      adjustModalItem.productId,
      adjustModalItem.variantId,
      adjustmentAmount,
      adjustmentReason
    );
    setAdjustModalItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Warehouse Inventory & Stock
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time shelf counts, record intake restocks, and track breakage
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by SKU, product, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Quick stock status pill filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              stockFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Items ({inventoryItems.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              stockFilter === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Low Stock (&le; 25)
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Out of Stock (0)
          </button>
        </div>
      </div>

      {/* Inventory Data Table (Requirement #31) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU Code</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Available Stock</th>
                <th className="px-4 py-3">Stock Health</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredItems.map((item) => {
                const isOut = item.stock === 0;
                const isLow = item.stock > 0 && item.stock <= 25;

                return (
                  <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt=""
                          className="w-8 h-8 object-contain rounded bg-[#FAFAF7] border p-0.5 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                          <p className="text-[11px] text-gray-500">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.variantWeight}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-extrabold text-gray-900">
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-50 text-[#1B5E20] border border-emerald-200 px-2 py-0.5 rounded">
                          HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ₹{item.price}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateStock(item.productId, item.variantId, -1, 'Single item sale/dispense')}
                          disabled={item.stock <= 0}
                          className="w-7 h-7 rounded border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-40"
                          title="Reduce 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateStock(item.productId, item.variantId, 1, 'Quick restock')}
                          className="w-7 h-7 rounded border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600"
                          title="Add 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setAdjustModalItem({
                              productId: item.productId,
                              variantId: item.variantId,
                              productName: item.productName,
                              variantWeight: item.variantWeight,
                              currentStock: item.stock,
                            });
                            setAdjustmentAmount(25);
                          }}
                        >
                          Bulk Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalItem && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustModalItem(null)}
          title="Adjust Inventory Stock"
          subtitle={`${adjustModalItem.productName} (${adjustModalItem.variantWeight})`}
          maxWidth="sm"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-xs flex justify-between">
              <span className="text-gray-500">Current Shelf Stock:</span>
              <strong className="text-gray-900 font-mono text-sm">
                {adjustModalItem.currentStock} units
              </strong>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Adjustment Units (+ to add, - to reduce)
              </label>
              <input
                required
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Resulting stock will be: {Math.max(0, adjustModalItem.currentStock + adjustmentAmount)} units
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Reason for Audit Log</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-[#2E7D32]"
              >
                <option value="Restock Batch Arrival">Restock Batch Arrival</option>
                <option value="Breakage / Damaged Goods">Breakage / Damaged Goods</option>
                <option value="Routine Inventory Audit">Routine Inventory Audit</option>
                <option value="Customer Return to Shelf">Customer Return to Shelf</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setAdjustModalItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Commit Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
