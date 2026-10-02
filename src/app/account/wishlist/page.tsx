'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/products/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/account"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          aria-label="Back to Account"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
              {wishlistProducts.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Saved grocery favorites for quick reordering
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm my-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1.5">
            Your wishlist is empty
          </h2>
          <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
            Click the heart icon on any product to save it here for fast repeat grocery ordering.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <span>Explore Groceries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
