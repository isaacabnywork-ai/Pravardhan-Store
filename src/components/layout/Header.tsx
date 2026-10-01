'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, User, Search, ShoppingBag, Heart } from 'lucide-react';
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
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        {/* Top Operational Bar on Desktop */}
        <div className="hidden md:block bg-[#0F172A] text-slate-300 text-xs py-1.5 px-4 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-slate-200">
              Pravdhan Store • Same-Day & Scheduled Grocery Delivery in Lucknow
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span>Customer Care: +91 98765 43210</span>
              <Link href="/admin" className="text-blue-400 hover:text-white transition-colors">
                Partner Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Identity (Pure Text Only - No Logo/Icon) */}
            <Link href="/" className="shrink-0 flex items-center">
              <span className="font-black text-base sm:text-xl text-[#0F172A] tracking-tight whitespace-nowrap">
                Pravdhan <span className="text-[#2563EB]">Store</span>
              </span>
            </Link>

            {/* Delivery Location Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1 text-left hover:bg-slate-50 rounded-lg transition-colors border border-slate-200/80 min-w-0 flex-1 max-w-[125px] sm:max-w-xs"
              title="Change Delivery Location"
            >
              <div className="w-5 h-5 rounded bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="min-w-0 truncate leading-tight">
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-[#0F172A] uppercase truncate">
                    {currentAddress?.label || 'Deliver to'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#64748B] truncate">
                  {currentAddress
                    ? `${currentAddress.houseFlat}, ${currentAddress.area}`
                    : 'Select location'}
                </p>
              </div>
            </button>

            {/* Desktop Search Bar */}
            <div className="hidden lg:block flex-1 max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder='Search for "atta", "dal", "milk", "onion", "oil", "maggi"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-[#0F172A] text-sm pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] focus:bg-white focus:border-[#2563EB] focus:outline-hidden transition-all"
                />
              </form>
            </div>

            {/* Right Actions: Fully visible, strictly right-aligned, shrink-0 */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Wishlist Icon (Desktop/Tablet) */}
              <Link
                href="/account/wishlist"
                className="hidden sm:flex relative p-2 text-[#0F172A] hover:text-[#2563EB] hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                title="Wishlist"
              >
                <Heart className="w-4 h-4 text-[#0F172A]" />
                {wishlistProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#DC2626] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistProducts.length}
                  </span>
                )}
              </Link>

              {/* Account Link (Desktop/Tablet - mobile has it in bottom nav) */}
              <Link
                href="/account"
                className="hidden md:flex items-center gap-1.5 p-2 text-[#0F172A] hover:text-[#2563EB] hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                title="Account"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F172A]" />
                <span className="text-xs font-semibold text-[#0F172A]">Account</span>
              </Link>

              {/* Cart Button: ALWAYS 100% visible, fully padded, right in view */}
              <Link
                href="/cart"
                id="header-cart-btn"
                className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#0F172A] text-white text-[9px] font-black min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center leading-none">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="text-left leading-none">
                  {itemCount > 0 ? (
                    <div className="font-black text-xs sm:text-sm">₹{subtotal}</div>
                  ) : (
                    <span className="text-xs font-bold">Cart</span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Prominent Mobile Search Bar */}
          <div className="lg:hidden mt-1.5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for atta, dal, milk and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] text-[#0F172A] text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] focus:bg-white focus:border-[#2563EB] focus:outline-hidden transition-all"
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
