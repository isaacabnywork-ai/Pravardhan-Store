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
  Check,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';

const CATEGORY_THEMES: Record<string, {
  bg: string;
  border: string;
  text: string;
  shortName: string;
}> = {
  'cat-groceries': {
    bg: 'bg-amber-100/70 group-hover:bg-amber-100',
    border: 'border-amber-200/90',
    text: 'text-amber-950',
    shortName: 'Groceries',
  },
  'cat-fruits-veg': {
    bg: 'bg-emerald-100/70 group-hover:bg-emerald-100',
    border: 'border-emerald-200/90',
    text: 'text-emerald-950',
    shortName: 'Fruits & Veg',
  },
  'cat-dairy': {
    bg: 'bg-sky-100/70 group-hover:bg-sky-100',
    border: 'border-sky-200/90',
    text: 'text-sky-950',
    shortName: 'Dairy & Eggs',
  },
  'cat-snacks': {
    bg: 'bg-orange-100/70 group-hover:bg-orange-100',
    border: 'border-orange-200/90',
    text: 'text-orange-950',
    shortName: 'Munchies',
  },
  'cat-beverages': {
    bg: 'bg-yellow-100/70 group-hover:bg-yellow-100',
    border: 'border-yellow-200/90',
    text: 'text-yellow-950',
    shortName: 'Beverages',
  },
  'cat-cleaning': {
    bg: 'bg-cyan-100/70 group-hover:bg-cyan-100',
    border: 'border-cyan-200/90',
    text: 'text-cyan-950',
    shortName: 'Cleaning',
  },
  'cat-personal-care': {
    bg: 'bg-purple-100/70 group-hover:bg-purple-100',
    border: 'border-purple-200/90',
    text: 'text-purple-950',
    shortName: 'Personal Care',
  },
};

export default function HomePage() {
  const { products, categories } = useStore();
  const { applyCoupon, setIsCartDrawerOpen } = useCart();
  const [couponClaimed, setCouponClaimed] = useState(false);

  const featuredStaples = products.filter((p) => p.categoryId === 'cat-groceries');
  const freshProduce = products.filter((p) => p.categoryId === 'cat-fruits-veg');
  const dairyProducts = products.filter((p) => p.categoryId === 'cat-dairy');
  const householdClean = products.filter(
    (p) => p.categoryId === 'cat-cleaning' || p.categoryId === 'cat-snacks'
  );

  const handleClaimWelcomeCoupon = () => {
    applyCoupon('WELCOME100');
    setCouponClaimed(true);
    setIsCartDrawerOpen(true);
    setTimeout(() => setCouponClaimed(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-5 sm:space-y-8">

        {/* ================= COMPACT APP PROMO BANNERS (Horizontal Snap Scroll) ================= */}
        <section className="relative">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1">
            {/* Banner 1: Seasonal Staples */}
            <div className="snap-center flex-shrink-0 w-[90vw] sm:w-[500px] lg:w-[calc(50%-8px)] rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-5 sm:p-6 flex items-center justify-between shadow-[0_4px_20px_rgba(5,150,105,0.2)] relative overflow-hidden">
              <div className="relative z-10 max-w-[62%] space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                  ⚡ 12-15 MINS EXPRESS
                </span>
                <h2 className="text-base sm:text-xl font-black leading-tight text-white tracking-tight">
                  Staples & Atta at Wholesale Rates
                </h2>
                <p className="text-[11px] sm:text-xs text-emerald-100 font-medium line-clamp-1">
                  Aashirvaad, Daawat & Tata Sampann up to 25% OFF
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop?category=groceries-staples"
                    className="inline-flex items-center gap-1.5 text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                  >
                    Shop Staples <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/15 backdrop-blur-xs flex-shrink-0 p-1.5 shadow-inner border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80"
                  alt="Daily Staples"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Banner 2: First Order Promo with Working Coupon Claim */}
            <div className="snap-center flex-shrink-0 w-[90vw] sm:w-[500px] lg:w-[calc(50%-8px)] rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 text-white p-5 sm:p-6 flex items-center justify-between shadow-[0_4px_20px_rgba(109,40,217,0.2)] relative overflow-hidden">
              <div className="relative z-10 max-w-[62%] space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                  🎟️ COUPON: WELCOME100
                </span>
                <h2 className="text-base sm:text-xl font-black leading-tight text-white tracking-tight">
                  Flat ₹100 OFF on First Order
                </h2>
                <p className="text-[11px] sm:text-xs text-purple-100 font-medium line-clamp-1">
                  Valid on all orders above ₹499 • Gurugram Hub
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClaimWelcomeCoupon}
                    className="inline-flex items-center gap-1.5 text-xs font-black bg-white hover:bg-purple-50 text-purple-950 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
                  >
                    {couponClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Coupon Applied!
                      </>
                    ) : (
                      <>
                        Claim Discount <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/15 backdrop-blur-xs flex-shrink-0 p-1.5 shadow-inner border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
                  alt="Grocery Cart Deals"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= APP CATEGORY ROUNDELS (Visual Circular Squircles) ================= */}
        <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Explore Categories
            </h2>
            <Link
              href="/shop"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3.5 text-center">
            {categories.map((cat) => {
              const theme = CATEGORY_THEMES[cat.id] || {
                bg: 'bg-slate-100',
                border: 'border-slate-200',
                text: 'text-slate-900',
                shortName: cat.name.split(' ')[0],
              };

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="flex flex-col items-center group active:scale-95 transition-transform"
                >
                  <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl ${theme.bg} border ${theme.border} p-1.5 flex flex-col items-center justify-center relative overflow-hidden mb-1.5 group-hover:shadow-md transition-all shadow-xs`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black line-clamp-1 leading-tight group-hover:text-emerald-700 ${theme.text}`}>
                    {theme.shortName}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 1: DAILY PANTRY STAPLES ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Wheat className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Atta, Rice, Dal & Cooking Oils
                </h2>
                <p className="text-[10px] text-slate-500">Essential grocery staples • Unpolished & Pure</p>
              </div>
            </div>
            <Link
              href="/shop?category=groceries-staples"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {featuredStaples.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= STORE GUARANTEE APP RIBBON ================= */}
        <section className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-emerald-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-400/30">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black leading-tight text-white flex items-center gap-2">
                <span>Sector 14 Direct Fulfillment Hub</span>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-100 font-bold px-2 py-0.5 rounded-full">100% Owned Inventory</span>
              </p>
              <p className="text-[11px] text-emerald-200/90 mt-0.5">
                ⚡ 12–15 Min Express Delivery &nbsp;•&nbsp; 📅 2-Hour Scheduled Slots &nbsp;•&nbsp; ₹0 Delivery Fee
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="self-start sm:self-center flex-shrink-0 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs"
          >
            Explore Catalog
          </Link>
        </section>

        {/* ================= SECTION 2: FARM FRESH VEGGIES & FRUITS ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Apple className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Farm-Fresh Fruits & Vegetables
                </h2>
                <p className="text-[10px] text-slate-500">Graded & harvested at dawn • Crisp & Wax-Free</p>
              </div>
            </div>
            <Link
              href="/shop?category=fruits-vegetables"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              See all ({freshProduce.length}) <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {freshProduce.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= SECTION 3: DAIRY & BREAKFAST ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Milk className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Amul Milk, Fresh Paneer & Dairy
                </h2>
                <p className="text-[10px] text-slate-500">Cold chain delivered daily • Pure & chilled</p>
              </div>
            </div>
            <Link
              href="/shop?category=dairy-breakfast"
              className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {dairyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: SNACKS & CLEANING ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                <Cookie className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Snacks, Tea & Laundry Care
                </h2>
                <p className="text-[10px] text-slate-500">Haldiram&apos;s, Surf Excel & Tata Tea</p>
              </div>
            </div>
            <Link
              href="/shop"
              className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
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
