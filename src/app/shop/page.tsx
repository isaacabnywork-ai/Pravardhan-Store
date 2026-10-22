'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Share2,
  ChevronDown,
  ChevronRight,
  Filter,
  Heart,
  Plus,
  Minus,
  Clock,
  X,
  Check,
  CheckCircle2,
  MapPin,
  ArrowUpDown,
  LayoutGrid,
} from 'lucide-react';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ExploreCategoriesGrid } from '@/components/categories/ExploreCategoriesGrid';
import { CATEGORY_DIRECTORY_SECTIONS } from '@/lib/data/categories-directory';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories, storeSettings } = useStore();
  const { items, addToCart, updateQuantity } = useCart();

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('sub');
  const queryParam = searchParams.get('q');

  // Category & Subcategory selection state (empty by default on whole categories page)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    categoryParam || ''
  );
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string>(
    subcategoryParam || 'all'
  );

  // Search state on the whole category directory
  const [wholeCategorySearch, setWholeCategorySearch] = useState<string>('');

  // Filter & Search states inside individual category view
  const [searchQuery, setSearchQuery] = useState<string>(queryParam || '');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'discount' | 'rating'>('popular');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);

  // Modals state
  const [isCategorySwitcherOpen, setIsCategorySwitcherOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<string>(
    storeSettings.serviceArea || 'Sector 14, Model Town, Gurugram'
  );

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Synchronize when URL params change
  React.useEffect(() => {
    setSelectedCategorySlug(categoryParam || '');
    setSelectedSubcategorySlug(subcategoryParam || 'all');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [categoryParam, subcategoryParam, queryParam]);

  // Determine whether to display an individual category page (with subcategories)
  // or the whole category exploration page
  const isIndividualCategory = Boolean(
    selectedCategorySlug && selectedCategorySlug !== 'all'
  );

  // Active Category Object when viewing an individual category
  const activeCategory = useMemo(() => {
    if (!selectedCategorySlug) return null;
    return (
      categories.find((c) => c.slug === selectedCategorySlug) ||
      categories[0] ||
      null
    );
  }, [categories, selectedCategorySlug]);

  // Subcategories rail items for the active category (with "All" at top)
  const railSubcategories = useMemo(() => {
    if (!activeCategory) return [];

    const list: { id: string; name: string; slug: string; image: string }[] = [
      {
        id: 'all',
        name: 'All',
        slug: 'all',
        image:
          activeCategory.image ||
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80',
      },
    ];

    if (activeCategory.subcategories && activeCategory.subcategories.length > 0) {
      activeCategory.subcategories.forEach((s) => {
        list.push({
          id: s.id,
          name: s.name,
          slug: s.slug,
          image:
            s.image ||
            activeCategory.image ||
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
        });
      });
    }

    return list;
  }, [activeCategory]);

  // Filter products for the current category and subcategory
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];

    return products.filter((p) => {
      // Must match active category
      if (p.categoryId !== activeCategory.id) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategorySlug !== 'all') {
        const subObj = activeCategory.subcategories?.find(
          (s) => s.slug === selectedSubcategorySlug
        );
        if (subObj && p.subcategoryId !== subObj.id) {
          return false;
        }
      }

      // Search query within category
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) return false;
      }

      // Organic filter
      if (organicOnly && !p.isOrganic) {
        return false;
      }

      // In stock only
      if (inStockOnly) {
        const hasStock = p.variants.some((v) => v.stock > 0);
        if (!hasStock) return false;
      }

      // Price filter
      const price = p.variants[0]?.price ?? 0;
      if (price > priceMax) {
        return false;
      }

      return true;
    });
  }, [
    products,
    activeCategory,
    selectedSubcategorySlug,
    searchQuery,
    organicOnly,
    inStockOnly,
    priceMax,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => {
        const discA = a.variants[0]
          ? (a.variants[0].mrp - a.variants[0].price) / a.variants[0].mrp
          : 0;
        const discB = b.variants[0]
          ? (b.variants[0].mrp - b.variants[0].price) / b.variants[0].mrp
          : 0;
        return discB - discA;
      });
    } else {
      // 'popular'
      list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Filtered directory sections when user searches on the Whole Category page
  const filteredDirectorySections = useMemo(() => {
    if (!wholeCategorySearch.trim()) return CATEGORY_DIRECTORY_SECTIONS;
    const q = wholeCategorySearch.toLowerCase().trim();

    return CATEGORY_DIRECTORY_SECTIONS.map((section) => {
      const matchingItems = section.items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.categorySlug.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q)
      );
      return {
        ...section,
        items: matchingItems,
      };
    }).filter((section) => section.items.length > 0);
  }, [wholeCategorySearch]);

  // Filtered products when user searches globally on the Whole Category page
  const globalSearchProducts = useMemo(() => {
    if (!wholeCategorySearch.trim()) return [];
    const q = wholeCategorySearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, wholeCategorySearch]);

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast('Removed from wishlist');
      } else {
        next.add(productId);
        showToast('Saved to wishlist');
      }
      return next;
    });
  };

  // Share category
  const handleShare = () => {
    if (typeof window !== 'undefined' && activeCategory) {
      if (navigator.share) {
        navigator
          .share({
            title: `${activeCategory.name} - Pravdhan Store`,
            text: `Order fresh ${activeCategory.name} with 12-minute express delivery!`,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard?.writeText(window.location.href);
        showToast('Category link copied to clipboard!');
      }
    }
  };

  // Back navigation:
  // - If inside an individual category: returns to Whole Category Page (`/shop`)
  // - If on the Whole Category Page: returns to Home (`/`)
  const handleBackToWholeCategories = () => {
    setSelectedCategorySlug('');
    setSelectedSubcategorySlug('all');
    router.push('/shop');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Banner titles based on category
  const bannerContent = useMemo(() => {
    if (!activeCategory) {
      return { title: '', subtitle: '', image: '' };
    }
    if (activeCategory.slug === 'fruits-vegetables') {
      return {
        title: 'Fresh seasonal fruits',
        subtitle: 'Nutritional goodness in every bite',
        image:
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
      };
    }
    if (activeCategory.slug === 'groceries-staples') {
      return {
        title: 'Daily kitchen essentials',
        subtitle: '100% sort-graded flours, rice & pulses',
        image:
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
      };
    }
    if (activeCategory.slug === 'dairy-breakfast') {
      return {
        title: 'Morning fresh dairy',
        subtitle: 'Farm paneer, milk & fresh butter',
        image:
          'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
      };
    }
    if (activeCategory.slug === 'snacks-munchies') {
      return {
        title: 'Craving something crispy?',
        subtitle: 'Instant snacks, biscuits & dry fruits',
        image:
          'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80',
      };
    }
    return {
      title: activeCategory.name,
      subtitle: activeCategory.description || 'Delivered express to your doorstep in 12 mins',
      image: activeCategory.image,
    };
  }, [activeCategory]);

  // =======================================================================================
  // RENDER VIEW A: INDIVIDUAL CATEGORY PAGE (WITH SUBCATEGORIES RAIL & 2-COLUMN GRID)
  // =======================================================================================
  if (isIndividualCategory && activeCategory) {
    return (
      <div className="h-screen flex flex-col bg-white overflow-hidden text-gray-900 select-none">
        {/* ================= TOP APP BAR (NO GLOBAL NAVBAR) ================= */}
        <header className="bg-white border-b border-gray-150 shrink-0 z-30">
          {/* Row 1: Back to All Categories + Category Name Dropdown + Location + Search & Share */}
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            {/* Left: Back button returns to Whole Categories Page */}
            <button
              type="button"
              onClick={handleBackToWholeCategories}
              aria-label="Back to all categories"
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Center: Category Title & Location */}
            <div className="flex-1 min-w-0 pr-1">
              <button
                type="button"
                onClick={() => setIsCategorySwitcherOpen(true)}
                className="flex items-center gap-1 text-left group cursor-pointer focus:outline-none"
              >
                <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight truncate leading-tight group-hover:text-emerald-800 transition-colors">
                  {activeCategory.name}
                </h1>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-emerald-800 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-emerald-800 mt-0.5 truncate text-left focus:outline-none cursor-pointer"
              >
                <span className="text-emerald-800 font-semibold shrink-0">Delivering to :</span>
                <span className="truncate">{selectedZone}</span>
                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
              </button>
            </div>

            {/* Right: Search & Share Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Search within category"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isSearchOpen ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share category"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Collapsible Search Input */}
          {isSearchOpen && (
            <div className="px-3 pb-2 pt-0.5 border-t border-gray-100 animate-in fade-in slide-in-from-top-1">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${activeCategory.name}...`}
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Row 2: Horizontally Scrollable Filter Pills */}
          <div className="px-3 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 bg-[#FCFDFB]">
            {/* Filters Pill */}
            <button
              type="button"
              onClick={() => setInStockOnly((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                inStockOnly
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Filters</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Sort Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  sortBy !== 'popular'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Sort Popover */}
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute left-0 top-8 z-50 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 font-bold text-gray-400 text-[10px] uppercase">
                      Sort by
                    </div>
                    {[
                      { label: 'Popular / Featured', value: 'popular' },
                      { label: 'Price: Low to High', value: 'price-low' },
                      { label: 'Price: High to Low', value: 'price-high' },
                      { label: 'Customer Rating', value: 'rating' },
                      { label: 'Discount %', value: 'discount' },
                    ].map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setSortBy(s.value as any);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-emerald-50 ${
                          sortBy === s.value ? 'font-bold text-emerald-800 bg-emerald-50/60' : ''
                        }`}
                      >
                        <span>{s.label}</span>
                        {sortBy === s.value && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Type / Organic Pill */}
            <button
              type="button"
              onClick={() => setOrganicOnly((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                organicOnly
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>Type: {organicOnly ? 'Organic' : 'All'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Price Pill */}
            <button
              type="button"
              onClick={() => {
                setPriceMax((prev) => (prev === 1000 ? 100 : prev === 100 ? 200 : 1000));
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                priceMax < 1000
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>Price: {priceMax < 1000 ? `Under ₹${priceMax}` : 'All'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Country Of Origin Pill */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border border-gray-200 bg-white text-gray-700">
              <span>Country: India</span>
            </span>
          </div>
        </header>

        {/* ================= MAIN SPLIT VIEW (LEFT SUBCATEGORY RAIL + RIGHT PRODUCT FEED) ================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT VERTICAL SUBCATEGORIES RAIL */}
          <aside
            aria-label="Subcategories"
            className="w-20 sm:w-22 shrink-0 bg-white border-r border-gray-150 overflow-y-auto no-scrollbar py-2 space-y-3.5 select-none"
          >
            {railSubcategories.map((sub) => {
              const isActive = selectedSubcategorySlug === sub.slug;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubcategorySlug(sub.slug);
                    router.push(
                      sub.slug === 'all'
                        ? `/shop?category=${activeCategory.slug}`
                        : `/shop?category=${activeCategory.slug}&sub=${sub.slug}`
                    );
                  }}
                  className={`relative w-full flex flex-col items-center group cursor-pointer px-1 transition-all ${
                    isActive ? 'text-[#0F5132]' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {/* Active Indicator Bar on right edge (Matching Screenshot) */}
                  {isActive && (
                    <span className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-[#0F5132] rounded-l-full shadow-xs" />
                  )}

                  {/* Subcategory Circular / Squircle Thumbnail Container */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full sm:rounded-2xl p-0.5 flex items-center justify-center relative overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50/80 ring-2 ring-[#0F5132] shadow-xs'
                        : 'bg-gray-50 border border-gray-150 group-hover:border-emerald-300'
                    }`}
                  >
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-full object-cover rounded-full sm:rounded-xl group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Subcategory Label below Image */}
                  <span
                    className={`text-[10px] sm:text-[11px] text-center leading-tight mt-1 px-0.5 line-clamp-2 transition-colors ${
                      isActive ? 'font-bold text-[#0F5132]' : 'font-medium text-gray-700'
                    }`}
                  >
                    {sub.name}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* RIGHT PRODUCT FEED AREA */}
          <main className="flex-1 min-w-0 bg-[#F4F8F1] overflow-y-auto p-2 sm:p-3 space-y-3.5 pb-20 md:pb-6">
            {/* Fresh Promotional Category Banner */}
            <div className="bg-gradient-to-r from-[#E7F6E7] via-[#EFF8EB] to-[#F7FAF4] rounded-2xl p-3 sm:p-4 border border-emerald-100 flex items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5 min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                  {bannerContent.title}
                </h2>
                <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                  {bannerContent.subtitle}
                </p>
              </div>
              {bannerContent.image && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden shadow-2xs">
                  <img src={bannerContent.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Empty State */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2 my-4">
                <p className="text-sm font-bold text-gray-800">No products found</p>
                <p className="text-xs text-gray-500">
                  Try switching the subcategory from the left rail or clear filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubcategorySlug('all');
                    setSearchQuery('');
                    setOrganicOnly(false);
                    setInStockOnly(false);
                    setPriceMax(1000);
                  }}
                  className="mt-2 px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                {/* 2-Column Product Grid (Responsive up to 4 cols on desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {sortedProducts.map((product) => {
                    const variant = product.variants[0];
                    const cartItem = items.find((it) => it.variantId === variant?.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    const isWishlisted = wishlist.has(product.id);
                    const isLowStock = variant?.stock > 0 && variant?.stock <= 5;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all relative"
                      >
                        {/* Product Image Container */}
                        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                          <Link
                            href={`/product/${product.slug}`}
                            className="block w-full h-full focus:outline-none"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </Link>

                          {/* Heart / Wishlist Icon on Top-Right */}
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(product.id)}
                            aria-label="Wishlist"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs shadow-2xs flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors z-10 cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isWishlisted ? 'text-red-500 fill-red-500' : ''
                              }`}
                            />
                          </button>

                          {/* Carousel Dots on Bottom-Left */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          </div>
                        </div>

                        {/* Weight / Pack Pill + ADD Button Strip */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-gray-100 bg-white">
                          <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[80px]">
                            {variant?.unit || variant?.title || '1 Pack'}
                          </span>

                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => addToCart(product, variant, 1)}
                              className="px-3.5 py-1 rounded-xl border border-emerald-700 hover:bg-emerald-700 text-emerald-800 hover:text-white font-extrabold text-xs uppercase tracking-wide transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              ADD
                            </button>
                          ) : (
                            <div className="flex items-center bg-emerald-700 text-white rounded-xl px-2 py-0.5 gap-2 text-xs font-extrabold shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(variant.id, qty - 1)}
                                aria-label="Decrease quantity"
                                className="p-0.5 hover:scale-110 active:scale-95 transition-transform"
                              >
                                <Minus className="w-3 h-3 stroke-[3]" />
                              </button>
                              <span className="min-w-[12px] text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => addToCart(product, variant, 1)}
                                aria-label="Increase quantity"
                                className="p-0.5 hover:scale-110 active:scale-95 transition-transform"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Price, Title, Delivery Badge */}
                        <div className="px-2.5 pb-2.5 pt-0.5 space-y-1">
                          {/* Price Row */}
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-base font-black text-gray-900">
                              {formatPrice(variant?.price ?? 0)}
                            </span>
                            {variant?.mrp && variant.mrp > variant.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(variant.mrp)}
                              </span>
                            )}
                          </div>

                          {/* Product Title */}
                          <Link
                            href={`/product/${product.slug}`}
                            className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-tight hover:text-emerald-700 transition-colors"
                          >
                            {product.name}
                          </Link>

                          {/* Delivery Time & Low Stock Badge */}
                          <div className="flex items-center gap-2 pt-0.5 text-[11px] text-gray-500 font-medium">
                            <span className="flex items-center gap-0.5 text-gray-600">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>8 mins</span>
                            </span>

                            {isLowStock && (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded-md">
                                {variant.stock} left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* "See all products ▶" pill button (Matching Screenshot) */}
                <button
                  type="button"
                  onClick={() => setSelectedSubcategorySlug('all')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-emerald-50/40 rounded-full border border-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs my-3 transition-colors cursor-pointer"
                >
                  <span>See all products</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-900" />
                </button>
              </>
            )}
          </main>
        </div>

        {/* ================= CATEGORY SWITCHER DRAWER (Tapped from Category Title ▾) ================= */}
        {isCategorySwitcherOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsCategorySwitcherOpen(false)}
          >
            <div
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-200 space-y-3 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                <h3 className="text-base font-bold text-gray-900">Switch Category</h3>
                <button
                  type="button"
                  onClick={() => setIsCategorySwitcherOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View All Categories Directory Option */}
              <button
                type="button"
                onClick={() => {
                  setIsCategorySwitcherOpen(false);
                  handleBackToWholeCategories();
                }}
                className="w-full p-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 text-emerald-950 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-800" />
                  <span>Browse Whole Categories Directory</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-800" />
              </button>

              <div className="grid grid-cols-2 gap-2.5 py-1">
                {categories.map((cat) => {
                  const isCurrent = cat.slug === activeCategory.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategorySlug(cat.slug);
                        setSelectedSubcategorySlug('all');
                        setIsCategorySwitcherOpen(false);
                        router.push(`/shop?category=${cat.slug}`);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-semibold leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= LOCATION PICKER MODAL (Tapped from Delivering to : ... ▾) ================= */}
        {isLocationModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsLocationModalOpen(false)}
          >
            <div
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-200 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-gray-900">Select Delivery Location</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                ⚡ Instant 12–15 minute express delivery available in Gurugram zones:
              </p>

              <div className="space-y-2 py-1">
                {[
                  { zone: 'Sector 14, Model Town, Gurugram', time: '12 mins' },
                  { zone: 'Old DLF Colony', time: '14 mins' },
                  { zone: 'Sector 15 Part 1', time: '15 mins' },
                  { zone: 'Civil Lines · Prem Nagar', time: '15 mins' },
                  { zone: 'DLF Phase 1 & 2', time: '18 mins' },
                ].map((loc) => {
                  const isSelected = selectedZone.includes(loc.zone.split(',')[0]);
                  return (
                    <button
                      key={loc.zone}
                      type="button"
                      onClick={() => {
                        setSelectedZone(loc.zone);
                        setIsLocationModalOpen(false);
                        showToast(`Delivering to ${loc.zone}`);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{loc.zone}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          ⚡ Arrives in {loc.time}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FLOATING SUCCESS TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-16 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 pointer-events-auto border border-gray-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <CartDrawer />
        <MobileBottomNav />
      </div>
    );
  }

  // =======================================================================================
  // RENDER VIEW B: WHOLE CATEGORIES PAGE (ALL CATEGORIES DIRECTORY - NO SUBCATEGORIES RAIL)
  // =======================================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900 select-none pb-20 md:pb-6">
      {/* ================= TOP APP BAR FOR WHOLE CATEGORY PAGE ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-2xs">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Left: Back to Home + Brand Title */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackToHome}
              aria-label="Back to Home"
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight flex items-center gap-1.5">
                <span>All Categories</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                Pravdhan Store · 7 Departments & 40+ Aisles
              </p>
            </div>
          </div>

          {/* Right: Delivery Location Pill */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-950 px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-200/80 transition-colors cursor-pointer text-left text-xs font-semibold shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[190px]">{selectedZone}</span>
            <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" />
          </button>
        </div>

        {/* Search Bar for Whole Categories Page */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-2.5 pt-0.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={wholeCategorySearch}
              onChange={(e) => setWholeCategorySearch(e.target.value)}
              placeholder="Search in all categories & aisles (e.g. Atta, Milk, Fruits, Namkeen...)"
              className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-2xl pl-10 pr-9 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-2xs"
            />
            {wholeCategorySearch && (
              <button
                type="button"
                onClick={() => setWholeCategorySearch('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-5">
        {/* If user searched on whole categories page */}
        {wholeCategorySearch.trim() ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Search Results for &quot;{wholeCategorySearch}&quot;
              </h2>
              <button
                type="button"
                onClick={() => setWholeCategorySearch('')}
                className="text-xs text-emerald-800 font-bold hover:underline"
              >
                Clear Search
              </button>
            </div>

            {/* Matching Category Aisles */}
            {filteredDirectorySections.length > 0 && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Matching Aisles & Categories
                </h3>
                <ExploreCategoriesGrid sections={filteredDirectorySections} />
              </div>
            )}

            {/* Matching Products */}
            {globalSearchProducts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Matching Products ({globalSearchProducts.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {globalSearchProducts.slice(0, 10).map((product) => {
                    const variant = product.variants[0];
                    const cartItem = items.find((it) => it.variantId === variant?.id);
                    const qty = cartItem ? cartItem.quantity : 0;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-gray-150 p-2 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <Link href={`/product/${product.slug}`} className="block aspect-square w-full rounded-xl overflow-hidden bg-gray-50">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </Link>
                        <div className="pt-2 space-y-1">
                          <span className="text-[10px] text-gray-500 font-medium">
                            {variant?.unit || '1 Pack'}
                          </span>
                          <Link
                            href={`/product/${product.slug}`}
                            className="block text-xs font-bold text-gray-900 line-clamp-2 leading-tight hover:text-emerald-700"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-black text-gray-900">
                              {formatPrice(variant?.price ?? 0)}
                            </span>
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => addToCart(product, variant, 1)}
                                className="px-2.5 py-0.5 rounded-lg border border-emerald-700 text-emerald-800 text-[11px] font-bold uppercase hover:bg-emerald-700 hover:text-white transition-colors"
                              >
                                ADD
                              </button>
                            ) : (
                              <div className="flex items-center bg-emerald-700 text-white rounded-lg px-1.5 py-0.5 gap-1.5 text-[11px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(variant.id, qty - 1)}
                                >
                                  -
                                </button>
                                <span>{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(product, variant, 1)}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredDirectorySections.length === 0 && globalSearchProducts.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
                <p className="text-sm font-bold text-gray-800">No categories or products found</p>
                <p className="text-xs text-gray-500">
                  Try searching for another keyword like &quot;Vegetables&quot;, &quot;Dairy&quot;, &quot;Atta&quot;, or &quot;Snacks&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => setWholeCategorySearch('')}
                  className="mt-2 px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Show All Categories
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/90 shadow-2xs">
            <ExploreCategoriesGrid sections={CATEGORY_DIRECTORY_SECTIONS} />
          </div>
        )}
      </main>

      {/* ================= LOCATION PICKER MODAL (WHOLE CATEGORY PAGE) ================= */}
      {isLocationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-200 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-gray-900">Select Delivery Location</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              ⚡ Instant 12–15 minute express delivery available in Gurugram zones:
            </p>

            <div className="space-y-2 py-1">
              {[
                { zone: 'Sector 14, Model Town, Gurugram', time: '12 mins' },
                { zone: 'Old DLF Colony', time: '14 mins' },
                { zone: 'Sector 15 Part 1', time: '15 mins' },
                { zone: 'Civil Lines · Prem Nagar', time: '15 mins' },
                { zone: 'DLF Phase 1 & 2', time: '18 mins' },
              ].map((loc) => {
                const isSelected = selectedZone.includes(loc.zone.split(',')[0]);
                return (
                  <button
                    key={loc.zone}
                    type="button"
                    onClick={() => {
                      setSelectedZone(loc.zone);
                      setIsLocationModalOpen(false);
                      showToast(`Delivering to ${loc.zone}`);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{loc.zone}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        ⚡ Arrives in {loc.time}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 pointer-events-auto border border-gray-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-xs text-gray-500">
          Loading store catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
