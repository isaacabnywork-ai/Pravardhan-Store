'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  User as UserIcon,
  ChevronDown,
  ShieldAlert,
  Percent,
  X,
  Store,
  Truck,
  PackageCheck,
  LayoutDashboard,
  LogOut,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { Role } from '@/types';
import { formatPrice } from '@/lib/utils';
import { RoleSwitcherModal } from './RoleSwitcherModal';
import { AuthModal } from '@/components/auth/AuthModal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { totalItemsCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { storeSettings, products, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Search filtering
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.variants.some(
              (v) =>
                v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.sku.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const roleLabels: Record<Role, string> = {
    CUSTOMER: 'Customer',
    PRODUCT_MANAGER: 'Product Mgr',
    ORDER_MANAGER: 'Order Mgr',
    DELIVERY_STAFF: 'Delivery',
    SUPER_ADMIN: 'Super Admin',
  };

  const roleBadgeColors: Record<Role, string> = {
    CUSTOMER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    PRODUCT_MANAGER: 'bg-blue-100 text-blue-800 border-blue-300',
    ORDER_MANAGER: 'bg-purple-100 text-purple-800 border-purple-300',
    DELIVERY_STAFF: 'bg-amber-100 text-amber-800 border-amber-300',
    SUPER_ADMIN: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
        {/* ================= MOBILE APP HEADER (Visible on Mobile < md) ================= */}
        <div className="md:hidden bg-gradient-to-b from-emerald-900 to-emerald-950 text-white px-3.5 pt-2.5 pb-3 space-y-2.5 shadow-md">
          {/* Mobile Top Row: Location Pill + Role Switcher + Avatar */}
          <div className="flex items-center justify-between gap-2">
            {/* Delivery Location Pill */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black tracking-tight text-white truncate">
                    {storeSettings.serviceArea}
                  </span>
                  <ChevronDown className="w-3 h-3 text-emerald-300 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[9px] text-amber-300 font-bold">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Slot: Today 12-2 PM</span>
                </div>
              </div>
            </div>

            {/* Right: Role Switcher Pill + Profile Icon */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-200 border border-white/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{roleLabels[role]}</span>
              </button>

              <button
                onClick={() => (user ? setIsUserMenuOpen(!isUserMenuOpen) : setIsAuthModalOpen(true))}
                className="w-7 h-7 rounded-full bg-emerald-700 border border-emerald-500/50 flex items-center justify-center text-white text-xs font-bold"
              >
                {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Full-Width Search Input */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder='Search "Atta, Dal, Amul Milk, Tomatoes..."'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white text-slate-900 placeholder:text-slate-400 font-medium outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-emerald-800 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Search Dropdown on Mobile */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 text-slate-900"
                onMouseDown={(e) => e.preventDefault()}
              >
                {searchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    onClick={() => {
                      setIsSearchFocused(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2.5 p-2.5 hover:bg-slate-50"
                  >
                    <img
                      src={prod.images[0]}
                      alt=""
                      className="w-9 h-9 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[10px] text-emerald-700 font-black">
                        {formatPrice(prod.variants[0]?.price || 0)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= DESKTOP HEADER (Visible on md and up) ================= */}
        <div className="hidden md:block">
          {/* Top Bar */}
          <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 font-medium">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Serving: <strong className="text-white">{storeSettings.serviceArea}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Store Hours: {storeSettings.operatingHours}
                </span>
                <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] text-amber-300 font-semibold">
                  ⚡ ₹0 Delivery Fee on all orders today!
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${storeSettings.supportPhone}`}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{storeSettings.supportPhone}</span>
                </a>

                {/* Role Switcher Button */}
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full text-xs text-white transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Role: <strong className="underline">{roleLabels[role]}</strong></span>
                  <ChevronDown className="w-3 h-3 text-emerald-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Desktop Header */}
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Pravdhan
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-emerald-600">
                    STORE
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Direct from Store & Mandi
                </p>
              </div>
            </Link>

            {/* Location Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 line-clamp-1">{storeSettings.serviceArea}</p>
                <p className="text-[10px] text-emerald-700 font-medium">Slot: 12 PM - 2 PM (Today)</p>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative flex-1 max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder='Search "Atta", "Basmati Rice", "Amul Butter", "Tomatoes"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-slate-50/70 focus:bg-white transition-all outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Desktop Live Autocomplete */}
              {isSearchFocused && searchResults.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
                    <span>SUGGESTED PRODUCTS</span>
                    <span className="text-emerald-700 font-medium">Press Enter for all results</span>
                  </div>
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-emerald-50/50 transition-colors"
                    >
                      <img
                        src={prod.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-medium">{prod.brand}</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{prod.name}</p>
                        <p className="text-xs text-emerald-700 font-bold">
                          {formatPrice(prod.variants[0]?.price || 0)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {role !== 'CUSTOMER' && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                >
                  Admin Desk
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                        {user.name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">My Account</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-emerald-600 text-slate-700 text-xs font-bold"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-emerald-700">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <span className="block text-[10px] text-emerald-200 font-medium leading-none">
                    {totalItemsCount} items
                  </span>
                  <span className="block text-xs font-bold leading-tight">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Strip */}
        <nav className="border-t border-slate-100 bg-white px-3 py-1.5 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
            <Link
              href="/shop"
              className={`px-3 py-1 rounded-full transition-colors text-xs ${
                pathname === '/shop'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href="/deals"
              className="ml-auto text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg flex-shrink-0"
            >
              <Percent className="w-3.5 h-3.5 text-amber-600" />
              <span>Offers</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* User Dropdown Menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <div
            className="w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 text-xs space-y-2 animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {user && (
              <div className="pb-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.phone}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${roleBadgeColors[role]}`}
                >
                  Role: {roleLabels[role]}
                </span>
              </div>
            )}

            <Link
              href="/account"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold"
            >
              <UserIcon className="w-4 h-4 text-emerald-700" />
              Profile & Addresses
            </Link>

            <Link
              href="/account/orders"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold"
            >
              <PackageCheck className="w-4 h-4 text-emerald-700" />
              My Orders & Live Tracking
            </Link>

            {role !== 'CUSTOMER' && (
              <Link
                href="/admin"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl text-emerald-800 bg-emerald-50 font-bold"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                Back-Office Admin Panel
              </Link>
            )}

            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                setIsRoleModalOpen(true);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-left"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Switch Role / Persona
            </button>

            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-left"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Phone + OTP Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
