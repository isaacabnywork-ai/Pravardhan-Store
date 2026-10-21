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
  User as UserIcon,
  ChevronRight,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useStore } from '@/lib/context/StoreContext';
import { RoleSwitcherModal } from '@/components/layout/RoleSwitcherModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const { storeSettings, orders, products } = useStore();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'ORDER_PLACED' || o.orderStatus === 'ORDER_CONFIRMED'
  ).length;

  const lowStockCount = products.flatMap((p) => p.variants).filter((v) => v.stock <= 5).length;

  const navLinks = [
    {
      title: 'Dashboard Overview',
      href: '/admin',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER'],
    },
    {
      title: 'Products & Variants',
      href: '/admin/products',
      icon: Store,
      badge: `${products.length} Items`,
      roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
    },
    {
      title: 'Real-Time Inventory',
      href: '/admin/inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
    },
    {
      title: 'Orders & Fulfillment',
      href: '/admin/orders',
      icon: PackageCheck,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
      roles: ['SUPER_ADMIN', 'ORDER_MANAGER'],
    },
    {
      title: 'Delivery & Logistics',
      href: '/admin/delivery',
      icon: Truck,
      roles: ['SUPER_ADMIN', 'DELIVERY_STAFF', 'ORDER_MANAGER'],
    },
    {
      title: 'Promotions & Coupons',
      href: '/admin/promotions',
      icon: Tag,
      roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
    },
    {
      title: 'Store Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">Pravdhan Store</span>
              <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                Back-Office Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Back to Customer Storefront */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront View</span>
          </Link>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Role: {role.replace(/_/g, ' ')}</span>
            <ShieldAlert className="w-3 h-3 text-amber-400 ml-1" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-14 z-30 w-64 bg-white border-r border-slate-200 p-4 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Operating Warehouse
            </p>
            <p className="text-xs font-bold text-slate-800">{storeSettings.serviceArea}</p>
            <p className="text-[10px] text-emerald-700 font-medium">
              Min Order: ₹{storeSettings.minimumOrderValue} • Delivery: ₹{storeSettings.defaultDeliveryCharge}
            </p>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              const hasAccess = link.roles.includes(role);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : hasAccess
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.title}</span>
                  </div>
                  {link.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : link.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold block mb-0.5">Role Permission Test</span>
            <p className="text-[11px] text-amber-800 leading-snug">
              You are currently viewing as <strong>{role}</strong>. Use the Role Switcher at the top right to test Super Admin, Product Manager, Order Manager, or Delivery Staff privileges.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {role === 'CUSTOMER' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Customer Persona Active</p>
                  <p className="text-[11px] text-amber-800">
                    You are currently viewing as <strong>Customer</strong>. To manage catalog products, adjust live inventory, or fulfill orders, switch to a back-office staff persona.
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
