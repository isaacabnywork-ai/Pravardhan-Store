'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ChevronDown,
  User,
  Search,
  ShoppingBag,
  Heart,
  PackageCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAddress } from '@/context/AddressContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { LocationModal } from './LocationModal';

export function Header() {
  const router = useRouter();
  const { currentAddress, setIsLocationModalOpen } = useAddress();
  const { itemCount, subtotal } = useCart();
  const { wishlistProducts } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Operational Bar on Desktop */}
        <div className="hidden md:block bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Fresh Mandi Produce & Daily Essentials
              </span>
              <span className="text-emerald-300/60">•</span>
              <span className="text-emerald-100">Same-Day & Scheduled Delivery in Lucknow</span>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <span className="flex items-center gap-1 text-emerald-200">
                <PhoneCall className="w-3 h-3 text-emerald-300" />
                +91 98765 43210
              </span>
              <Link
                href="/admin"
                className="text-emerald-200 hover:text-white transition-colors font-semibold underline underline-offset-2 decoration-emerald-500/50"
              >
                Store Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2.5 sm:gap-5">
            {/* Left: Brand Identity */}
            <Link href="/" className="shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight leading-none">
                  Pravdhan<span className="text-emerald-600">Store</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider leading-tight hidden sm:block">
                  Fresh Kirana & Produce
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 text-left hover:bg-emerald-50/60 rounded-xl transition-all border border-slate-200/90 hover:border-emerald-300 min-w-0 flex-1 max-w-[130px] sm:max-w-xs shrink-0 group"
              title="Change Delivery Location"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 truncate leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                    {currentAddress?.label || 'Deliver to'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </div>
                <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate">
                  {currentAddress
                    ? `${currentAddress.houseFlat}, ${currentAddress.area}`
                    : 'Select location'}
                </p>
              </div>
            </button>

            {/* Desktop Search Bar (Prominent, High-Visibility) */}
            <div className="hidden lg:block flex-1 max-w-xl mx-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                <input
                  type="text"
                  placeholder='Search for "fresh vegetables", "atta", "milk", "onion", "oil", "maggi"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-hidden transition-all shadow-xs"
                />
              </form>
            </div>

            {/* Right Actions: Orders, Wishlist, Account, Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop Orders Link */}
              <Link
                href="/orders"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors font-semibold text-xs shrink-0"
                title="My Orders"
              >
                <PackageCheck className="w-4 h-4 text-slate-600" />
                <span>Orders</span>
              </Link>

              {/* Wishlist Link */}
              <Link
                href="/account/wishlist"
                className="hidden sm:flex relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-colors shrink-0"
                title="Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlistProducts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {wishlistProducts.length}
                  </span>
                )}
              </Link>

              {/* Account Link */}
              <Link
                href="/account"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors shrink-0"
                title="Account"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold">Account</span>
              </Link>

              {/* Cart Button: Fresh Emerald Action Color */}
              <Link
                href="/cart"
                id="header-cart-btn"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all shadow-sm hover:shadow-emerald-600/25 active:scale-95 shrink-0"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[9px] font-black min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center leading-none ring-2 ring-emerald-700 shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="text-left leading-none">
                  {itemCount > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-emerald-100 font-medium">Cart</span>
                      <span className="font-black text-xs sm:text-sm text-white">₹{subtotal}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold">Cart</span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Prominent Mobile Search Bar */}
          <div className="lg:hidden mt-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              <input
                type="text"
                placeholder="Search for atta, vegetables, milk, oil & more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-hidden transition-all shadow-xs"
              />
            </form>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal />
    </>
  );
}
