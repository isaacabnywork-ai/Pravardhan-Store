import React from 'react';
import { StoreService } from '@/services/storeService';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { ProductSection } from '@/components/products/ProductSection';
import { Clock, ShieldCheck, Truck } from 'lucide-react';

export default async function HomePage() {
  const [categories, banners, allProducts] = await Promise.all([
    StoreService.getCategories(),
    StoreService.getBanners(),
    StoreService.getProducts(),
  ]);

  // Curated product sections for fast browsing
  const freshVegFruits = allProducts.filter(p => p.categoryId === 'cat-veg-fruits');
  const dairyEggs = allProducts.filter(p => p.categoryId === 'cat-dairy-bread');
  const attaDal = allProducts.filter(p => p.categoryId === 'cat-atta-dal' || p.categoryId === 'cat-oil-masala');
  const snacks = allProducts.filter(p => p.categoryId === 'cat-snacks-drinks');
  const household = allProducts.filter(p => p.categoryId === 'cat-household');
  const bestsellers = allProducts.filter(p => p.bestseller);

  return (
    <div className="w-full pb-6">
      {/* 1. Category Navigation */}
      <CategoryStrip categories={categories} />

      {/* 2. Promotional Banners */}
      <BannerCarousel banners={banners} />

      {/* 3. Delivery Information Strip */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 my-3">
        <div className="bg-gradient-to-r from-emerald-50/90 via-white to-green-50/90 border border-emerald-100 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  Scheduled Neighborhood Delivery
                </span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  FREE OVER ₹499
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select your preferred delivery slot at checkout: <b className="text-slate-800 font-bold">Today 4 PM – 6 PM</b> or <b className="text-slate-800 font-bold">Tomorrow Morning</b>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 bg-white/90 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              <span>Genuine Mandi Fresh</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/90 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-xs">
              <Clock className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              <span>Timely Slots</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Popular / Top Selling Products */}
      <ProductSection
        title="Popular Essentials"
        subtitle="Frequently purchased grocery items"
        badge="POPULAR"
        products={bestsellers}
        layout="scroll"
      />

      {/* 5. Fresh Vegetables & Fruits */}
      <ProductSection
        title="Fresh Vegetables & Fruits"
        subtitle="Handpicked daily from local Mandi"
        badge="FARM FRESH"
        seeAllLink="/categories/vegetables-fruits"
        products={freshVegFruits}
        layout="scroll"
      />

      {/* 6. Dairy, Bread & Eggs */}
      <ProductSection
        title="Dairy, Bread & Eggs"
        subtitle="Daily morning milk, butter, and farm eggs"
        seeAllLink="/categories/dairy-bread-eggs"
        products={dairyEggs}
        layout="scroll"
      />

      {/* 7. Atta, Rice, Dal & Cooking Oils (Grid layout for staples) */}
      <ProductSection
        title="Atta, Rice, Dal & Cooking Oils"
        subtitle="Monthly ration and kitchen staples"
        seeAllLink="/categories/atta-rice-dal"
        products={attaDal}
        layout="grid"
      />

      {/* 8. Snacks, Biscuits & Drinks */}
      <ProductSection
        title="Snacks & Cold Drinks"
        subtitle="Tea, noodles, biscuits and cool beverages"
        seeAllLink="/categories/snacks-drinks"
        products={snacks}
        layout="scroll"
      />

      {/* 9. Cleaning & Household */}
      <ProductSection
        title="Household Cleaning"
        subtitle="Detergents, dishwash gels, and floor care"
        seeAllLink="/categories/household-cleaning"
        products={household}
        layout="scroll"
      />
    </div>
  );
}
