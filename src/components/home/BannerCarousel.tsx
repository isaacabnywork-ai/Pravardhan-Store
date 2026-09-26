'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Banner } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3.5 sm:px-6 my-2 sm:my-3">
      <div className="relative w-full h-36 sm:h-52 md:h-60 rounded-xl overflow-hidden bg-[#0F172A] border border-[#E2E8F0]">
        {banners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/50 to-transparent p-4 sm:p-8 flex flex-col justify-center items-start">
                <span className="text-[#3B82F6] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1">
                  Local Store Offer
                </span>
                <h2 className="text-base sm:text-2xl font-black text-white max-w-sm leading-tight mb-1">
                  {banner.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300 max-w-xs mb-2.5 sm:mb-3 line-clamp-1">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.ctaLink}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-lg transition-transform active:scale-95"
                >
                  {banner.ctaText} &rarr;
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
              className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#0F172A] items-center justify-center transition-colors shadow-xs"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#0F172A] items-center justify-center transition-colors shadow-xs"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 rounded-full transition-all ${
                  i === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
