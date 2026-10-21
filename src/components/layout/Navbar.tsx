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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState('Sector 14 · Model Town');

  // Animated rotating placeholder for quick-commerce search bar (pauses while typing/focused)
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadePlaceholder, setFadePlaceholder] = useState(true);

  useEffect(() => {
    if (isSearchFocused || searchQuery.trim().length > 0) return;
    const interval = setInterval(() => {
      setFadePlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFadePlaceholder(true);
      }, 200);
    }, 3200);
    return () => clearInterval(interval);
  }, [isSearchFocused, searchQuery]);

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      setIsSearchFocused(false);
      setSearchQuery('');
      router.push(`/product/${searchResults[selectedIndex].slug}`);
      return;
    }
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSelectedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0 ? (prev + 1) % searchResults.length : -1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0
          ? (prev - 1 + searchResults.length) % searchResults.length
          : -1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand & Location */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Brand Logo using Official Artwork */}
              <Link
                href="/"
                className="flex items-center group flex-shrink-0"
                aria-label="Pravdhan Store"
              >
                <img
                  src="/images/logo.png"
                  alt="Pravdhan Store"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-102"
                />
              </Link>

              {/* Delivery Selector High-Contrast Pill */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-left min-w-0 shadow-2xs group"
                title={`Delivery to ${selectedZone} (${storeSettings.city})`}
              >
                <div className="w-6 h-6 rounded-full bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#0F5132]" />
                </div>
                <div className="min-w-0 pr-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#0F5132] bg-[#0F5132]/10 px-1.5 py-0.2 rounded-full">
                      ⚡ 12 MINS
                    </span>
                    <span className="text-xs font-bold text-gray-900 truncate block max-w-[105px] sm:max-w-[140px]">
                      {selectedZone}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Center: Full Search Bar with rounded-full & animated placeholder */}
            <div className="hidden md:block flex-1 max-w-xl lg:max-w-2xl mx-2 sm:mx-4 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={placeholderIndex !== -1 ? PLACEHOLDERS[placeholderIndex] : 'Search for milk, atta, vegetables...'}
                  className={`w-full pl-11 pr-10 py-2.5 rounded-full border text-xs font-medium bg-gray-50/80 focus:bg-white text-gray-900 border-gray-200 focus:border-[#0F5132] focus:ring-4 focus:ring-[#0F5132]/10 transition-all outline-none ${
                    fadePlaceholder ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
                  } placeholder:transition-opacity placeholder:duration-200 placeholder:text-gray-400`}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search input"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndex(-1);
                    }}
                    className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Autocomplete dropdown with keyboard nav support */}
              {isSearchFocused && (
                <>
                  {searchResults.length > 0 ? (
                    <div
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden divide-y divide-gray-100"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="p-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 flex justify-between">
                        <span>SUGGESTED PRODUCTS</span>
                        <span className="text-[#0F5132] font-semibold">Use ↑↓ keys & Enter</span>
                      </div>
                      {searchResults.map((prod, idx) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.slug}`}
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className={`flex items-center gap-3 p-2.5 transition-colors ${
                            idx === selectedIndex ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                          }`}
                        >
                          <img
                            src={prod.images[0]}
                            alt=""
                            className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50 p-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{prod.brand}</p>
                            <p className="text-xs font-semibold text-gray-900 truncate">{prod.name}</p>
                            <p className="text-xs text-[#0F5132] font-bold">
                              {formatPrice(prod.variants[0]?.price || 0)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery.trim().length > 0 ? (
                    <div
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4 text-center"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <p className="text-xs font-bold text-gray-800">No products found for &ldquo;{searchQuery}&rdquo;</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Try searching &ldquo;milk&rdquo;, &ldquo;atta&rdquo;, or &ldquo;tomatoes&rdquo;</p>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Right: Staff Controls (only rendered when testing non-customer roles) */}
            {role !== 'CUSTOMER' && (
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(true)}
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-2xs"
                  title="Switch persona for testing"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-amber-700 font-medium">Staff:</span>
                  <span className="font-bold">{roleLabels[role]}</span>
                  <ChevronDown className="w-3 h-3 text-amber-600" />
                </button>

                <Link
                  href="/admin"
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors shadow-2xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Full-Width Search Input (Visible only on mobile < md) */}
          <div className="mt-2 md:hidden relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={placeholderIndex !== -1 ? PLACEHOLDERS[placeholderIndex] : 'Search...'}
                className={`w-full pl-10 pr-9 py-2 rounded-full border text-xs font-medium bg-gray-50 text-gray-900 border-gray-200 focus:border-[#0F5132] focus:bg-white outline-none shadow-2xs ${
                  fadePlaceholder ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
                } placeholder:transition-opacity placeholder:duration-200 placeholder:text-gray-400`}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear mobile search input"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Category Carousel / Horizontal Scrolling Pill Bar with Subtle Active State */}
        <nav className="border-t border-gray-100 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1.5 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs font-semibold whitespace-nowrap">
            <Link
              href="/shop"
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/shop'
                  ? 'bg-[#0F5132] text-white shadow-xs font-bold'
                  : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/70 hover:text-gray-900'
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
                  className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
                    isSelected
                      ? 'bg-[#0F5132] text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200/90 hover:border-gray-300'
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            <Link
              href="/deals"
              className="ml-auto text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full flex-shrink-0 transition-colors"
            >
              <Percent className="w-3.5 h-3.5 text-amber-700" />
              <span>Offers & Deals</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Delivery Location Modal with Full Delivery Areas & Mode Clarification */}
      {isLocationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">Select Delivery Location</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select your delivery neighborhood in Gurugram to view accurate delivery times and available slots:
            </p>

            {/* Selectable Neighborhood Zones */}
            <div className="space-y-2">
              {[
                {
                  zone: 'Sector 14 · Model Town',
                  tag: 'Store Hub Direct',
                  speed: '⚡ 12–15 Mins Express Delivery Available',
                  isHub: true,
                },
                {
                  zone: 'Old DLF · Sector 15',
                  tag: 'Zone 1 Coverage',
                  speed: '⚡ 15–20 Mins Express Delivery Available',
                  isHub: false,
                },
                {
                  zone: 'DLF Phase 1 & Cyber City',
                  tag: 'Zone 2 Coverage',
                  speed: '📅 Scheduled 2-Hour Slots (Morning/Evening)',
                  isHub: false,
                },
                {
                  zone: 'Civil Lines · Gurugram',
                  tag: 'Zone 2 Coverage',
                  speed: '📅 Scheduled 2-Hour Slots (Morning/Evening)',
                  isHub: false,
                },
              ].map((loc) => {
                const isSelected = selectedZone === loc.zone;
                return (
                  <button
                    key={loc.zone}
                    type="button"
                    onClick={() => setSelectedZone(loc.zone)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{loc.zone}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                          {loc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                        {loc.speed}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Delivery Modes Clarification Banner */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Our 2 Delivery Guarantees:</span>
              </div>
              <p className="text-slate-600">
                • <strong className="text-slate-800">⚡ 12–15 Min Express:</strong> Instant dispatch from Sector 14 Hub for milk, bread, veggies, and urgent snacks.
              </p>
              <p className="text-slate-600">
                • <strong className="text-slate-800">📅 2-Hour Scheduled Slots:</strong> Morning (7–9 AM), Afternoon (12–2 PM), Evening (6–8 PM) for monthly staples & bulk orders.
              </p>
            </div>

            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-98"
            >
              Confirm Delivery Location
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
