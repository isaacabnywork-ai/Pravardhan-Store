'use client';

import React, { useState, useEffect } from 'react';
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
  LayoutDashboard,
  LogOut,
  Zap,
  PackageCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { Role } from '@/types';
import { formatPrice } from '@/lib/utils';
import { RoleSwitcherModal } from './RoleSwitcherModal';
import { AuthModal } from '@/components/auth/AuthModal';

const PLACEHOLDERS = [
  'Search "milk, butter, curd..."',
  'Search "chakki atta, rice..."',
  'Search "fresh tomatoes, onion..."',
  'Search "chips, biscuits, tea..."',
  'Search "surf excel, cleaners..."',
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { totalItemsCount, grandTotal, setIsCartDrawerOpen } = useCart();
  const { storeSettings, products, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Animated rotating placeholder for quick-commerce search bar
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadePlaceholder, setFadePlaceholder] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadePlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFadePlaceholder(true);
      }, 200);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Search results
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.variants.some((v) =>
              v.title.toLowerCase().includes(searchQuery.toLowerCase())
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
    DELIVERY_STAFF: 'Delivery Staff',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand & Location */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-lg font-black tracking-tight text-slate-900">
                      Pravdhan
                    </span>
                    <span className="text-lg font-black tracking-tight text-emerald-600">
                      STORE
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                    12 Mins Delivery
                  </span>
                </div>
              </Link>

              {/* Delivery Location Picker Trigger */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-left min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900 truncate block max-w-[130px] sm:max-w-[180px]">
                      {storeSettings.serviceArea}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 block truncate">
                    ⚡ 12-15 Mins • Slot Ready
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Center: Full Search Bar with animated placeholder */}
            <div className="hidden md:block flex-1 max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={placeholderIndex !== -1 ? PLACEHOLDERS[placeholderIndex] : 'Search...'}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-xs font-medium bg-slate-50/80 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none ${
                    fadePlaceholder ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
                  } placeholder:transition-opacity placeholder:duration-200 placeholder:text-slate-400`}
                />
                <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Autocomplete dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>SUGGESTED PRODUCTS</span>
                    <span className="text-emerald-700">Press Enter to view all</span>
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
                        className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-slate-50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{prod.brand}</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                        <p className="text-xs text-emerald-700 font-black">
                          {formatPrice(prod.variants[0]?.price || 0)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Role Switcher, Profile, and Cart */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {/* Role Switcher Pill */}
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors"
                title="Switch persona"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Role:</span>
                <span className="underline">{roleLabels[role]}</span>
              </button>

              {/* Admin desk link if staff */}
              {role !== 'CUSTOMER' && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* User Account Button */}
              <button
                onClick={() => (user ? setIsUserMenuOpen(!isUserMenuOpen) : setIsAuthModalOpen(true))}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
              >
                {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </button>

              {/* Cart Trigger Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs font-black shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-emerald-700">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-[11px] leading-tight font-black">
                    {totalItemsCount > 0 ? formatPrice(grandTotal) : 'My Cart'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Full-Width Search Input (Visible only on mobile < md) */}
          <div className="mt-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={placeholderIndex !== -1 ? PLACEHOLDERS[placeholderIndex] : 'Search...'}
                className={`w-full pl-9 pr-9 py-2 rounded-xl border text-xs font-medium bg-slate-50 text-slate-900 border-slate-200 focus:border-emerald-600 focus:bg-white outline-none shadow-xs ${
                  fadePlaceholder ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
                } placeholder:transition-opacity placeholder:duration-200 placeholder:text-slate-400`}
              />
              <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Mobile search dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                className="absolute left-3 right-3 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100"
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
                      className="w-9 h-9 object-contain rounded-lg border border-slate-100"
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

        {/* Category Carousel / Horizontal Scrolling Pills with Icons */}
        <nav className="border-t border-slate-100 bg-white/80 backdrop-blur-xs px-3 sm:px-4 py-1.5 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs font-bold whitespace-nowrap">
            <Link
              href="/shop"
              className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1 ${
                pathname === '/shop'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All Items</span>
            </Link>

            {categories.map((cat) => {
              const isSelected = pathname.includes(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/60'
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            <Link
              href="/deals"
              className="ml-auto text-amber-900 hover:text-amber-950 font-black flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-xl flex-shrink-0"
            >
              <Percent className="w-3.5 h-3.5 text-amber-700" />
              <span>Offers & Deals</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Delivery Location Modal */}
      {isLocationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">Delivery Location</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                Serving Area • Hub 1
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{storeSettings.serviceArea}</p>
              <p className="text-[11px] text-slate-600">{storeSettings.city}, India</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Instant & Same-Day delivery active</span>
              </div>
            </div>

            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      {/* User Menu Modal */}
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
                <p className="text-[11px] text-slate-500">+91 {user.phone}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {roleLabels[role]}
                </span>
              </div>
            )}

            <Link
              href="/account"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold"
            >
              <UserIcon className="w-4 h-4 text-emerald-700" />
              Profile & Saved Addresses
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
