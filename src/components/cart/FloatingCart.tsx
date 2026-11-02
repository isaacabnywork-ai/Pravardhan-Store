'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

export function FloatingCart() {
  const pathname = usePathname();
  const { totalItemsCount, items, openCartWithLocationCheck, isCartDrawerOpen } = useCart();
  const [hasJustAdded, setHasJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const prevCount = useRef(totalItemsCount);

  // Trigger bounce animation when an item is added
  useEffect(() => {
    if (totalItemsCount > prevCount.current) {
      setHasJustAdded(true);
      const timer = setTimeout(() => setHasJustAdded(false), 900);
      prevCount.current = totalItemsCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = totalItemsCount;
  }, [totalItemsCount]);

  // Hide on admin portal, checkout, and dedicated cart pages
  if (
    pathname.startsWith('/admin') ||
    pathname === '/checkout' ||
    pathname === '/cart'
  ) {
    return null;
  }

  // Hide if no items in cart or if cart drawer is already open
  if (totalItemsCount === 0 || isCartDrawerOpen) {
    return null;
  }

  const isProductPage = pathname.startsWith('/product/');
  const latestItem = items[items.length - 1] || items[0];
  const hasMultiple = items.length > 1;
  const previousItem = hasMultiple ? items[items.length - 2] : null;

  return (
    <aside
      aria-label="View cart navigation island"
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-auto select-none ${
        isProductPage
          ? 'bottom-20 sm:bottom-22'
          : 'bottom-[74px] md:bottom-8'
      }`}
    >
      <button
        type="button"
        onClick={() => openCartWithLocationCheck()}
        aria-label={`View cart with ${totalItemsCount} ${
          totalItemsCount === 1 ? 'item' : 'items'
        }`}
        className={`group flex items-center gap-3 bg-[#105132] hover:bg-[#0c4027] active:bg-[#09321e] text-white pl-2 pr-4 sm:pr-5 py-2 rounded-full shadow-[0_10px_28px_rgba(16,81,50,0.48)] border border-emerald-400/25 cursor-pointer active:scale-95 transition-all duration-200 ${
          hasJustAdded ? 'scale-105 ring-4 ring-[#105132]/35 animate-bounce' : ''
        }`}
      >
        {/* Left: Circular Product Thumbnail (Matching the reference design) */}
        {hasMultiple ? (
          <div className="relative flex items-center shrink-0 pr-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white/10 p-0.5 border-2 border-[#105132] z-10 shadow-xs flex items-center justify-center">
              {latestItem?.image && !imageError ? (
                <img
                  src={latestItem.image}
                  alt={latestItem.productName || 'Cart item'}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <ShoppingBag className="w-5 h-5 text-white/90 stroke-[2]" />
              )}
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 -ml-4 rounded-full overflow-hidden bg-white/15 p-0.5 border-2 border-[#105132] z-0 shadow-xs flex items-center justify-center">
              {previousItem?.image ? (
                <img
                  src={previousItem.image}
                  alt={previousItem.productName || 'Cart item'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-[10px] font-black text-white/80">+{items.length - 1}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/10 p-0.5 border border-white/25 shrink-0 flex items-center justify-center shadow-inner">
            {latestItem?.image && !imageError ? (
              <img
                src={latestItem.image}
                alt={latestItem.productName || 'Cart item'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <ShoppingBag className="w-5 h-5 text-white/90 stroke-[2.2]" />
            )}
          </div>
        )}

        {/* Center: "View cart" & item count */}
        <div className="flex flex-col text-left leading-tight min-w-0 pr-1">
          <span className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
            View cart
          </span>
          <span className="text-xs text-white/90 font-medium mt-0.5">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right: Clean White Chevron Right */}
        <ChevronRight className="w-5 h-5 text-white stroke-[2.5] ml-1 sm:ml-2 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </aside>
  );
}
