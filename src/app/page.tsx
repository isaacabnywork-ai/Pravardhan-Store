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
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 my-2">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                  Normal Local Grocery Delivery
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-[#2563EB] px-1.5 py-0.5 rounded">
                  Scheduled
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Choose delivery slots: <b>Today 4 PM – 6 PM</b> or <b>Tomorrow Morning</b>. Free delivery over ₹499!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-[#0F172A]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Genuine Mandi Quality
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Scheduled Slots
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
