'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  Percent,
  Wheat,
  Apple,
  Milk,
  Cookie,
  Coffee,
  Sparkle,
  Smile,
  BadgePercent,
  TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { useStore } from '@/lib/context/StoreContext';

export default function HomePage() {
  const { products, categories, storeSettings, promotions } = useStore();

  const featuredAttaRice = products.filter(
    (p) => p.categoryId === 'cat-groceries'
  );
  const freshProduce = products.filter((p) => p.categoryId === 'cat-fruits-veg');
  const dairyProducts = products.filter((p) => p.categoryId === 'cat-dairy');
  const householdClean = products.filter(
    (p) => p.categoryId === 'cat-cleaning' || p.categoryId === 'cat-snacks'
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 space-y-8 sm:space-y-10">
        {/* Hero Promotional Banner Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Hero Card */}
          <div className="lg:col-span-2 relative rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 sm:p-8 overflow-hidden shadow-lg flex flex-col justify-between min-h-[260px] sm:min-h-[290px]">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-emerald-600 to-transparent" />

            <div className="relative z-10 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-3">
                <BadgePercent className="w-4 h-4" />
                <span>Harvest Season • Fresh Savings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-2">
                Pure Staples & Farm Fresh Groceries at Wholesale Rates
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-normal leading-relaxed mb-4">
                Aashirvaad Atta, Daawat Basmati, farm-picked tomatoes & fresh Amul dairy directly delivered from our local Sector 14 warehouse.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95"
              >
                <span>Shop All Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-700/50">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next slot: Today 12 PM - 2 PM</span>
              </div>
            </div>
          </div>

          {/* Right Promotional Offer Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Offer 1 */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                  Coupon: WELCOME100
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  Flat ₹100 OFF on First Order
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Applicable on orders above ₹499. Apply during checkout.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Code: WELCOME100</span>
                <Link href="/shop" className="hover:underline flex items-center gap-1">
                  Use Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Offer 2 */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                  Free Same-Day Delivery
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  ₹0 Delivery Fee Today!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Minimum order only ₹100. Delivered safely to your door.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Sector 14 & Model Town</span>
                <Link href="/shop" className="hover:underline flex items-center gap-1">
                  Order Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Shop by Category Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Shop by Category
              </h2>
              <p className="text-xs text-slate-500">
                Explore our full range of daily grocery and home staples
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center group"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 mb-2.5 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {cat.subcategories.length} subcategories
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 1: Daily Staples (Atta, Rice, Dal, Cooking Oil) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wide">
                <Wheat className="w-4 h-4" />
                <span>Pantry Essentials</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Flour, Rice, Dal & Cooking Oils
              </h2>
            </div>
            <Link
              href="/shop?category=groceries-staples"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              See All Staples <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredAttaRice.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Promotional Highlight Strip */}
        <section className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="bg-emerald-700/70 border border-emerald-500/50 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Physical Store Direct Advantage
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              We own our inventory. No 3rd-party seller markups.
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-normal">
              Every packet of Atta, Dal, and bottle of Cooking Oil is physically stored, temperature-controlled, and quality checked at our dedicated store hub before dispatched in your selected delivery slot.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <Link
              href="/shop"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Start Your Order
            </Link>
          </div>
        </section>

        {/* Section 2: Farm Fresh Fruits & Vegetables */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wide">
                <Apple className="w-4 h-4" />
                <span>Harvested at Dawn</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Farm-Fresh Fruits & Vegetables
              </h2>
            </div>
            <Link
              href="/shop?category=fruits-vegetables"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              See All Fresh Produce <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {freshProduce.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Section 3: Dairy & Breakfast Freshness */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase tracking-wide">
                <Milk className="w-4 h-4" />
                <span>Cold Chain Direct</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Dairy, Paneer & Daily Breakfast
              </h2>
            </div>
            <Link
              href="/shop?category=dairy-breakfast"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              See All Dairy <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {dairyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Section 4: Household & Snacks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs uppercase tracking-wide">
                <Cookie className="w-4 h-4" />
                <span>Home Essentials</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Snacks, Beverages & Laundry Care
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              View More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {householdClean.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
