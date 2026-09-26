'use client';

import React, { useState, useMemo } from 'react';
import { Category, Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowUpDown, Check } from 'lucide-react';

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
      <div className="sticky top-[52px] sm:top-[60px] z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-2">
            {/* Scrollable subcategory pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              {subcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100'
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
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">Sort:</span>
              <span className="capitalize">{sortBy.replace('-', ' ')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3.5 sm:py-5">
        <div className="flex items-center justify-between mb-2.5 text-xs text-[#64748B] font-medium">
          <span>Showing {products.length} {products.length === 1 ? 'item' : 'items'}</span>
          <span>Doorstep Delivery</span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#E2E8F0] my-4">
            <p className="text-xs font-bold text-[#0F172A]">No products found in this subcategory.</p>
            <button
              onClick={() => setSelectedSubcategory('all')}
              className="mt-2.5 px-3.5 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg"
            >
              View All {category.name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Sort Bottom Sheet */}
      {isSortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-t-xl sm:rounded-xl p-4 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A] text-sm">Sort Products</h3>
              <button
                onClick={() => setIsSortModalOpen(false)}
                className="text-xs text-[#2563EB] font-bold"
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
                  className="w-full flex items-center justify-between py-2.5 text-left text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors"
                >
                  <span className={sortBy === opt.value ? 'text-[#2563EB] font-bold' : ''}>
                    {opt.label}
                  </span>
                  {sortBy === opt.value && (
                    <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3]" />
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
