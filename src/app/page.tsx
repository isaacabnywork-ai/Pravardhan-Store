'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Wheat,
  Apple,
  Milk,
  Cookie,
  BadgePercent,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';

export default function HomePage() {
  const { products, categories, storeSettings } = useStore();

  const featuredStaples = products.filter((p) => p.categoryId === 'cat-groceries');
  const freshProduce = products.filter((p) => p.categoryId === 'cat-fruits-veg');
  const dairyProducts = products.filter((p) => p.categoryId === 'cat-dairy');
  const householdClean = products.filter(
    (p) => p.categoryId === 'cat-cleaning' || p.categoryId === 'cat-snacks'
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-5 sm:space-y-8">
        {/* ================= COMPACT APP PROMO BANNERS (Horizontal Snap Scroll) ================= */}
        <section className="relative">
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1">
            {/* Banner 1: Seasonal Staples */}
            <div className="snap-center flex-shrink-0 w-[88vw] sm:w-[480px] lg:w-1/2 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-[65%] space-y-1">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Harvest Fresh
                </span>
                <h2 className="text-sm sm:text-lg font-black leading-tight text-white">
                  Staples & Atta at Wholesale Rates
                </h2>
                <p className="text-[10px] sm:text-xs text-emerald-100 line-clamp-1">
                  Aashirvaad, Daawat & Tata Sampann up to 20% OFF
                </p>
                <Link
                  href="/shop?category=groceries-staples"
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-300 hover:text-white pt-1"
                >
                  Shop Staples <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 p-1">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Banner 2: First Order Promo */}
            <div className="snap-center flex-shrink-0 w-[88vw] sm:w-[480px] lg:w-1/2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-[65%] space-y-1">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-slate-950/40 text-amber-200 px-2 py-0.5 rounded-full">
                  Code: WELCOME100
                </span>
                <h2 className="text-sm sm:text-lg font-black leading-tight text-white">
                  Flat ₹100 OFF on First Order
                </h2>
                <p className="text-[10px] sm:text-xs text-amber-100 line-clamp-1">
                  Applicable on orders above ₹499
                </p>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-white underline pt-1"
                >
                  Apply Coupon <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 p-1">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80"
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= APP CATEGORY ROUNDELS (Visual Circular Icons) ================= */}
        <section className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Explore Categories
            </h2>
            <Link
              href="/shop"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 text-center">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100/80 p-1 flex items-center justify-center overflow-hidden mb-1.5 group-hover:border-emerald-500 shadow-xs">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-emerald-700">
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            ))}
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
                <p className="text-[10px] text-slate-500">Essential grocery staples</p>
              </div>
            </div>
            <Link
              href="/shop?category=groceries-staples"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {featuredStaples.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= STORE GUARANTEE APP RIBBON ================= */}
        <section className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-3.5 text-white flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate">
                Physical Store Hub Advantage
              </p>
              <p className="text-[10px] text-emerald-200">
                100% owned inventory • ₹0 Delivery Fee • Sector 14 Hub
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="flex-shrink-0 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider"
          >
            Order
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
                <p className="text-[10px] text-slate-500">Graded & harvested at dawn</p>
              </div>
            </div>
            <Link
              href="/shop?category=fruits-vegetables"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
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
                <p className="text-[10px] text-slate-500">Cold chain delivered daily</p>
              </div>
            </div>
            <Link
              href="/shop?category=dairy-breakfast"
              className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
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
