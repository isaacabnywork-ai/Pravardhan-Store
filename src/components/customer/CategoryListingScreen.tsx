import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import {
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Check,
  X,
  Package,
} from 'lucide-react';

export const CategoryListingScreen: React.FC = () => {
  const {
    products,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    navigateToCategory,
    setCustomerPage,
  } = useStore();

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Active Category details
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  // Products belonging to active category
  const categoryProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((p) => p.category === activeCategory.name);
  }, [products, activeCategoryId, activeCategory]);

  // Available brands in this category
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    categoryProducts.forEach((p) => brandsSet.add(p.brand));
    return Array.from(brandsSet);
  }, [categoryProducts]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return categoryProducts
      .filter((prod) => {
        // Subcategory filter
        if (selectedSubCategory !== 'All' && prod.subCategory !== selectedSubCategory) {
          return false;
        }
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brand)) {
          return false;
        }
        // Price filter (lowest variant price <= priceRange)
        const minProdPrice = Math.min(...prod.variants.map((v) => v.price));
        if (minProdPrice > priceRange) {
          return false;
        }
        // Stock filter
        if (inStockOnly && !prod.variants.some((v) => v.stock > 0)) {
          return false;
        }
        // Discount filter
        const maxDiscount = Math.max(...prod.variants.map((v) => v.discountPercent));
        if (maxDiscount < minDiscount) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.variants[0].price - b.variants[0].price;
        }
        if (sortBy === 'price-high') {
          return b.variants[0].price - a.variants[0].price;
        }
        if (sortBy === 'discount') {
          const discA = Math.max(...a.variants.map((v) => v.discountPercent));
          const discB = Math.max(...b.variants.map((v) => v.discountPercent));
          return discB - discA;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        // default: popular / featured
        return b.ratingCount - a.ratingCount;
      });
  }, [categoryProducts, selectedSubCategory, selectedBrands, priceRange, inStockOnly, minDiscount, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 12);
      setIsLoadingMore(false);
    }, 300);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedSubCategory('All');
    setSelectedBrands([]);
    setPriceRange(1000);
    setInStockOnly(false);
    setMinDiscount(0);
    setSortBy('popular');
  };

  const activeFilterCount =
    (selectedBrands.length > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (priceRange < 1000 ? 1 : 0);

  // Subcategory thumbnail helper
  const getSubcategoryImage = (subName: string) => {
    const prod = categoryProducts.find((p) => p.subCategory === subName);
    return prod?.images[0] || activeCategory.image;
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button onClick={() => setCustomerPage('categories')} className="hover:text-[#0C831F]">
          Categories
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C] truncate max-w-[200px]">
          {activeCategory.name}
        </span>
        {selectedSubCategory !== 'All' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-[#0C831F]">{selectedSubCategory}</span>
          </>
        )}
      </nav>

      {/* Main Container: Two-Pane on Mobile, Sidebar + Grid on Desktop */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-soft overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[580px]">
          {/* ======================================================== */}
          {/* LEFT PANE: Narrow vertical subcategory rail (Blinkit style on Mobile) */}
          {/* ======================================================== */}
          <aside className="w-full lg:w-[260px] bg-gray-50/70 border-b lg:border-b-0 lg:border-r border-gray-200/80 shrink-0">
            {/* Desktop Category switcher header */}
            <div className="hidden lg:block p-4 border-b border-gray-200/80">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                Category
              </label>
              <select
                value={activeCategory.id}
                onChange={(e) => {
                  navigateToCategory(e.target.value);
                  setSelectedSubCategory('All');
                }}
                className="w-full text-xs font-bold text-[#1C1C1C] bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-[#0C831F]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Horizontal / Narrow Subcategory list */}
            {/* On Mobile: Top/Left rail */}
            <div className="lg:hidden flex overflow-x-auto no-scrollbar p-2 gap-2 border-b border-gray-200/80 bg-gray-50">
              <button
                onClick={() => setSelectedSubCategory('All')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedSubCategory === 'All'
                    ? 'bg-[#0C831F] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <span>All ({categoryProducts.length})</span>
              </button>

              {activeCategory.subCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub;
                const count = categoryProducts.filter((p) => p.subCategory === sub).length;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#0C831F] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span>{sub}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Subcategory Vertical Rail */}
            <div className="hidden lg:block p-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-2 block mb-2">
                Subcategories
              </span>
              <button
                onClick={() => setSelectedSubCategory('All')}
                className={`w-full text-left text-xs px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  selectedSubCategory === 'All'
                    ? 'bg-[#F0F8F1] font-bold text-[#0C831F]'
                    : 'text-gray-700 hover:bg-gray-100 font-medium'
                }`}
              >
                <span>All Products</span>
                <span className="text-[11px] text-gray-400">{categoryProducts.length}</span>
              </button>

              {activeCategory.subCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub;
                const count = categoryProducts.filter((p) => p.subCategory === sub).length;
                const img = getSubcategoryImage(sub);

                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-lg flex items-center gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-[#F0F8F1] font-bold text-[#0C831F]'
                        : 'text-gray-700 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <div className="w-7 h-7 rounded bg-white p-0.5 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={sub} className="w-full h-full object-contain" />
                    </div>
                    <span className="truncate flex-1">{sub}</span>
                    <span className="text-[10px] text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Filters section */}
            <div className="hidden lg:block p-4 border-t border-gray-200/80 space-y-5">
              {/* In stock toggle */}
              <label className="flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#0C831F] focus:ring-[#0C831F] w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Brands filter */}
              {availableBrands.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Brands
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-gray-700">
                    {availableBrands.map((b) => (
                      <label key={b} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => handleBrandToggle(b)}
                          className="rounded text-[#0C831F] focus:ring-[#0C831F] w-3.5 h-3.5"
                        />
                        <span className="truncate">{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT PANE: Product Grid + Filter Chips */}
          {/* ======================================================== */}
          <main className="flex-1 min-w-0 p-3 sm:p-5 flex flex-col">
            {/* Header row with Title, Counts & Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 mb-3">
              <div>
                <h1 className="text-base sm:text-lg font-black text-[#1C1C1C]">
                  {selectedSubCategory === 'All' ? activeCategory.name : selectedSubCategory}
                </h1>
                <p className="text-xs text-gray-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
                </p>
              </div>

              {/* Filter Chips Strip */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* In Stock chip toggle */}
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-colors select-none ${
                    inStockOnly
                      ? 'bg-[#F0F8F1] border-[#0C831F] text-[#0C831F]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  In Stock
                </button>

                {/* Offers Chip toggle */}
                <button
                  onClick={() => setMinDiscount(minDiscount > 0 ? 0 : 10)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-colors select-none ${
                    minDiscount > 0
                      ? 'bg-[#FFF9E6] border-[#F8B602] text-[#B45309]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Offers
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-7 px-2 pr-6 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-[#0C831F] cursor-pointer"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Discount</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                {/* Mobile Filter Sheet Trigger */}
                <button
                  onClick={() => setShowMobileFilterDrawer(true)}
                  className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#0C831F] text-white text-[10px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Product Grid (2 columns on mobile, 3-4 on desktop) */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-16">
                <EmptyState
                  icon={<Package className="w-8 h-8" />}
                  title="No products match filters"
                  description="Try clearing brand or price filters to see more grocery items."
                  actionText="Reset Filters"
                  onAction={handleResetFilters}
                />
              </div>
            )}

            {/* Load More Button / Indicator */}
            {hasMore && (
              <div className="pt-6 pb-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isLoadingMore}
                  onClick={handleLoadMore}
                >
                  Load More Products ({filteredProducts.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer / Bottom Sheet */}
      <Drawer
        isOpen={showMobileFilterDrawer}
        onClose={() => setShowMobileFilterDrawer(false)}
        title="Sort &amp; Filter"
        position="bottom"
      >
        <div className="space-y-5 pb-6">
          {/* Sort selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">Sort By</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'popular', label: 'Popularity' },
                { id: 'price-low', label: 'Price: Low to High' },
                { id: 'price-high', label: 'Price: High to Low' },
                { id: 'discount', label: 'Highest Discount' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id)}
                  className={`p-2.5 rounded-lg border text-left font-semibold ${
                    sortBy === s.id
                      ? 'bg-[#F0F8F1] border-[#0C831F] text-[#0C831F]'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* In stock */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center justify-between text-xs font-bold text-gray-700 py-1 cursor-pointer">
              <span>In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#0C831F] focus:ring-[#0C831F]"
              />
            </label>
          </div>

          {/* Brands */}
          {availableBrands.length > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="text-xs font-bold uppercase text-gray-500">Brands</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {availableBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer p-1.5 bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => handleBrandToggle(b)}
                      className="rounded text-[#0C831F] focus:ring-[#0C831F] w-3.5 h-3.5"
                    />
                    <span className="truncate font-medium">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                handleResetFilters();
                setShowMobileFilterDrawer(false);
              }}
            >
              Reset All
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowMobileFilterDrawer(false)}
            >
              Apply ({filteredProducts.length} items)
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
