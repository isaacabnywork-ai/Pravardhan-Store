import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/customer/ProductCard';
import { ChevronRight, ChevronLeft, ArrowRight, Tag } from 'lucide-react';

interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  actionText: string;
  image: string;
  categoryId: string;
  bgColor: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'banner-1',
    tag: 'FARM FRESH',
    title: 'Seasonal Mangoes & Fresh Produce',
    actionText: 'Shop Produce',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    categoryId: 'cat-fruits-veg',
    bgColor: 'bg-[#1E3A1E]',
  },
  {
    id: 'banner-2',
    tag: 'MORNING ESSENTIALS',
    title: 'Daily Pure Milk, Paneer & Fresh Breads',
    actionText: 'Explore Dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    categoryId: 'cat-dairy',
    bgColor: 'bg-[#1A365D]',
  },
  {
    id: 'banner-3',
    tag: 'KITCHEN STAPLES',
    title: 'Chakki Fresh Atta, Rice & Cold-Pressed Oils',
    actionText: 'Stock Kitchen',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    categoryId: 'cat-groceries',
    bgColor: 'bg-[#3E2723]',
  },
  {
    id: 'banner-4',
    tag: 'SNACKS & DRINKS',
    title: 'Crispy Namkeens, Biscuits & Beverages',
    actionText: 'Order Snacks',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    categoryId: 'cat-snacks',
    bgColor: 'bg-[#4A2810]',
  },
];

export const HomeScreen: React.FC = () => {
  const { products, categories, navigateToCategory, setCustomerPage, promotions, applyCoupon } = useStore();
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto rotate banner every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter product groups
  const bestsellers = products.filter((p) => p.featured || p.rating >= 4.8).slice(0, 8);
  const freshProduce = products.filter((p) => p.category === 'Fruits & Vegetables').slice(0, 8);
  const dairyItems = products.filter((p) => p.category === 'Dairy & Breakfast').slice(0, 8);
  const staples = products.filter((p) => p.category === 'Groceries & Staples').slice(0, 8);
  const snacks = products.filter((p) => p.category === 'Snacks & Munchies' || p.category === 'Beverages & Drinks').slice(0, 8);
  const under99 = products.filter((p) => p.variants.some((v) => v.price <= 99)).slice(0, 8);

  // Category short labels
  const getCategoryShortName = (name: string) => {
    if (name.includes('Groceries')) return 'Atta & Dals';
    if (name.includes('Fruits')) return 'Vegetables & Fruits';
    if (name.includes('Dairy')) return 'Dairy & Milk';
    if (name.includes('Snacks')) return 'Munchies';
    if (name.includes('Beverages')) return 'Tea & Drinks';
    if (name.includes('Household')) return 'Cleaning';
    if (name.includes('Personal')) return 'Personal Care';
    if (name.includes('Instant')) return 'Instant Food';
    return name;
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. Sleek Photographic Promotional Banner */}
      <section className="relative rounded-2xl overflow-hidden shadow-soft h-[150px] sm:h-[190px] md:h-[220px]">
        {PROMO_BANNERS.map((banner, idx) => {
          const isActive = idx === currentBanner;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-between ${banner.bgColor} ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Text side */}
              <div className="p-4 sm:p-7 md:p-8 max-w-[65%] sm:max-w-md z-10 text-white">
                <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white mb-1.5 sm:mb-2">
                  {banner.tag}
                </span>
                <h2 className="text-sm sm:text-xl md:text-2xl font-black leading-tight sm:leading-tight line-clamp-2">
                  {banner.title}
                </h2>
                <button
                  onClick={() => navigateToCategory(banner.categoryId)}
                  className="mt-2.5 sm:mt-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white text-[#1C1C1C] hover:bg-gray-100 font-bold text-[11px] sm:text-xs transition-all active:scale-95 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{banner.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo side */}
              <div className="w-[45%] sm:w-[48%] h-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
                <div className={`absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-${banner.bgColor} to-transparent pointer-events-none`} />
              </div>
            </div>
          );
        })}

        {/* Carousel indicator dots */}
        <div className="absolute bottom-2.5 left-4 sm:left-7 z-20 flex gap-1.5">
          {PROMO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentBanner ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Blinkit-Style Category Grid (4 cols mobile, 8 cols desktop) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
            Explore Categories
          </h2>
          <button
            onClick={() => setCustomerPage('categories')}
            className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateToCategory(cat.id)}
              className="bg-white rounded-xl border border-gray-200/80 hover:border-gray-300 hover:shadow-card p-2 sm:p-2.5 flex flex-col items-center text-center transition-all group select-none"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-50 flex items-center justify-center p-1 mb-1.5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#1C1C1C] group-hover:text-[#0C831F] leading-tight line-clamp-2">
                {getCategoryShortName(cat.name)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Offer Strip for discounts */}
      {promotions.length > 0 && (
        <section className="bg-[#FFF9E6] border border-[#FDE68A] rounded-xl p-3 sm:px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F8B602] text-[#1C1C1C] flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1C1C1C] truncate">
                Save with code: <span className="font-mono text-[#0C831F] font-black">{promotions[0].code}</span>
              </p>
              <p className="text-[11px] text-[#78350F] truncate">
                {promotions[0].title} • Min order ₹{promotions[0].minOrderValue}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCustomerPage('offers')}
            className="shrink-0 text-xs font-bold text-[#0C831F] bg-white border border-[#CBE8CE] hover:bg-[#F0F8F1] px-2.5 py-1.5 rounded-lg transition-colors"
          >
            All Offers
          </button>
        </section>
      )}

      {/* 4. Horizontal Product Carousels */}
      {/* 4a: Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
                Trending &amp; Bestsellers
              </h2>
              <span className="text-[11px] font-semibold text-gray-500">
                Most ordered in your area
              </span>
            </div>
            <button
              onClick={() => {
                navigateToCategory('');
                setCustomerPage('categories');
              }}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {bestsellers.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4b: Fresh Fruits & Vegetables */}
      {freshProduce.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
                Fresh Fruits &amp; Vegetables
              </h2>
              <span className="text-[11px] font-semibold text-gray-500">
                Direct from mandi • 15 mins delivery
              </span>
            </div>
            <button
              onClick={() => navigateToCategory('cat-fruits-veg')}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {freshProduce.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4c: Dairy, Bread & Breakfast */}
      {dairyItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
                Dairy, Bread &amp; Eggs
              </h2>
              <span className="text-[11px] font-semibold text-gray-500">
                Fresh morning milk, curd &amp; bakery
              </span>
            </div>
            <button
              onClick={() => navigateToCategory('cat-dairy')}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {dairyItems.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4d: Atta, Rice & Kitchen Staples */}
      {staples.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
                Atta, Rice &amp; Cooking Essentials
              </h2>
              <span className="text-[11px] font-semibold text-gray-500">
                Daily kitchen staples at mandi prices
              </span>
            </div>
            <button
              onClick={() => navigateToCategory('cat-groceries')}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {staples.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4e: Budget Buys Under ₹99 */}
      {under99.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
                Budget Buys Under ₹99
              </h2>
              <span className="text-[11px] font-semibold text-gray-500">
                Pocket-friendly daily essentials
              </span>
            </div>
            <button
              onClick={() => {
                navigateToCategory('');
                setCustomerPage('categories');
              }}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {under99.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4f: Snacks & Munchies */}
      {snacks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
                Snacks, Chips &amp; Drinks
              </h2>
              <span className="text-[11px] font-semibold text-gray-500">
                Evening munchies delivered cold &amp; fresh
              </span>
            </div>
            <button
              onClick={() => navigateToCategory('cat-snacks')}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {snacks.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
