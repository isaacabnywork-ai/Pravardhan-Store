'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  User as UserIcon,
  Store,
  PackageCheck,
  Truck,
  LayoutDashboard,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Role } from '@/types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoleOption {
  role: Role;
  title: string;
  badge: string;
  persona: string;
  icon: any;
  color: string;
  bgLight: string;
  description: string;
  routeHint: string;
}

export function RoleSwitcherModal({ isOpen, onClose }: RoleSwitcherModalProps) {
  const router = useRouter();
  const { role, switchRole } = useAuth();

  if (!isOpen) return null;

  const roles: RoleOption[] = [
    {
      role: 'CUSTOMER',
      title: 'Customer',
      badge: 'Shopper View',
      persona: 'Rahul Sharma (+91 98765 43210)',
      icon: UserIcon,
      color: 'text-emerald-700 border-emerald-500',
      bgLight: 'bg-emerald-50/50 hover:bg-emerald-50',
      description: 'Browse catalog, select variants, add to cart, choose delivery slot, place order, and track timeline.',
      routeHint: 'Navigates to Storefront (Home)',
    },
    {
      role: 'PRODUCT_MANAGER',
      title: 'Product Manager',
      badge: 'Catalog & Inventory Desk',
      persona: 'Priya Verma (Catalog Lead)',
      icon: Store,
      color: 'text-blue-700 border-blue-500',
      bgLight: 'bg-blue-50/50 hover:bg-blue-50',
      description: 'Manage products, multi-variant SKUs, pricing, stock levels, and inventory adjustments with audit trail.',
      routeHint: 'Navigates to /admin/products',
    },
    {
      role: 'ORDER_MANAGER',
      title: 'Order Manager',
      badge: 'Fulfillment & Ops',
      persona: 'Suresh Kumar (Warehouse Ops)',
      icon: PackageCheck,
      color: 'text-purple-700 border-purple-500',
      bgLight: 'bg-purple-50/50 hover:bg-purple-50',
      description: 'Confirm new orders, manage item picking/packing, update preparation statuses, assign delivery staff.',
      routeHint: 'Navigates to /admin/orders',
    },
    {
      role: 'DELIVERY_STAFF',
      title: 'Delivery Staff',
      badge: 'Field Executive',
      persona: 'Amit Singh (Rider ID: DL-04)',
      icon: Truck,
      color: 'text-amber-700 border-amber-500',
      bgLight: 'bg-amber-50/50 hover:bg-amber-50',
      description: 'View assigned orders, customer delivery addresses & time slots, mark "Out for Delivery" and "Delivered".',
      routeHint: 'Navigates to /admin/delivery',
    },
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      badge: 'Complete System Access',
      persona: 'Vikram Mehta (Owner / Director)',
      icon: LayoutDashboard,
      color: 'text-rose-700 border-rose-500',
      bgLight: 'bg-rose-50/50 hover:bg-rose-50',
      description: 'Full oversight: Business analytics, store settings (min order ₹100, ₹0 fee), promotions, orders, inventory.',
      routeHint: 'Navigates to /admin',
    },
  ];

  const handleSelectRole = (r: Role) => {
    switchRole(r);
    onClose();
    if (r === 'CUSTOMER') {
      router.push('/');
    } else if (r === 'PRODUCT_MANAGER') {
      router.push('/admin/products');
    } else if (r === 'ORDER_MANAGER') {
      router.push('/admin/orders');
    } else if (r === 'DELIVERY_STAFF') {
      router.push('/admin/delivery');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Role & Persona Switcher</h2>
              <p className="text-xs text-slate-300">
                Pravdhan Store V1 contains 5 distinct RBAC roles. Select one to test:
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-3">
          {roles.map((item) => {
            const isCurrent = role === item.role;
            const Icon = item.icon;

            return (
              <button
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isCurrent
                    ? `${item.color} bg-white shadow-md ring-2 ring-emerald-500`
                    : `border-slate-200 ${item.bgLight}`
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      {item.title}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.badge}
                      </span>
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">{item.persona}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                    ➜ {item.routeHint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Role updates state instantly across all views.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
