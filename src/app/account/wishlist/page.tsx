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
      <div className="flex items-center gap-2.5 mb-4">
        <Link
          href="/account"
          className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50"
          aria-label="Back to Account"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base sm:text-xl font-black text-[#0F172A]">
            My Wishlist ({wishlistProducts.length})
          </h1>
          <p className="text-xs text-[#64748B]">
            Saved grocery favorites for quick reordering
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-2.5 border border-red-100">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A] mb-1">
            Your wishlist is empty
          </h2>
          <p className="text-xs text-[#64748B] mb-4">
            Click the heart icon on any product to save it here for fast reordering.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <span>Explore Groceries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
