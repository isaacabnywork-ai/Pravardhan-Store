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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] px-2 py-1 pb-safe">
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
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-[#2563EB] font-black' : 'text-[#64748B]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#2563EB] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
