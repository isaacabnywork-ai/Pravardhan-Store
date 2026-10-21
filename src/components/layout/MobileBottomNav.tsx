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
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

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
