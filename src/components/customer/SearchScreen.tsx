import React, { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, ChevronRight, X, Clock, TrendingUp } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    setCustomerPage,
    navigateToCategory,
    categories,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useStore();

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return products.filter((prod) => {
      const matchName = prod.name.toLowerCase().includes(q);
      const matchBrand = prod.brand.toLowerCase().includes(q);
      const matchCategory = prod.category.toLowerCase().includes(q);
      const matchSub = prod.subCategory?.toLowerCase().includes(q);
      const matchTags = prod.tags?.some((t) => t.toLowerCase().includes(q));
      const matchSku = prod.variants.some((v) => v.sku.toLowerCase().includes(q));

      return matchName || matchBrand || matchCategory || matchSub || matchTags || matchSku;
    });
  }, [products, searchQuery]);

  const popularSearches = [
    'Atta',
    'Amul Milk',
    'Fortune Oil',
    'Alphonso Mango',
    'Tomatoes',
    'Tata Tea Gold',
    'Surf Excel',
    'Paneer',
  ];

  const handleSelectTerm = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">Search</span>
      </nav>

      {/* Search Input Box */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-soft">
        <div className="relative">
          <input
            type="text"
            placeholder="Search groceries, atta, milk, fresh fruits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/80 focus:bg-white rounded-xl border border-gray-200 focus:border-[#0C831F] focus:ring-1 focus:ring-[#0C831F] transition-all outline-none text-[#1C1C1C] placeholder:text-gray-400 font-semibold"
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
        </div>

        {/* Recent & Popular Tags when empty */}
        {!searchQuery && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold normal-case"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectTerm(term)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <TrendingUp className="w-3 h-3 text-[#0C831F]" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectTerm(term)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F0F8F1] hover:bg-[#E2F3E4] text-[#0C831F] font-semibold transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Header when query is present */}
      {searchQuery && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs sm:text-sm font-bold text-gray-700">
            Showing results for &ldquo;<span className="text-[#0C831F]">{searchQuery}</span>&rdquo;
          </p>
          <span className="text-xs text-gray-400">
            {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* Results Grid or Empty State */}
      {searchQuery && searchResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-soft">
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="No products found"
            description={`We couldn't find anything matching "${searchQuery}". Check the spelling or explore popular categories below.`}
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
          />

          <div className="mt-6 pt-6 border-t border-gray-100 max-w-lg mx-auto">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider text-center mb-3">
              Explore Categories
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigateToCategory(cat.id)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-[#F0F8F1] hover:border-[#0C831F] hover:text-[#0C831F] transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
