import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Search,
  MapPin,
  ChevronDown,
  ShoppingBag,
  User,
  X,
  Clock,
} from 'lucide-react';
import { AuthModal } from '@/components/customer/AuthModal';

const SEARCH_PLACEHOLDERS = [
  'Search "milk"',
  'Search "atta"',
  'Search "fresh mangoes"',
  'Search "fortune oil"',
  'Search "bread & eggs"',
  'Search "tea & coffee"',
  'Search "biscuits & chips"',
];

export const Header: React.FC = () => {
  const {
    customerPage,
    setCustomerPage,
    categories,
    activeCategoryId,
    navigateToCategory,
    selectedAddress,
    setShowLocationModal,
    cartCount,
    cartSubtotal,
    setShowCartDrawer,
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isAuthenticated,
  } = useStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Rotating placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      setIsSearchFocused(false);
      setCustomerPage('search');
    }
  };

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
    setIsSearchFocused(false);
    setCustomerPage('search');
  };

  const popularSearches = [
    'Atta',
    'Milk',
    'Oil',
    'Mangoes',
    'Tomatoes',
    'Tea',
    'Butter',
    'Biscuits',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-soft">
      {/* ======================================================== */}
      {/* 1. MOBILE HEADER (< md)                                   */}
      {/* Blinkit / Zepto exact mobile header architecture        */}
      {/* ======================================================== */}
      <div className="md:hidden px-3.5 pt-2 pb-2.5">
        {/* Top Row: Delivery Time + Address on Left, Profile/Login on Right */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Delivery Time & Address Picker */}
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex flex-col text-left min-w-0 select-none group"
          >
            <span className="text-sm font-black text-[#1C1C1C] tracking-tight leading-none">
              Delivery in 15 minutes
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-1">
              <span className="truncate max-w-[230px] sm:max-w-[280px]">
                {selectedAddress
                  ? `${selectedAddress.houseNo ? `${selectedAddress.houseNo}, ` : ''}${selectedAddress.area || selectedAddress.city}`
                  : 'Select delivery location'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </div>
          </button>

          {/* Right: User / Profile Button */}
          <div className="shrink-0 flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => setCustomerPage('account')}
                aria-label="My Account"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#1C1C1C] flex items-center justify-center transition-colors"
              >
                <User className="w-4 h-4 stroke-[2.2]" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                aria-label="Login"
              >
                <User className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Full-Width Search Input */}
        <div className="mt-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              value={searchQuery}
              onFocus={() => {
                if (customerPage !== 'search') setCustomerPage('search');
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 text-xs bg-gray-100 hover:bg-gray-200/60 focus:bg-white rounded-xl border border-transparent focus:border-[#0C831F] transition-all outline-none text-[#1C1C1C] placeholder:text-gray-500 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP HEADER (>= md)                                 */}
      {/* Spacious, well-proportioned quick-commerce desktop layout */}
      {/* ======================================================== */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <button
            onClick={() => setCustomerPage('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none select-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0C831F] text-white flex items-center justify-center font-black text-lg shadow-xs group-hover:bg-[#096317] transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-[#1C1C1C] leading-none">
                PRABHANDHAN
              </span>
              <span className="text-[10px] font-bold text-[#0C831F] tracking-wider uppercase leading-tight mt-0.5">
                Daily Grocery
              </span>
            </div>
          </button>

          {/* Delivery Location Selector */}
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left shrink-0 max-w-[220px]"
          >
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-[#0C831F] bg-[#F0F8F1] px-1 rounded">
                  15 MINS
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Deliver to
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-semibold text-[#1C1C1C] truncate leading-tight">
                  {selectedAddress
                    ? `${selectedAddress.area || selectedAddress.city}`
                    : 'Select Location'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              </div>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-xl border border-gray-200 focus:border-[#0C831F] focus:ring-1 focus:ring-[#0C831F] transition-all outline-none text-[#1C1C1C] placeholder:text-gray-400 font-medium"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Desktop Search Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-dropdown border border-gray-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {recentSearches.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] text-gray-400 hover:text-gray-600 normal-case font-semibold"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSelectSearchTerm(term)}
                          className="text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectSearchTerm(term)}
                        className="text-xs px-2.5 py-1 rounded bg-[#F0F8F1] hover:bg-[#E2F3E4] text-[#0C831F] font-semibold transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Right Actions: Login & Cart */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => setCustomerPage('account')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <span>Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#1C1C1C] hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setShowCartDrawer(true)}
              className="flex items-center gap-2 bg-[#0C831F] hover:bg-[#096317] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 select-none"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F8B602] text-[#1C1C1C] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>
                {cartCount === 0 ? 'My Cart' : `₹${cartSubtotal}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Quick Category Strip */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar py-1.5 text-xs font-semibold">
            <button
              onClick={() => {
                navigateToCategory('');
                setCustomerPage('categories');
              }}
              className="text-[#0C831F] font-bold hover:underline shrink-0"
            >
              All Categories
            </button>
            <span className="text-gray-200">|</span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigateToCategory(cat.id)}
                className={`shrink-0 hover:text-[#0C831F] transition-colors py-0.5 ${
                  activeCategoryId === cat.id
                    ? 'text-[#0C831F] font-extrabold border-b-2 border-[#0C831F]'
                    : 'text-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};
