'use client';

import React, { useState, useMemo } from 'react';
import { Category, Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowUpDown, Check, Sparkles, Filter } from 'lucide-react';

interface CategoryProductExplorerProps {
  category: Category;
  initialProducts: Product[];
}

type SortOption = 'relevance' | 'popularity' | 'price-asc' | 'price-desc' | 'discount' | 'rating';

export function CategoryProductExplorer({
  category,
  initialProducts,
}: CategoryProductExplorerProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Subcategory tabs
  const subcategories = [
    { id: 'all', name: 'All Products' },
    ...(category.subcategories || []),
  ];

  // Filtered & Sorted products
  const products = useMemo(() => {
    let list = [...initialProducts];

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      list = list.filter((p) => p.subcategoryId === selectedSubcategory);
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        list.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'relevance':
      default:
        break;
    }

    return list;
  }, [initialProducts, selectedSubcategory, sortBy]);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'discount', label: 'Biggest Discount' },
    { value: 'rating', label: 'Customer Rating' },
  ];

  return (
    <div className="w-full">
      {/* Subcategory horizontal navigation bar */}
      <div className="sticky top-[52px] sm:top-[60px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-2.5">
            {/* Scrollable subcategory pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              {subcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all touch-press ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>

            {/* Sort Button */}
            <button
              onClick={() => setIsSortModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-bold rounded-full transition-all shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span className="hidden sm:inline text-slate-500 font-medium">Sort:</span>
              <span className="capitalize">{sortBy.replace('-', ' ')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Showing {products.length} {products.length === 1 ? 'grocery product' : 'grocery products'}
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
            Direct Mandi Freshness
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/90 my-6 shadow-xs max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base">No items found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              There are no products in this subcategory at the moment.
            </p>
            <button
              onClick={() => setSelectedSubcategory('all')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              View All {category.name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Sort Bottom Sheet */}
      {isSortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Sort Products</h3>
              <button
                onClick={() => setIsSortModalOpen(false)}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                Done
              </button>
            </div>
            <div className="divide-y divide-slate-100 mt-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value as SortOption);
                    setIsSortModalOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-2.5 text-left text-xs font-semibold text-slate-800 hover:text-emerald-600 transition-colors"
                >
                  <span className={sortBy === opt.value ? 'text-emerald-600 font-black' : ''}>
                    {opt.label}
                  </span>
                  {sortBy === opt.value && (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
