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
  ChevronRight,
  ShieldAlert,
  Percent,
  X,
  Store,
  LayoutDashboard,
  LogOut,
  Zap,
  PackageCheck,
  Check,
  ShoppingBasket,
  Wheat,
  Apple,
  Milk,
  Cookie,
  Coffee,
  Sparkles,
  Smile,
  Plus,
  Crosshair,
  Home,
  Share2,
  MoreHorizontal,
  Phone,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Role } from '@/types';
import { formatPrice } from '@/lib/utils';
import { RoleSwitcherModal } from './RoleSwitcherModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { SearchBar } from './SearchBar';
import { AnnouncementBanner } from '@/components/cms/AnnouncementBanner';

interface CategoryNavItem {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
}

const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  {
    id: 'all',
    name: 'All',
    fullName: 'All Products',
    slug: 'all',
    href: '/shop',
    icon: ShoppingBasket,
    badge: null,
  },
  {
    id: 'cat-groceries',
    name: 'Staples',
    fullName: 'Groceries & Staples',
    slug: 'groceries-staples',
    href: '/shop?category=groceries-staples',
    icon: Wheat,
    badge: null,
  },
  {
    id: 'cat-fruits-veg',
    name: 'Fruits & Veg',
    fullName: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    href: '/shop?category=fruits-vegetables',
    icon: Apple,
    badge: 'Fresh',
  },
  {
    id: 'cat-dairy',
    name: 'Dairy',
    fullName: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    href: '/shop?category=dairy-breakfast',
    icon: Milk,
    badge: null,
  },
  {
    id: 'cat-snacks',
    name: 'Snacks',
    fullName: 'Snacks & Munchies',
    slug: 'snacks-munchies',
    href: '/shop?category=snacks-munchies',
    icon: Cookie,
    badge: null,
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    fullName: 'Beverages',
    slug: 'beverages',
    href: '/shop?category=beverages',
    icon: Coffee,
    badge: null,
  },
  {
    id: 'cat-cleaning',
    name: 'Cleaning',
    fullName: 'Cleaning & Household',
    slug: 'cleaning-household',
    href: '/shop?category=cleaning-household',
    icon: Sparkles,
    badge: null,
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care',
    fullName: 'Personal Care',
    slug: 'personal-care',
    href: '/shop?category=personal-care',
    icon: Smile,
    badge: null,
  },
  {
    id: 'deals',
    name: 'Deals',
    fullName: 'Offers & Deals',
    slug: 'deals',
    href: '/deals',
    icon: Percent,
    badge: 'New',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const {
    totalItemsCount,
    grandTotal,
    isLocationModalOpen,
    setIsLocationModalOpen,
    selectedZone,
    openCartWithLocationCheck,
  } = useCart();
  const { storeSettings, products, categories } = useStore();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setActiveCategory(params.get('category'));
    }
  }, [pathname]);

  const isNavActive = (item: (typeof CATEGORY_NAV_ITEMS)[0]) => {
    if (pathname === '/deals') {
      return item.slug === 'deals';
    }
    if (pathname === '/shop') {
      if (activeCategory) {
        return item.slug === activeCategory;
      }
      return item.slug === 'all';
    }
    if (pathname === '/') {
      return item.slug === 'all';
    }
    return false;
  };

  const roleLabels: Record<Role, string> = {
    CUSTOMER: 'Customer',
    PRODUCT_MANAGER: 'Product Mgr',
    STORE_MANAGER: 'Store Mgr',
    ORDER_MANAGER: 'Order Mgr',
    DELIVERY_STAFF: 'Delivery Staff',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
        <AnnouncementBanner />
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Logo + (Desktop Location Pill) */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Brand Logo using Official Artwork (Adaptive Light & Dark Logos) */}
              <Link
                href="/"
                className="flex items-center group flex-shrink-0"
                aria-label="Pravdhan Store"
              >
                <img
                  src="/images/logo.png"
                  alt="Pravdhan Store"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-102 dark:hidden"
                />
                <img
                  src="/images/logo-dark.png"
                  alt="Pravdhan Store"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-102 hidden dark:block"
                />
              </Link>

              {/* Desktop Location Selector (visible on lg+ desktop) */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-left min-w-0 shadow-2xs group cursor-pointer"
                title={`Delivery to ${selectedZone}`}
              >
                <span className="text-xs font-bold text-gray-900 truncate block max-w-[260px]">
                  {selectedZone}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile & Tablet Location Selector (Sticks on the right side!) */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="lg:hidden ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-left min-w-0 shadow-2xs group flex-shrink-0 cursor-pointer"
              title={`Delivery to ${selectedZone}`}
            >
              <span className="text-xs font-bold text-gray-900 truncate block max-w-[210px] sm:max-w-[280px]">
                {selectedZone}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Desktop Center: Full Search Bar */}
            <div className="hidden lg:block flex-1 max-w-xl lg:max-w-2xl mx-2 sm:mx-4 relative">
              <SearchBar />
            </div>

            {/* Desktop Right: Restored Staff, Account Profile & Cart Buttons! */}
            <div className="hidden lg:flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {/* Staff Pill (only rendered when testing non-customer roles) */}
              {role !== 'CUSTOMER' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(true)}
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
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

              {/* Desktop Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none cursor-pointer"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400 stroke-[2.2]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                )}
              </button>

              {/* Desktop User Account / Profile Button */}
              <button
                type="button"
                aria-label={user ? `Logged in as ${user.name}` : 'Login or Register'}
                onClick={() => (user ? setIsUserMenuOpen(!isUserMenuOpen) : setIsAuthModalOpen(true))}
                title={user ? `Logged in as ${user.name}` : 'Login / Register'}
                className="h-9 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 font-bold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none cursor-pointer"
              >
                {user ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-[#0F5132] text-white flex items-center justify-center font-bold text-[11px]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800 font-semibold max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 font-bold text-xs">Login</span>
                  </>
                )}
              </button>

              {/* Desktop Cart Trigger Button */}
              <button
                type="button"
                aria-label={`Open shopping cart with ${totalItemsCount} ${
                  totalItemsCount === 1 ? 'item' : 'items'
                } totaling ${formatPrice(grandTotal)}`}
                onClick={() => openCartWithLocationCheck(() => router.push('/checkout'))}
                className="flex items-center gap-2.5 bg-[#0F5132] hover:bg-[#054A29] text-white px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold shadow-sm shadow-[#0F5132]/25 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none cursor-pointer"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-400 text-gray-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0F5132]">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <span className="block text-[11px] leading-tight font-black">
                    {totalItemsCount > 0 ? formatPrice(grandTotal) : 'My Cart'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Full-Width Search Bar */}
          <div className="mt-2.5 lg:hidden relative">
            <SearchBar />
          </div>
        </div>

        {/* Category Bar below search bar — Styled with icon on top, name below, active underline bar, and crisp white background */}
        <nav
          aria-label="Product categories"
          className="bg-white border-t border-b border-gray-100 shadow-2xs overflow-x-auto no-scrollbar"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1 sm:gap-3 px-2 sm:px-4">
            {CATEGORY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-shrink-0 px-2 sm:px-3 pt-2 pb-1 min-w-[58px] sm:min-w-[70px] group cursor-pointer transition-colors focus-visible:outline-none"
                >
                  {/* Icon Container with Optional Floating Badge */}
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-200 ${
                        isActive
                          ? 'text-[#0F5132] stroke-[2.3] scale-105'
                          : 'text-gray-500 group-hover:text-gray-900 group-hover:scale-105 stroke-[1.8]'
                      }`}
                    />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight shadow-2xs leading-none">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Category Name */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-tight whitespace-nowrap transition-colors ${
                      isActive
                        ? 'text-[#0F5132] font-black'
                        : 'text-gray-600 group-hover:text-gray-950'
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Active Indicator Underline Bar */}
                  <span
                    className={`h-[3px] w-6 sm:w-8 rounded-full transition-all duration-200 mt-1 ${
                      isActive ? 'bg-[#0F5132]' : 'bg-transparent'
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

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
