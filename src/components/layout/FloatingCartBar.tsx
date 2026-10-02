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
    <div className="fixed bottom-14 sm:bottom-5 left-0 right-0 z-40 px-3.5 sm:px-6 pointer-events-none animate-in slide-in-from-bottom-3 duration-200">
      <div className="max-w-md sm:max-w-lg mx-auto pointer-events-auto">
        <Link
          href="/cart"
          className="flex items-center justify-between bg-slate-900/95 backdrop-blur-md hover:bg-slate-900 text-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-emerald-950/20 border border-emerald-900/40 transition-all active:scale-98 group"
        >
          {/* Left: Item summary */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-200 font-semibold leading-tight">
                {itemCount} {itemCount === 1 ? 'grocery item' : 'grocery items'} in cart
              </div>
              <div className="text-sm font-black text-white">
                ₹{subtotal}
              </div>
            </div>
          </div>

          {/* Right: View Cart Action */}
          <div className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
