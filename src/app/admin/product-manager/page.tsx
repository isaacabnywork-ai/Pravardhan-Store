'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Tag,
  Plus,
  Search,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Store,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function ProductManagerPage() {
  const { products, categories, promotions } = useStore();
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name, brand: p.brand, categoryId: p.categoryId }))
  );
  const totalStockUnits = allVariants.reduce((sum, v) => sum + v.stock, 0);
  const catalogValuation = allVariants.reduce((sum, v) => sum + v.stock * v.price, 0);
  const lowStockCount = allVariants.filter((v) => v.stock <= 5).length;
  const activePromotions = promotions.filter((p) => p.isActive);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Product Manager Catalog Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Role: Product Manager
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Master Catalog • Multi-variant SKUs, price margins, seasonal tags, and promotion coupons
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Catalog Desk"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          <Link
            href="/admin/promotions"
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Coupons ({activePromotions.length})</span>
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog SKUs</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {allVariants.length} Variants
            </h3>
            <p className="text-[11px] text-blue-700 font-semibold mt-1">
              Across {products.length} master products
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Categories</span>
            <Store className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {categories.length} Categories
            </h3>
            <p className="text-[11px] text-teal-700 font-semibold mt-1">
              All mapped with subcategories
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog Valuation</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {formatPrice(catalogValuation)}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              {totalStockUnits} total stock units
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Attention</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {lowStockCount} Low Stock
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Triggering re-order warnings
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog View & Promotions Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Products List with Quick Edit */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Product Catalog</h3>
              <p className="text-xs text-slate-500">
                Active SKUs available on customer storefront
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredProducts.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0">
                    <img
                      src={product.images[0] || ''}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Brand: {product.brand} • {product.variants.length} SKU Variants
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">
                      {formatPrice(product.variants[0]?.price || 0)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      MRP {formatPrice(product.variants[0]?.mrp || 0)}
                    </span>
                  </div>
                  <Link
                    href={`/admin/products`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Product"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 text-center">
            <Link
              href="/admin/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
            >
              <span>View and edit all {products.length} products in full editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Col: Active Promotions & Coupons */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Active Coupons</h3>
                  <p className="text-xs text-slate-500">Live store promotion campaigns</p>
                </div>
              </div>
              <Link
                href="/admin/promotions"
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + New
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs px-2 py-0.5 rounded-lg bg-amber-200 text-amber-900 tracking-wider">
                      {promo.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {promo.isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{promo.title}</p>
                  <p className="text-[11px] text-slate-500">{promo.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Min Order: ₹{promo.minOrderValue}</span>
                    <span>Max Disc: ₹{promo.maxDiscount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/admin/promotions"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Promotions Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
