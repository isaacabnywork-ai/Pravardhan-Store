'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Boxes,
  PackageCheck,
  Truck,
  Tag,
  Settings,
  ArrowLeft,
  ShieldAlert,
  Menu,
  X,
  BarChart3,
  Users,
  Layers,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useStore } from '@/lib/context/StoreContext';
import { RoleSwitcherModal } from '@/components/layout/RoleSwitcherModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { storeSettings, orders, products, customers } = useStore();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'ORDER_PLACED' || o.orderStatus === 'ORDER_CONFIRMED'
  ).length;

  const lowStockCount = products.flatMap((p) => p.variants).filter((v) => v.stock <= 5).length;

  const navGroups = [
    {
      group: 'Fulfillment & Ops',
      links: [
        {
          title: 'Command Center',
          href: '/admin',
          icon: LayoutDashboard,
          roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'DELIVERY_STAFF'],
        },
        {
          title: 'Orders & Dispatch',
          href: '/admin/orders',
          icon: PackageCheck,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined,
          badgeColor: 'bg-emerald-500 text-white font-bold',
          roles: ['SUPER_ADMIN', 'ORDER_MANAGER'],
        },
        {
          title: 'Delivery & Fleet',
          href: '/admin/delivery',
          icon: Truck,
          roles: ['SUPER_ADMIN', 'DELIVERY_STAFF', 'ORDER_MANAGER'],
        },
      ],
    },
    {
      group: 'Catalog & Inventory',
      links: [
        {
          title: 'Products & SKUs',
          href: '/admin/products',
          icon: Layers,
          badge: `${products.length}`,
          roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
        },
        {
          title: 'Stock Ledger',
          href: '/admin/inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold',
          roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
        },
        {
          title: 'Promotions & Coupons',
          href: '/admin/promotions',
          icon: Tag,
          roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
        },
      ],
    },
    {
      group: 'Intelligence & Growth',
      links: [
        {
          title: 'Analytics & GMV',
          href: '/admin/analytics',
          icon: BarChart3,
          roles: ['SUPER_ADMIN', 'ORDER_MANAGER'],
        },
        {
          title: 'Customers & Wallets',
          href: '/admin/customers',
          icon: Wallet,
          badge: `${customers.length}`,
          badgeColor: 'bg-emerald-500 text-white font-bold',
          roles: ['SUPER_ADMIN', 'ORDER_MANAGER'],
        },
      ],
    },
    {
      group: 'Administration',
      links: [
        {
          title: 'Staff & Team',
          href: '/admin/staff',
          icon: Users,
          roles: ['SUPER_ADMIN'],
        },
        {
          title: 'Store Settings',
          href: '/admin/settings',
          icon: Settings,
          roles: ['SUPER_ADMIN'],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Top Admin Header Bar - Clean and Responsive on Mobile & Desktop */}
      <header className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-950/20 flex-shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
                  Pravdhan Store
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Dark Store #01
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                Admin Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Warehouse Status Pill (Desktop only) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-semibold">{storeSettings.serviceArea}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">Open for Dispatch</span>
          </div>

          {/* Customer Storefront Link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Switch to Storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 transition-all shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs">
              {role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : role === 'PRODUCT_MANAGER'
                ? 'Product Mgr'
                : role === 'ORDER_MANAGER'
                ? 'Order Mgr'
                : role === 'DELIVERY_STAFF'
                ? 'Rider'
                : 'Customer'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Full-Width Body */}
      <div className="flex-1 flex w-full relative">
        {/* Navigation Sidebar Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200/90 flex flex-col justify-between shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:shadow-none lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Drawer Top Header (only on mobile) */}
          <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-white">Pravdhan Store</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Navigation Menu</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto flex-1">
            {/* Dark Store Hub Info Card */}
            <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <span>Active Dark Store</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs font-bold text-white">{storeSettings.storeName}</p>
              <p className="text-[11px] text-slate-300 mt-0.5">{storeSettings.serviceArea}</p>
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-300">
                <span>Min Order: <strong className="text-white">₹{storeSettings.minimumOrderValue}</strong></span>
                <span>Delivery: <strong className="text-emerald-300">₹{storeSettings.defaultDeliveryCharge}</strong></span>
              </div>
            </div>

            {/* Nav Groups */}
            <div className="space-y-5">
              {navGroups.map((group) => (
                <div key={group.group} className="space-y-1">
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {group.group}
                  </p>
                  <div className="space-y-0.5">
                    {group.links.map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      const hasAccess = link.roles.includes(role);

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                              : hasAccess
                              ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              : 'text-slate-400 hover:bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 ${
                                isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                              }`}
                            />
                            <span>{link.title}</span>
                          </div>
                          {link.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-white/25 text-white'
                                  : link.badgeColor || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Footer with Role Switch Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                <span>Testing Mode</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Switch roles above to test Super Admin, Manager, and Rider views.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area - Full Width with Mobile-Friendly Padding */}
        <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          {role === 'CUSTOMER' && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Customer Persona Active</p>
                  <p className="text-[11px] text-amber-800">
                    Switch to a staff role to test back-office order fulfillment, stock edits, or wallet management.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-auto transition-colors"
              >
                Switch to Staff Role
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </div>
  );
}
