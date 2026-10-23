'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Wheat,
  Apple,
  Milk,
  Cookie,
  ChevronRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { HeroBannerCarousel } from '@/components/home/HeroBannerCarousel';
import { ExploreCategoriesGrid } from '@/components/categories/ExploreCategoriesGrid';
import { OfferDealsShowcase } from '@/components/home/OfferDealsShowcase';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';

const CATEGORY_THEMES: Record<string, {
  bg: string;
  ring: string;
  text: string;
  shortName: string;
}> = {
  'cat-groceries': {
    bg: 'bg-amber-50',
    ring: 'border border-amber-200 ring-4 ring-amber-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Groceries & Staples',
  },
  'cat-fruits-veg': {
    bg: 'bg-emerald-50',
    ring: 'border border-emerald-200 ring-4 ring-emerald-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Fruits & Veg',
  },
  'cat-dairy': {
    bg: 'bg-sky-50',
    ring: 'border border-sky-200 ring-4 ring-sky-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Dairy & Breakfast',
  },
  'cat-snacks': {
    bg: 'bg-orange-50',
    ring: 'border border-orange-200 ring-4 ring-orange-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Snacks & Munchies',
  },
  'cat-beverages': {
    bg: 'bg-yellow-50',
    ring: 'border border-yellow-200 ring-4 ring-yellow-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Beverages',
  },
  'cat-cleaning': {
    bg: 'bg-teal-50',
    ring: 'border border-teal-200 ring-4 ring-teal-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Cleaning',
  },
  'cat-personal-care': {
    bg: 'bg-purple-50',
    ring: 'border border-purple-200 ring-4 ring-purple-100/60',
    text: 'text-gray-900 group-hover:text-[#0F5132]',
    shortName: 'Personal Care',
  },
};

export default function HomePage() {
  const { products, categories } = useStore();
  const { applyCoupon, setIsCartDrawerOpen } = useCart();
  const [couponClaimed, setCouponClaimed] = useState(false);

  const flashDeals = products
    .filter((p) =>
      p.variants.some((v) => v.mrp > v.price && ((v.mrp - v.price) / v.mrp) >= 0.14)
    )
    .slice(0, 5);

  const featuredStaples = products.filter((p) => p.categoryId === 'cat-groceries');
  const freshProduce = products.filter((p) => p.categoryId === 'cat-fruits-veg');
  const dairyProducts = products.filter((p) => p.categoryId === 'cat-dairy');
  const biscuitIndulgence = products.filter((p) => p.subcategoryId === 'sub-biscuits');
  const householdClean = products.filter(
    (p) =>
      p.categoryId === 'cat-cleaning' ||
      p.categoryId === 'cat-snacks' ||
      p.categoryId === 'cat-beverages'
  );

  const handleClaimWelcomeCoupon = () => {
    applyCoupon('WELCOME100');
    setCouponClaimed(true);
    setIsCartDrawerOpen(true);
    setTimeout(() => setCouponClaimed(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-6 sm:space-y-8">

        {/* ================= HERO MULTI-SLIDE CAROUSEL ================= */}
        <section>
          <HeroBannerCarousel />
        </section>

        {/* ================= EXPLORE CATEGORIES SECTION (BLINKIT-STYLE 4-COL PASTEL TILES) ================= */}
        <section className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight">
              Explore Categories
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#0F5132] hover:text-[#054A29] inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ExploreCategoriesGrid maxSections={3} />
        </section>

        {/* ================= SECTION 0: FLASH SAVINGS & PRICE DROPS ================= */}
        {flashDeals.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#D97706] flex items-center justify-center font-black">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight flex items-center gap-2">
                    <span>Daily Flash Savings</span>
                    <span className="text-[10px] bg-[#D97706] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Up to 21% OFF
                    </span>
                  </h2>
                </div>
              </div>
              <Link
                href="/deals"
                className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
              >
                All Offers <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION: FESTIVE DEALS & MEGA DISCOUNT SWITCHER ================= */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                Festive Gifting & Super Savings
              </h2>
            </div>
            <Link
              href="/deals"
              className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
            >
              All Deals <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <OfferDealsShowcase />
        </section>

        {/* ================= SECTION: CREAM-BASED INDULGENCE (QUICK-COMMERCE BISCUIT INDULGENCE) ================= */}
        {biscuitIndulgence.length > 0 && (
          <section className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                  Cream-based indulgence
                </h2>
              </div>
              <Link
                href="/shop?category=snacks-munchies&subcategory=biscuits-rusks"
                className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
              >
                See all ({biscuitIndulgence.length}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
              {biscuitIndulgence.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* See all products footer banner with overlapping avatar pills */}
            <Link
              href="/shop?category=snacks-munchies&subcategory=biscuits-rusks"
              className="w-full bg-[#F8F9FA] hover:bg-emerald-50/50 border border-gray-200/90 hover:border-emerald-200/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all group shadow-2xs mt-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2 overflow-hidden">
                  {biscuitIndulgence.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.variants[0]?.image || item.images[0]}
                      alt=""
                      className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover shadow-2xs"
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#0F5132] transition-colors">
                  See all products
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0F5132] group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>
        )}

        {/* ================= SECTION 1: DAILY PANTRY STAPLES ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center">
                <Wheat className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  Atta, Rice, Dal & Cooking Oils
                </h2>
              </div>
            </div>
            <Link
              href="/shop?category=groceries-staples"
              className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
            >
              See all ({featuredStaples.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {featuredStaples.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= STORE GUARANTEE APP RIBBON ================= */}
        <section className="bg-gradient-to-br from-[#0F5132] via-[#0C3E26] to-[#0A2E1D] rounded-2xl p-3.5 sm:p-5 text-white shadow-xs border border-emerald-600/30 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    Sector 14 Fulfillment Hub
                  </h3>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-700/90 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    100% Owned
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">
                  Direct from local dark store to your doorstep
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Features 3-Pills Bar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-1 border-t border-emerald-700/40 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl py-1.5 px-1">
              <p className="text-[10px] sm:text-xs font-extrabold text-amber-300">⚡ 12–15 Mins</p>
              <p className="text-[9px] text-emerald-200 hidden sm:block">Express Delivery</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl py-1.5 px-1">
              <p className="text-[10px] sm:text-xs font-extrabold text-white">📅 2-Hr Slots</p>
              <p className="text-[9px] text-emerald-200 hidden sm:block">Scheduled Choice</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl py-1.5 px-1">
              <p className="text-[10px] sm:text-xs font-extrabold text-emerald-300">₹0 Delivery</p>
              <p className="text-[9px] text-emerald-200 hidden sm:block">No Minimum Fee</p>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: FARM FRESH VEGGIES & FRUITS ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                <Apple className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  Farm-Fresh Fruits & Vegetables
                </h2>
              </div>
            </div>
            <Link
              href="/shop?category=fruits-vegetables"
              className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
            >
              See all ({freshProduce.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {freshProduce.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= SECTION 3: DAIRY & BREAKFAST ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                <Milk className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  Amul Milk, Fresh Paneer & Dairy
                </h2>
              </div>
            </div>
            <Link
              href="/shop?category=dairy-breakfast"
              className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
            >
              See all ({dairyProducts.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {dairyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: SNACKS, BEVERAGES & CLEANING ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                <Cookie className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  Snacks, Tea & Laundry Care
                </h2>
              </div>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-0.5"
            >
              See all ({householdClean.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {householdClean.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
}
