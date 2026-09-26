'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { StoreService } from '@/services/storeService';

const TRENDING_SEARCHES = [
  'Atta',
  'Amul Milk',
  'Onion',
  'Potato',
  'Tata Salt',
  'Fortune Oil',
  'Maggi Noodles',
  'Eggs',
  'Tea',
];

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fresh_kirana_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, router]);

  // Execute search when debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const products = await StoreService.getProducts({ search: debouncedQuery });
      setResults(products);

      // Save to recent searches
      setRecentSearches((prev) => {
        const updated = [debouncedQuery.trim(), ...prev.filter((s) => s.toLowerCase() !== debouncedQuery.trim().toLowerCase())].slice(0, 8);
        try {
          localStorage.setItem('fresh_kirana_recent_searches', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    });
  }, [debouncedQuery]);

  const handleSelectSearch = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('fresh_kirana_recent_searches');
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Search Input Box */}
      <div className="relative mb-5">
        <Search className="w-5 h-5 text-[#2563EB] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          autoFocus
          placeholder="Search for atta, dal, milk, chips, oil..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium focus:border-[#2563EB] focus:outline-hidden transition-all text-[#0F172A]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#0F172A] rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When no query typed: Show Trending and Recent searches */}
      {!debouncedQuery ? (
        <div className="space-y-5">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" /> Recent Searches
                </span>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-[#2563EB] hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectSearch(term)}
                    className="px-3 py-1 bg-white border border-[#E2E8F0] hover:border-slate-300 text-[#0F172A] text-xs font-semibold rounded-lg transition-colors active:scale-95"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" /> Trending Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelectSearch(term)}
                  className="px-3 py-1 bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold rounded-lg transition-all active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-[#0F172A]">
              {isPending ? (
                <span>Searching...</span>
              ) : (
                <span>
                  Found {results.length} {results.length === 1 ? 'item' : 'items'} for &quot;
                  <span className="text-[#2563EB] font-black">{debouncedQuery}</span>&quot;
                </span>
              )}
            </h2>
          </div>

          {results.length === 0 && !isPending ? (
            <div className="bg-white rounded-xl p-8 text-center border border-[#E2E8F0] max-w-sm mx-auto my-6">
              <Search className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-bold text-[#0F172A] text-sm">No products found</h3>
              <p className="text-xs text-[#64748B] mt-1">
                We couldn&apos;t find any item matching &quot;{debouncedQuery}&quot;. Try searching for &quot;Atta&quot;, &quot;Milk&quot;, or &quot;Dal&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
