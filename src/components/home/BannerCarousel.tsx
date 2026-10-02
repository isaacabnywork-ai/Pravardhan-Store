'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Banner } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3.5 sm:px-6 my-2 sm:my-3">
      <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-emerald-900/30 shadow-md shadow-emerald-950/10">
        {banners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover opacity-50 scale-105 transition-transform duration-1000 ease-out"
              />
              {/* Fresh Green Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/70 to-transparent p-5 sm:p-10 flex flex-col justify-center items-start">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Local Store Specials</span>
                </div>
                <h2 className="text-lg sm:text-3xl font-black text-white max-w-md leading-tight mb-1.5 tracking-tight drop-shadow-xs">
                  {banner.title}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-sm mb-3.5 sm:mb-4 line-clamp-2">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.ctaLink}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-950/30 active:scale-95 group"
                >
                  <span>{banner.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </Link>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows for desktop */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 items-center justify-center transition-all shadow-md backdrop-blur-xs hover:scale-105 active:scale-90"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 items-center justify-center transition-all shadow-md backdrop-blur-xs hover:scale-105 active:scale-90"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
