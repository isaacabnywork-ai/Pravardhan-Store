'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  Percent,
  PackageCheck,
  User,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItemsCount, grandTotal, setIsCartDrawerOpen } = useCart();

  // Don't render on admin pages or product detail pages (which have dedicated bottom action bar)
  if (pathname.startsWith('/admin') || pathname.startsWith('/product/')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '/shop', icon: LayoutGrid },
    { label: 'Deals', href: '/deals', icon: Percent },
    { label: 'Orders', href: '/account/orders', icon: PackageCheck },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <>
      {/* Floating Quick Cart Bar (App-style floating bar above bottom nav) */}
      {totalItemsCount > 0 && pathname !== '/cart' && pathname !== '/checkout' && (
        <div className="fixed bottom-16 inset-x-0 z-40 px-3 pb-1 md:hidden pointer-events-none animate-in slide-in-from-bottom-3 duration-200">
          <div
            role="button"
            tabIndex={0}
            aria-label={`View cart with ${totalItemsCount} ${
              totalItemsCount === 1 ? 'item' : 'items'
            } totaling ${formatPrice(grandTotal)}`}
            onClick={() => setIsCartDrawerOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsCartDrawerOpen(true);
              }
            }}
            className="pointer-events-auto bg-gradient-to-r from-[#0F5132] to-[#054A29] text-white p-3 rounded-2xl shadow-xl border border-emerald-700/60 flex items-center justify-between cursor-pointer active:scale-98 transition-transform focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                {totalItemsCount}
              </div>
              <div>
                <p className="text-xs font-black leading-tight text-white">
                  {formatPrice(grandTotal)}
                </p>
                <p className="text-[10px] text-emerald-100 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in cart
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white text-gray-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5 text-[#0F5132]" />
              <span>View Cart</span>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 px-2.5 rounded-xl transition-all relative focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none ${
                  isActive
                    ? 'text-[#0F5132] font-bold'
                    : 'text-gray-500 hover:text-gray-900 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.label === 'Orders' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#0F5132] ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-3.5 h-0.5 rounded-full bg-[#0F5132] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
