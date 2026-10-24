'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bike,
  Bell,
  BellRing,
  ShoppingBag,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useStore } from '@/lib/context/StoreContext';
import { RoleSwitcherModal } from '@/components/layout/RoleSwitcherModal';
import { Role } from '@/types';

interface AdminOrderNotif {
  id: string;
  orderNumber: string;
  grandTotal: number;
  customerName: string;
  customerPhone?: string;
  paymentMethod?: string;
  timestamp: number;
  read: boolean;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { storeSettings, orders, products, customers } = useStore();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deskFilter, setDeskFilter] = useState<'ALL' | Role>('ALL');
  const [notifications, setNotifications] = useState<AdminOrderNotif[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [activeOrderToast, setActiveOrderToast] = useState<AdminOrderNotif | null>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize notifications from localStorage or from recent orders
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pravdhan_admin_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else if (orders.length > 0) {
        const recentOrders = orders.slice(0, 5).map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          grandTotal: o.grandTotal,
          customerName: o.customerName || 'Customer',
          customerPhone: o.customerPhone,
          paymentMethod: o.paymentMethod,
          timestamp: new Date(o.createdAt).getTime() || Date.now(),
          read: true,
        }));
        setNotifications(recentOrders);
        localStorage.setItem('pravdhan_admin_notifications', JSON.stringify(recentOrders));
      }
    } catch {}
  }, [orders]);

  const playOrderChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2: A5 (880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {
      // Audio autoplay might be restricted before user interaction
    }
  };

  const handleIncomingOrder = (orderData: Partial<AdminOrderNotif>) => {
    if (!orderData || !orderData.id) return;
    const newNotif: AdminOrderNotif = {
      id: orderData.id,
      orderNumber: orderData.orderNumber || 'ORD-NEW',
      grandTotal: orderData.grandTotal || 0,
      customerName: orderData.customerName || 'Customer',
      customerPhone: orderData.customerPhone,
      paymentMethod: orderData.paymentMethod || 'Online',
      timestamp: orderData.timestamp || Date.now(),
      read: false,
    };

    setNotifications((prev) => {
      if (prev.some((n) => n.id === newNotif.id)) return prev;
      const updated = [newNotif, ...prev].slice(0, 30);
      try {
        localStorage.setItem('pravdhan_admin_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    playOrderChime();
    setActiveOrderToast(newNotif);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveOrderToast(null);
    }, 8000);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pravdhan_new_order_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleIncomingOrder(parsed);
        } catch {}
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AdminOrderNotif>;
      if (customEvent.detail) {
        handleIncomingOrder(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pravdhan_new_order', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pravdhan_new_order', handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('pravdhan_admin_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem('pravdhan_admin_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'ORDER_PLACED' || o.orderStatus === 'ORDER_CONFIRMED'
  ).length;

  const lowStockCount = products.flatMap((p) => p.variants).filter((v) => v.stock <= 5).length;
  const activeDeliveriesCount = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length;

  // Differentiated Role Desks with distinct headings and dedicated pages
  const roleDesks = [
    {
      id: 'SUPER_ADMIN' as Role,
      roleName: 'Super Admin',
      heading: 'Super Admin Desk',
      badge: 'Executive',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      headerBg: 'bg-rose-500/10 text-rose-800 border-rose-200',
      icon: LayoutDashboard,
      description: 'System-wide control & analytics',
      links: [
        {
          title: 'Executive Center',
          href: '/admin',
          icon: LayoutDashboard,
          hint: 'Global overview',
        },
        {
          title: 'Staff & Team Roles',
          href: '/admin/staff',
          icon: Users,
          hint: 'RBAC permissions',
        },
        {
          title: 'Store Settings',
          href: '/admin/settings',
          icon: Settings,
          hint: 'Hub & delivery rules',
        },
        {
          title: 'Analytics & Revenue',
          href: '/admin/analytics',
          icon: BarChart3,
          hint: 'Financials & GMV',
        },
      ],
    },
    {
      id: 'STORE_MANAGER' as Role,
      roleName: 'Store Manager',
      heading: 'Store Manager Desk',
      badge: 'Store Operations',
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      headerBg: 'bg-teal-500/10 text-teal-800 border-teal-200',
      icon: Store,
      description: 'Dark store facility & stock intake',
      links: [
        {
          title: 'Store Operations',
          href: '/admin/store-manager',
          icon: Store,
          hint: 'Facility status & shifts',
          badge: 'Live',
          badgeColor: 'bg-teal-500 text-white font-bold',
        },
        {
          title: 'Stock Ledger & Inwarding',
          href: '/admin/inventory',
          icon: Boxes,
          hint: 'Mandi / supplier intake',
          badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold',
        },
      ],
    },
    {
      id: 'PRODUCT_MANAGER' as Role,
      roleName: 'Product Manager',
      heading: 'Product Manager Desk',
      badge: 'Catalog & Pricing',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      headerBg: 'bg-blue-500/10 text-blue-800 border-blue-200',
      icon: Layers,
      description: 'Master catalog, SKUs & deals',
      links: [
        {
          title: 'Catalog Desk',
          href: '/admin/product-manager',
          icon: Layers,
          hint: 'SKU metrics & pricing',
        },
        {
          title: 'Products & SKUs',
          href: '/admin/products',
          icon: Store,
          hint: 'Multi-variant catalog',
          badge: `${products.length}`,
        },
        {
          title: 'Promotions & Coupons',
          href: '/admin/promotions',
          icon: Tag,
          hint: 'Discount campaigns',
        },
      ],
    },
    {
      id: 'ORDER_MANAGER' as Role,
      roleName: 'Order Manager',
      heading: 'Order Manager Desk',
      badge: 'Fulfillment & Picking',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      headerBg: 'bg-purple-500/10 text-purple-800 border-purple-200',
      icon: PackageCheck,
      description: 'Picking floor & packing stations',
      links: [
        {
          title: 'Fulfillment Desk',
          href: '/admin/order-manager',
          icon: PackageCheck,
          hint: 'Order stages funnel',
        },
        {
          title: 'Live Orders & Dispatch',
          href: '/admin/orders',
          icon: PackageCheck,
          hint: 'Item picking checklist',
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined,
          badgeColor: 'bg-emerald-500 text-white font-bold',
        },
        {
          title: 'Customers & Wallets',
          href: '/admin/customers',
          icon: Wallet,
          hint: 'User orders & balance',
          badge: `${customers.length}`,
        },
      ],
    },
    {
      id: 'DELIVERY_STAFF' as Role,
      roleName: 'Delivery Staff',
      heading: 'Rider & Fleet Desk',
      badge: 'Field Executive',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      headerBg: 'bg-amber-500/10 text-amber-800 border-amber-200',
      icon: Bike,
      description: 'Active drops, POD photo & OTP',
      links: [
        {
          title: 'Rider Delivery Station',
          href: '/admin/rider',
          icon: Bike,
          hint: 'Active consignments & POD',
          badge: activeDeliveriesCount > 0 ? `${activeDeliveriesCount} out` : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold',
        },
        {
          title: 'Fleet & Dispatch Records',
          href: '/admin/delivery',
          icon: Truck,
          hint: 'All rider drop logs',
        },
      ],
    },
  ];

  const visibleDesks = deskFilter === 'ALL'
    ? roleDesks
    : roleDesks.filter((d) => d.id === deskFilter);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 w-full h-14 sm:h-16 bg-slate-900 text-white border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
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
                Multi-Role Operations Portal
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

          {/* Real-time Order Notification Bell & Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Order Notifications"
              aria-label="Order Notifications"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[1.125rem] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-slate-900 shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-emerald-400" />
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight">Order Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <PackageCheck className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
                      No new order notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                          !notif.read ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            !notif.read
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-xs text-slate-900 truncate">
                              {notif.orderNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTimeAgo(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            ₹{notif.grandTotal} • {notif.customerName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            Paid via {notif.paymentMethod || 'Online'}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsNotifDropdownOpen(false)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1"
                  >
                    Go to Orders Operations Desk ➜
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 transition-all shadow-xs cursor-pointer"
            title="Switch User Role Persona"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs">
              {role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : role === 'STORE_MANAGER'
                ? 'Store Mgr'
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

      {/* Real-Time Floating Order Notification Toast Banner */}
      {activeOrderToast && (
        <aside
          aria-label="Real-time order notification"
          className="fixed top-18 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-500 ring-4 ring-emerald-500/20 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 text-white shadow-md shadow-emerald-950/40">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    New Customer Order!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveOrderToast(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-white mt-1 truncate">
                Order {activeOrderToast.orderNumber} • ₹{activeOrderToast.grandTotal}
              </p>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                Customer: {activeOrderToast.customerName} ({activeOrderToast.paymentMethod})
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/admin/orders"
                  onClick={() => setActiveOrderToast(null)}
                  className="flex-1 text-center py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Open in Dispatch Desk
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveOrderToast(null)}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Full-Width Body with Sticky Sidebar */}
      <div className="flex-1 flex w-full relative items-start">
        {/* Navigation Sidebar Drawer (Sticky on Desktop) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-white border-r border-slate-200/90 flex flex-col justify-between shadow-2xl transition-transform duration-200 lg:sticky lg:top-14 sm:lg:top-16 lg:h-[calc(100vh-3.5rem)] sm:lg:h-[calc(100vh-4rem)] lg:z-30 lg:shadow-none lg:translate-x-0 shrink-0 ${
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
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Role Portals & Desks</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation Area */}
          <div className="p-3.5 sm:p-4 space-y-5 overflow-y-auto flex-1">
            {/* Dark Store Facility Card */}
            <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs border border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                <span>Active Dark Store #01</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">
                  Live Hub
                </span>
              </div>
              <p className="text-xs font-bold text-white">{storeSettings.storeName}</p>
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">{storeSettings.serviceArea}</p>
            </div>

            {/* Role Desk Filter Pills (Allows filtering or viewing all differentiated desks) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Role Desk Filter:
                </span>
                {deskFilter !== 'ALL' && (
                  <button
                    onClick={() => setDeskFilter('ALL')}
                    className="text-[10px] font-bold text-teal-700 hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: 'ALL', label: 'All Desks' },
                  { key: 'SUPER_ADMIN', label: '👑 Admin' },
                  { key: 'STORE_MANAGER', label: '🏬 Store' },
                  { key: 'PRODUCT_MANAGER', label: '📦 Catalog' },
                  { key: 'ORDER_MANAGER', label: '⚡ Orders' },
                  { key: 'DELIVERY_STAFF', label: '🛵 Rider' },
                ].map((item) => {
                  const isSelected = deskFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDeskFilter(item.key as 'ALL' | Role)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Differentiated Role Desks Navigation */}
            <div className="space-y-6 pt-1">
              {visibleDesks.map((desk) => {
                const DeskIcon = desk.icon;
                const isCurrentRoleDesk = role === desk.id;

                return (
                  <div
                    key={desk.id}
                    className={`rounded-2xl transition-all ${
                      deskFilter === 'ALL'
                        ? 'p-2 border border-slate-200/80 bg-slate-50/40'
                        : 'space-y-1'
                    }`}
                  >
                    {/* Role Heading with Clear Badge & Icon */}
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg border text-xs ${desk.color}`}>
                          <DeskIcon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                            {desk.heading}
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium">
                            {desk.description}
                          </p>
                        </div>
                      </div>

                      {isCurrentRoleDesk && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Desk Links */}
                    <div className="space-y-0.5">
                      {desk.links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              />
                              <span className="truncate">{link.title}</span>
                            </div>

                            {link.badge && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : link.badgeColor || 'bg-slate-200 text-slate-800'
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
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer with Role Switch Info */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="w-full text-left p-2.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-xs shadow-2xs transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Persona:
                </span>
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {role.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-teal-700 group-hover:underline">
                Switch ➜
              </span>
            </button>
          </div>
        </aside>

        {/* Content Area - Full Width */}
        <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          {role === 'CUSTOMER' && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Customer Persona Active</p>
                  <p className="text-[11px] text-amber-800">
                    Switch to a staff role (Store Manager, Product Manager, Order Manager, or Rider) to test operations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-auto transition-colors cursor-pointer"
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
