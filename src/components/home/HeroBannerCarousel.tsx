'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Check, Tag } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

interface BannerSlide {
  id: string;
  badge: string;
  badgeIcon?: React.ReactNode;
  badgeStyle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink?: string;
  ctaAction?: () => void;
  bgGradient: string;
  image: string;
  imageAlt: string;
}

export function HeroBannerCarousel() {
  const { applyCoupon, setIsCartDrawerOpen } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [couponClaimed, setCouponClaimed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const handleClaimWelcomeCoupon = () => {
    applyCoupon('WELCOME100');
    setCouponClaimed(true);
    setIsCartDrawerOpen(true);
    setTimeout(() => setCouponClaimed(false), 3000);
  };

  const slides: BannerSlide[] = [
    {
      id: 'staples-deal',
      badge: '⚡ 12-15 MINS EXPRESS',
      badgeStyle: 'bg-amber-400 text-gray-950 font-black',
      title: 'Pantry Staples & Atta at Wholesale Rates',
      subtitle: 'Aashirvaad, Daawat, Fortune & Tata Sampann up to 25% OFF',
      ctaText: 'Shop Staples',
      ctaLink: '/shop?category=groceries-staples',
      bgGradient: 'from-[#0F5132] via-[#0D442B] to-[#082D1D]',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      imageAlt: 'Daily Pantry Staples',
    },
    {
      id: 'first-order',
      badge: '🎟️ COUPON: WELCOME100',
      badgeStyle: 'bg-amber-300 text-gray-950 font-black',
      title: 'Flat ₹100 OFF on Your First Order',
      subtitle: 'Special welcome discount for Gurugram residents • Min order ₹499',
      ctaText: couponClaimed ? 'Coupon Applied!' : 'Claim Discount',
      ctaAction: handleClaimWelcomeCoupon,
      bgGradient: 'from-[#1E1B4B] via-[#312E81] to-[#4338CA]',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      imageAlt: 'First Order Grocery Bag Deals',
    },
    {
      id: 'fresh-mandi',
      badge: '🌱 100% FARM FRESH',
      badgeStyle: 'bg-emerald-400 text-emerald-950 font-black',
      title: 'Farm-Fresh Fruits & Vegetables Handpicked Daily',
      subtitle: 'Direct from Mandi at 5 AM • Crisp, chemical-free & sorted with care',
      ctaText: 'Explore Fresh Produce',
      ctaLink: '/shop?category=fruits-vegetables',
      bgGradient: 'from-[#064E3B] via-[#047857] to-[#0F766E]',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      imageAlt: 'Fresh Farm Produce',
    },
  ];

  // Auto-advance slides every 5 seconds (pause on user hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-200/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgGradient} text-white p-5 sm:p-8 md:p-10 min-h-[190px] sm:min-h-[220px] flex items-center justify-between relative overflow-hidden`}
          >
            {/* Background Decorative Rings */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute right-24 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-[65%] sm:max-w-[60%] space-y-2 sm:space-y-3">
              <span
                className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs ${slide.badgeStyle}`}
              >
                {slide.badge}
              </span>

              <h2 className="text-base sm:text-2xl md:text-3xl font-extrabold leading-tight text-white tracking-tight">
                {slide.title}
              </h2>

              <p className="text-[11px] sm:text-sm text-gray-200 font-medium line-clamp-1 sm:line-clamp-2">
                {slide.subtitle}
              </p>

              <div className="pt-1 sm:pt-2">
                {slide.ctaAction ? (
                  <button
                    type="button"
                    onClick={slide.ctaAction}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {couponClaimed ? (
                      <>
                        <Check className="w-4 h-4 text-[#0F5132]" />
                        <span>Coupon Applied!</span>
                      </>
                    ) : (
                      <>
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={slide.ctaLink || '/shop'}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-gray-950 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Product Illustration Image */}
            <div className="relative z-10 w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl sm:rounded-3xl overflow-hidden bg-white/15 backdrop-blur-xs flex-shrink-0 p-2 shadow-inner border border-white/20">
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Chevrons (Desktop Hover) */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={handlePrev}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white items-center justify-center backdrop-blur-md transition-all active:scale-90 z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={handleNext}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white items-center justify-center backdrop-blur-md transition-all active:scale-90 z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Subtle Dot Indicators */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Jump to slide ${idx + 1}`}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? 'w-6 sm:w-8 h-1.5 bg-white shadow-xs'
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
