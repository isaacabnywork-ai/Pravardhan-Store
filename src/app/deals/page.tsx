'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Copy,
  Check,
  Percent,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { OfferDealsShowcase } from '@/components/home/OfferDealsShowcase';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function DealsPage() {
  const { promotions, products } = useStore();
  const { applyCoupon, setIsCartDrawerOpen } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyAndApply = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    setIsCartDrawerOpen(true);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Filter products with good discounts
  const dealProducts = products.filter((p) =>
    p.variants.some((v) => v.mrp > v.price && ((v.mrp - v.price) / v.mrp) >= 0.15)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-10">
        {/* Deals Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-900 text-white p-6 sm:p-8 shadow-lg">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <Percent className="w-4 h-4" />
              <span>Direct Savings Club</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Daily Super Deals & Active Coupons
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              Copy any active coupon below with 1 click to automatically apply the discount to your cart.
            </p>
          </div>
        </div>

        {/* ================= INTERACTIVE OFFER CATEGORY SWITCHER SHOWCASE ================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Trending Festival Deals & Mega Discounts
              </h2>
              <p className="text-xs text-slate-500">
                Switch categories to explore curated gift packs, artisanal treats, and home decor
              </p>
            </div>
          </div>
          <OfferDealsShowcase />
        </div>

        {/* Coupons Grid */}
        <section>
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-700" />
            <span>Store Coupons & Promotional Codes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-2xl p-4 border border-dashed border-emerald-600/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {promo.discountType === 'FLAT'
                        ? `FLAT ₹${promo.discountValue} OFF`
                        : `${promo.discountValue}% OFF`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Min: {formatPrice(promo.minOrderValue)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{promo.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{promo.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900 tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => handleCopyAndApply(promo.code)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Apply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mega Discounted Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Items with 15%+ Instant Discount
              </h2>
              <p className="text-xs text-slate-500">
                Direct mandi price drops & manufacturer combos
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {dealProducts.map((product) => (
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
