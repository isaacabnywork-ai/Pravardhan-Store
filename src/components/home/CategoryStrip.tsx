'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

interface CategoryStripProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryStrip({ categories, activeSlug }: CategoryStripProps) {
  return (
    <div className="w-full bg-white border-b border-[#E2E8F0] py-3 sm:py-3.5">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs sm:text-sm font-extrabold text-[#0F172A] tracking-tight uppercase">
            Explore Categories
          </h2>
          <Link
            href="/categories"
            className="text-xs font-bold text-[#2563EB] hover:underline"
          >
            See all &rarr;
          </Link>
        </div>

        {/* Scrollable category pills */}
        <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = activeSlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center shrink-0 w-[68px] sm:w-[76px] text-center transition-transform active:scale-95"
              >
                <div
                  className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl p-1 flex items-center justify-center transition-all overflow-hidden ${
                    isActive
                      ? 'bg-blue-50 ring-2 ring-[#2563EB]'
                      : 'bg-[#F8FAFC] group-hover:bg-blue-50/50 border border-[#E2E8F0]'
                  }`}
                >
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="60px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>
                <span
                  className={`mt-1 text-[11px] font-bold leading-tight line-clamp-2 ${
                    isActive ? 'text-[#2563EB]' : 'text-[#0F172A] group-hover:text-[#2563EB]'
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
