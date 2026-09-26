'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function FloatingCartBar() {
  const pathname = usePathname();
  const { itemCount, subtotal } = useCart();

  // Don't show on cart or checkout pages
  if (itemCount === 0 || pathname === '/cart' || pathname === '/checkout') {
    return null;
  }

  return (
    <div className="fixed bottom-14 sm:bottom-4 left-0 right-0 z-40 px-3.5 sm:px-6 pointer-events-none animate-in slide-in-from-bottom-3 duration-200">
      <div className="max-w-md sm:max-w-lg mx-auto pointer-events-auto">
        <Link
          href="/cart"
          className="flex items-center justify-between bg-[#0F172A] hover:bg-[#1E293B] text-white p-2.5 sm:p-3 rounded-xl shadow-lg border border-slate-700 transition-all active:scale-98"
        >
          {/* Left: Item summary */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-300 font-semibold leading-tight">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
              </div>
              <div className="text-xs sm:text-sm font-black text-white">
                ₹{subtotal}
              </div>
            </div>
          </div>

          {/* Right: View Cart Action */}
          <div className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-colors">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
