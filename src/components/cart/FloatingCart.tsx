'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function FloatingCart() {
  const pathname = usePathname();
  const { totalItemsCount, grandTotal, setIsCartDrawerOpen, isCartDrawerOpen } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasJustAdded, setHasJustAdded] = useState(false);
  const prevCount = useRef(totalItemsCount);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger brief bounce animation when an item is added
  useEffect(() => {
    if (totalItemsCount > prevCount.current) {
      setHasJustAdded(true);
      const timer = setTimeout(() => setHasJustAdded(false), 900);
      prevCount.current = totalItemsCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = totalItemsCount;
  }, [totalItemsCount]);

  // Click outside to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  // Collapse on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsExpanded(false);
    }
    if (isExpanded) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Hide on checkout, cart, and back-office admin pages
  if (
    pathname.startsWith('/admin') ||
    pathname === '/checkout' ||
    pathname === '/cart' ||
    pathname.startsWith('/product/')
  ) {
    return null;
  }

  // If the full cart drawer is open, keep floating widget unobtrusive
  if (isCartDrawerOpen) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 lg:hidden z-40 flex items-center justify-end select-none"
    >
      {!isExpanded ? (
        /* Collapsed Floating Cart Icon */
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label={`Open cart preview with ${totalItemsCount} ${
            totalItemsCount === 1 ? 'item' : 'items'
          } totaling ${formatPrice(grandTotal)}`}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0F5132] hover:bg-[#054A29] text-white shadow-2xl shadow-[#0F5132]/40 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-[#0F5132]/20 hover:ring-[#0F5132]/40 focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:outline-none ${
            hasJustAdded ? 'animate-bounce scale-110' : ''
          }`}
        >
          <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />

          {/* Item count badge */}
          {totalItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-950 font-black text-xs min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-in zoom-in-75 duration-200">
              {totalItemsCount}
            </span>
          )}
        </button>
      ) : (
        /* Expanded Floating Pill — Slides towards the left */
        <div
          className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-[#0F5132] to-[#054A29] text-white p-2.5 sm:p-3 pr-3 sm:pr-4 rounded-full shadow-2xl shadow-[#0F5132]/40 border-2 border-white/90 ring-4 ring-[#0F5132]/25 animate-in slide-in-from-right-8 fade-in-0 duration-300 max-w-[92vw] sm:max-w-md"
        >
          {/* Cart Icon with count indicator */}
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-white shadow-inner">
            <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-1 ring-white">
                {totalItemsCount}
              </span>
            )}
          </div>

          {/* How many items in cart & price info */}
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs sm:text-sm font-black text-white leading-tight truncate">
              {totalItemsCount === 0
                ? '0 items in cart'
                : `${totalItemsCount} ${
                    totalItemsCount === 1 ? 'item' : 'items'
                  } in cart`}
            </span>
            {totalItemsCount > 0 ? (
              <span className="text-[11px] sm:text-xs text-amber-300 font-bold leading-tight">
                Total: {formatPrice(grandTotal)}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] text-emerald-200/90 leading-tight">
                Your cart is empty
              </span>
            )}
          </div>

          {/* View Full Cart Button */}
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setIsCartDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-[#0F5132] px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black shadow-md active:scale-95 transition-all flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <span>View Full Cart</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Slide-back / Collapse Button */}
          <button
            type="button"
            aria-label="Collapse cart preview"
            onClick={() => setIsExpanded(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            title="Collapse"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
}
