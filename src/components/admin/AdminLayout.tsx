import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { AdminPage } from '@/types';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  Store,
  ChevronRight,
  Menu,
  X,
  Bell,
  CheckCircle,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminPage, setAdminPage, setAppMode, orders, products } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
  ).length;

  const lowStockCount = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= 25)
  ).length;

  const navLinks: { id: AdminPage; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Processing', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'inventory', label: 'Stock & Inventory', icon: Layers, badge: lowStockCount },
    { id: 'promotions', label: 'Discounts & Coupons', icon: Tag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row text-[#1F2937]">
      {/* Mobile Admin Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-700"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
            <span className="text-sm font-bold text-gray-900">PRABHANDHAN OPS</span>
          </div>
        </div>

        <button
          onClick={() => setAppMode('customer')}
          className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded border border-[#C8E6C9] flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Customer View</span>
        </button>
      </div>

      {/* Admin Sidebar Navigation (Requirement #28: Operational, Efficient) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#1E293B] text-slate-200 flex flex-col justify-between
          transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 space-y-6">
          {/* Logo & Hub Info */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center font-bold text-sm">
                P
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide">PRABHANDHAN</p>
                <p className="text-[10px] text-slate-400 font-mono">Indiranagar Hub #01</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Hub Online" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = adminPage === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setAdminPage(link.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2E7D32] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge !== undefined && link.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white text-[#2E7D32]' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Mode switch & Store live state */}
        <div className="p-4 border-t border-slate-700/60 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Store Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Accepting Orders
            </span>
          </div>

          <button
            onClick={() => setAppMode('customer')}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Store className="w-4 h-4 text-[#F9C74F]" />
            <span>Switch to Customer Store</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Admin Header Bar */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-800 uppercase tracking-wider">
              Operations Center
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize font-bold text-[#2E7D32]">{adminPage}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              <span>Indiranagar Fulfillment Node (Active)</span>
            </div>

            <button
              onClick={() => setAppMode('customer')}
              className="text-xs font-bold text-gray-700 hover:text-black border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Customer Storefront</span>
            </button>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
