'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { StoreService } from '@/services/storeService';

const TRENDING_SEARCHES = [
  'Fresh Onion',
  'Amul Milk',
  'Aashirvaad Atta',
  'Potato (Aloo)',
  'Tata Salt',
  'Fortune Mustard Oil',
  'Maggi Noodles',
  'Farm Fresh Eggs',
  'Green Chilli',
  'Tomato',
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
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      {/* Search Input Box */}
      <div className="relative mb-6 max-w-3xl mx-auto">
        <Search className="w-5 h-5 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.5]" />
        <input
          type="text"
          autoFocus
          placeholder="Search fresh vegetables, dairy, atta, dal, spices, snacks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-hidden transition-all text-slate-900 shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setResults([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When no query typed: Show Trending and Recent searches */}
      {!debouncedQuery ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                </span>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectSearch(term)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-semibold rounded-full transition-all active:scale-95 shadow-2xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Trending Grocery Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelectSearch(term)}
                  className="px-3.5 py-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
              {isPending ? (
                <span className="text-emerald-600 font-bold">Searching catalogue...</span>
              ) : (
                <span>
                  Found <b className="text-slate-900">{results.length}</b> {results.length === 1 ? 'grocery item' : 'grocery items'} for &quot;
                  <span className="text-emerald-700 font-black">{debouncedQuery}</span>&quot;
                </span>
              )}
            </h2>
          </div>

          {results.length === 0 && !isPending ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto my-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-900 text-base">No grocery items found</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                We couldn&apos;t find any grocery item matching &quot;{debouncedQuery}&quot;. Try searching for staples like &quot;Atta&quot;, &quot;Milk&quot;, &quot;Tomato&quot;, or &quot;Dal&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
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
