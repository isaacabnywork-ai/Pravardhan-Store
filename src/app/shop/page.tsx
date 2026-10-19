'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Filter,
  SlidersHorizontal,
  ChevronRight,
  X,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

function ShopContent() {
  const searchParams = useSearchParams();
  const { products, categories } = useStore();

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('sub');
  const queryParam = searchParams.get('q');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subcategoryParam || 'all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Synchronize when URL param changes
  React.useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (subcategoryParam) setSelectedSubcategory(subcategoryParam);
  }, [categoryParam, subcategoryParam]);

  // Extract all available brands
  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => brandsSet.add(p.brand));
    return Array.from(brandsSet);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat && product.categoryId !== cat.id) return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all') {
        const activeCat = categories.find((c) => c.slug === selectedCategory);
        const sub = activeCat?.subcategories.find((s) => s.slug === selectedSubcategory);
        if (sub && product.subcategoryId !== sub.id) return false;
      }

      // Query filter
      if (queryParam) {
        const q = queryParam.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesVariant = product.variants.some((v) => v.title.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesVariant) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }

      // In-stock only
      if (inStockOnly) {
        const hasStock = product.variants.some((v) => v.stock > 0);
        if (!hasStock) return false;
      }

      // Price filter (at least one variant within priceMax)
      const withinPrice = product.variants.some((v) => v.price <= priceMax);
      if (!withinPrice) return false;

      return true;
    });
  }, [
    products,
    categories,
    selectedCategory,
    selectedSubcategory,
    queryParam,
    selectedBrand,
    inStockOnly,
    priceMax,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.variants[0].price - a.variants[0].price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => {
        const discA = (a.variants[0].mrp - a.variants[0].price) / a.variants[0].mrp;
        const discB = (b.variants[0].mrp - b.variants[0].price) / b.variants[0].mrp;
        return discB - discA;
      });
    } else {
      // 'popular'
      list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }
    return list;
  }, [filteredProducts, sortBy]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-emerald-700">Shop Catalog</Link>
            {activeCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-800 font-semibold">{activeCategoryObj.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {queryParam
                  ? `Search Results for "${queryParam}"`
                  : activeCategoryObj
                  ? activeCategoryObj.name
                  : 'All Grocery & Household Essentials'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {sortedProducts.length} items with multi-variant pricing
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs text-xs font-semibold">
                <span className="text-slate-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="popular">Popularity & Best Deals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="discount">Biggest Savings (%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-700" />
                Filter Catalog
              </h3>
              {(selectedCategory !== 'all' || selectedBrand !== 'all' || inStockOnly) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setSelectedBrand('all');
                    setInStockOnly(false);
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span>({products.length})</span>
                </button>

                {categories.map((c) => {
                  const isSelected = selectedCategory === c.slug;
                  const count = products.filter((p) => p.categoryId === c.id).length;
                  return (
                    <div key={c.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(c.slug);
                          setSelectedSubcategory('all');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400">({count})</span>
                      </button>

                      {/* Subcategories (if selected) */}
                      {isSelected && c.subcategories.length > 0 && (
                        <div className="ml-3 pl-2 border-l-2 border-emerald-300 py-1 space-y-1">
                          <button
                            onClick={() => setSelectedSubcategory('all')}
                            className={`w-full text-left text-[11px] py-1 px-1.5 rounded ${
                              selectedSubcategory === 'all'
                                ? 'text-emerald-800 font-bold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            All {c.name}
                          </button>
                          {c.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubcategory(sub.slug)}
                              className={`w-full text-left text-[11px] py-1 px-1.5 rounded flex items-center justify-between ${
                                selectedSubcategory === sub.slug
                                  ? 'text-emerald-800 font-bold bg-emerald-50'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <span>{sub.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Brand
              </h4>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
              >
                <option value="all">All Brands ({allBrands.length})</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>In-Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-base font-bold text-slate-800 mb-1">
                  No products found matching your filters
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Try clearing some filter criteria or search for a different item.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setSelectedBrand('all');
                    setInStockOnly(false);
                  }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="font-bold text-sm text-slate-900">Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Mobile Category Selection */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-700 block mb-2">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('all');
                  }}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Brand */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-700 block mb-2">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl"
                >
                  <option value="all">All Brands</option>
                  {allBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>In-Stock Only</span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-3 bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase"
            >
              Apply Filters ({sortedProducts.length})
            </button>
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading Pravdhan Store catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
