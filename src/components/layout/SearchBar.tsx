'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Mic, X } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

const SUGGESTIONS = [
  'stationery',
  'milk, curd & butter',
  'chakki atta, rice',
  'fresh tomatoes & onion',
  'chips & cold drinks',
  'surf excel & cleaners',
];

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ className = '', autoFocus = false }: SearchBarProps) {
  const router = useRouter();
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Vertical rolling slot-machine placeholder animation
  useEffect(() => {
    if (isSearchFocused || searchQuery.trim().length > 0 || isListening) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isSearchFocused, searchQuery, isListening]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Filter products for autocomplete dropdown
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.variants.some((v) =>
              v.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      setIsSearchFocused(false);
      setSearchQuery('');
      router.push(`/product/${searchResults[selectedIndex].slug}`);
      return;
    }
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSelectedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0 ? (prev + 1) % searchResults.length : -1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0
          ? (prev - 1 + searchResults.length) % searchResults.length
          : -1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // Web Speech API Voice Search
  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Voice search is not supported in this browser. Please use Chrome, Edge, or Safari, or type your search.'
      );
      return;
    }

    try {
      if (isListening) {
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          setIsListening(false);
          router.push(`/shop?q=${encodeURIComponent(transcript.trim())}`);
        }
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center bg-white border border-gray-200/90 rounded-2xl shadow-xs transition-all duration-200 focus-within:border-[#0F5132] focus-within:ring-2 focus-within:ring-[#0F5132]/10 h-10 sm:h-11 px-3">
          {/* Magnifying Glass Search Icon */}
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 flex-shrink-0 stroke-[2.2]" />

          {/* Actual Search Input */}
          <input
            ref={inputRef}
            type="text"
            autoFocus={autoFocus}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent pl-2.5 pr-2 py-2 text-xs sm:text-sm font-medium text-gray-900 outline-none z-10"
          />

          {/* Blinkit-Style Vertical Rolling Placeholder Animation */}
          {!searchQuery && !isListening && (
            <div className="absolute left-9 sm:left-10 inset-y-0 flex items-center pointer-events-none overflow-hidden select-none">
              <div className="h-5 overflow-hidden relative">
                <div
                  className="transition-transform duration-500 ease-out"
                  style={{ transform: `translateY(-${placeholderIndex * 20}px)` }}
                >
                  {SUGGESTIONS.map((item, idx) => (
                    <div
                      key={idx}
                      className="h-5 flex items-center text-xs sm:text-sm text-gray-700 truncate"
                    >
                      <span className="font-normal text-gray-600">Search &ldquo;</span>
                      <span className="font-medium text-gray-900">{item}</span>
                      <span className="font-normal text-gray-600">&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Listening State indicator */}
          {isListening && (
            <div className="absolute left-9 sm:left-10 inset-y-0 flex items-center pointer-events-none select-none">
              <span className="text-xs sm:text-sm font-bold text-red-600 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Listening... speak now
              </span>
            </div>
          )}

          {/* Clear text X button */}
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search input"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer z-10 flex-shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Thin Vertical Line Separator */}
          <div className="w-[1px] h-4 sm:h-5 bg-gray-200/90 mx-1.5 flex-shrink-0 z-10" />

          {/* Microphone Icon Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            title={isListening ? 'Listening... click to stop' : 'Search by voice'}
            aria-label="Search by voice"
            className={`p-1 rounded-full transition-colors flex-shrink-0 cursor-pointer z-10 ${
              isListening
                ? 'text-red-500 bg-red-50'
                : 'text-gray-800 hover:text-[#0F5132] hover:bg-gray-100/60'
            }`}
          >
            <Mic className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[2] ${isListening ? 'animate-bounce' : ''}`} />
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isSearchFocused && (
        <>
          {searchResults.length > 0 ? (
            <div
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden divide-y divide-gray-100"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="p-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 flex justify-between">
                <span>SUGGESTED PRODUCTS</span>
                <span className="text-[#0F5132] font-semibold">Use ↑↓ keys & Enter</span>
              </div>
              {searchResults.map((prod, idx) => (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  onClick={() => {
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-3 p-2.5 transition-colors ${
                    idx === selectedIndex ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={prod.images[0]}
                    alt=""
                    className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50 p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{prod.brand}</p>
                    <p className="text-xs font-semibold text-gray-900 truncate">{prod.name}</p>
                    <p className="text-xs text-[#0F5132] font-bold">
                      {formatPrice(prod.variants[0]?.price || 0)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery.trim().length > 0 ? (
            <div
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4 text-center"
              onMouseDown={(e) => e.preventDefault()}
            >
              <p className="text-xs font-bold text-gray-800">
                No products found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Try searching &ldquo;milk&rdquo;, &ldquo;atta&rdquo;, or &ldquo;tomatoes&rdquo;
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
