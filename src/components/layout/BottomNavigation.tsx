'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, PackageCheck, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function BottomNavigation() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Categories', href: '/categories', icon: LayoutGrid },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Orders', href: '/orders', icon: PackageCheck },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: itemCount },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-600 scale-105' : ''
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-emerald-600 text-white text-[9px] font-black min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-black text-emerald-800' : 'font-semibold text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
