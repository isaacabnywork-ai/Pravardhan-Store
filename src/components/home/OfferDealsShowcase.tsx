'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { useStore } from '@/lib/context/StoreContext';
import { Product } from '@/types';

interface OfferTab {
  id: string;
  badge: string;
  title: string;
  thumbnail: string;
  slugFilter: string[];
}

export function OfferDealsShowcase() {
  const { products } = useStore();
  const [activeTabId, setActiveTabId] = useState('dry-fruits');

  const offerTabs: OfferTab[] = [
    {
      id: 'dry-fruits',
      badge: 'Up to 65% OFF',
      title: 'Dry Fruit Gift Packs',
      thumbnail:
        'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=200&q=80',
      slugFilter: [
        'happilo-anand-dry-fruits-gift-pack',
        'farmley-classic-delight-date-bites',
        'orika-grill-and-chill-gift-box',
        'haldiram-royale-artisanal-kaju-katli-box',
      ],
    },
    {
      id: 'artisanal',
      badge: 'Starting at ₹329',
      title: 'Artisanal Gift Boxes',
      thumbnail:
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=200&q=80',
      slugFilter: [
        'haldiram-royale-artisanal-kaju-katli-box',
        'orika-grill-and-chill-gift-box',
        'happilo-anand-dry-fruits-gift-pack',
        'sunfeast-bourbon-dark-fantasy-biscuit',
      ],
    },
    {
      id: 'decor',
      badge: 'Up to 75% OFF',
      title: 'Decor & Showpieces',
      thumbnail:
        'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=200&q=80',
      slugFilter: [
        'pravdhan-royal-brass-peacock-diya-decor',
        'phool-luxury-aromatherapy-candle-gift-set',
        'surf-excel-matic-top-load',
        'tata-tea-gold-premium',
      ],
    },
    {
      id: 'fragrance',
      badge: 'Starting at ₹179',
      title: 'Fragrance Gift Sets',
      thumbnail:
        'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=200&q=80',
      slugFilter: [
        'phool-luxury-aromatherapy-candle-gift-set',
        'pravdhan-royal-brass-peacock-diya-decor',
        'happilo-anand-dry-fruits-gift-pack',
        'farmley-classic-delight-date-bites',
      ],
    },
  ];

  const currentTab = offerTabs.find((t) => t.id === activeTabId) || offerTabs[0];

  // Resolve products for current tab
  const tabProducts: Product[] = currentTab.slugFilter
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);

  // Fallback to top discounted products if filter didn't match enough
  const displayProducts =
    tabProducts.length >= 2
      ? tabProducts
      : products
          .filter((p) =>
            p.variants.some((v) => v.mrp > v.price && ((v.mrp - v.price) / v.mrp) >= 0.15)
          )
          .slice(0, 4);

  const getPillLabel = (idx: number, tabId: string) => {
    if (tabId === 'dry-fruits') {
      if (idx === 0) return 'See more like this';
      if (idx === 1) return 'All Dates';
      if (idx === 2) return 'See more like this';
      return 'All Sweets';
    }
    if (tabId === 'artisanal') {
      return idx === 0 ? 'Artisanal Boxes' : 'See more like this';
    }
    if (tabId === 'decor') {
      return idx === 0 ? 'All Decor' : 'See more like this';
    }
    return idx === 0 ? 'Fragrance Sets' : 'See more like this';
  };

  return (
    <section className="bg-[#FFFDF7] rounded-3xl p-3 sm:p-5 border border-amber-200/70 shadow-xs space-y-4">
      {/* ================= 1. OFFER CATEGORY SWITCHER TABS ================= */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none pt-2">
        {offerTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`relative flex-shrink-0 min-w-[135px] sm:min-w-[160px] pt-3 text-left transition-all duration-200 group cursor-pointer focus-visible:outline-none`}
            >
              {/* Top Badge: Emerald on Active, Dark Amber on Inactive */}
              <span
                className={`absolute top-0 inset-x-2 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider py-0.5 px-2 rounded-t-xl z-10 transition-colors shadow-2xs ${
                  isActive
                    ? 'bg-[#0F5132] text-white'
                    : 'bg-[#78350F] text-amber-100 group-hover:bg-[#854d0e]'
                }`}
              >
                {tab.badge}
              </span>

              {/* Tab Card Body */}
              <div
                className={`rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 transition-all ${
                  isActive
                    ? 'bg-white border-2 border-[#0F5132] shadow-sm ring-2 ring-[#0F5132]/10'
                    : 'bg-[#FEF9EE] border border-amber-200/80 hover:border-amber-300 hover:bg-[#FDF6E3]'
                }`}
              >
                <img
                  src={tab.thumbnail}
                  alt={tab.title}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover flex-shrink-0 border border-amber-200/60 shadow-2xs"
                />
                <span
                  className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 ${
                    isActive ? 'text-gray-900 font-extrabold' : 'text-gray-700'
                  }`}
                >
                  {tab.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= 2. PRODUCTS GRID FOR SELECTED TAB ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 animate-in fade-in duration-200">
        {displayProducts.map((product, idx) => (
          <ProductCard
            key={`${currentTab.id}-${product.id}`}
            product={product}
            highlightPrice={true}
            pillLabel={getPillLabel(idx, currentTab.id)}
            pillHref={`/shop?category=${product.categoryId}`}
          />
        ))}
      </div>

      {/* ================= 3. SEE ALL PRODUCTS BANNER WITH OVERLAPPING AVATARS ================= */}
      <Link
        href="/deals"
        className="w-full bg-white hover:bg-emerald-50/50 border border-amber-200/80 hover:border-emerald-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all group shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2 overflow-hidden">
            {displayProducts.slice(0, 3).map((item, idx) => (
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
  );
}
