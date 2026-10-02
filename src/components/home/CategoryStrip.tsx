'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoryStripProps {
  categories: Category[];
  activeSlug?: string;
}

const CATEGORY_TINTS = [
  'bg-emerald-50/80 border-emerald-100 hover:border-emerald-300',
  'bg-amber-50/80 border-amber-100 hover:border-amber-300',
  'bg-orange-50/80 border-orange-100 hover:border-orange-300',
  'bg-blue-50/80 border-blue-100 hover:border-blue-300',
  'bg-purple-50/80 border-purple-100 hover:border-purple-300',
  'bg-rose-50/80 border-rose-100 hover:border-rose-300',
  'bg-teal-50/80 border-teal-100 hover:border-teal-300',
  'bg-lime-50/80 border-lime-100 hover:border-lime-300',
];

export function CategoryStrip({ categories, activeSlug }: CategoryStripProps) {
  return (
    <div className="w-full bg-white border-b border-slate-200/80 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight uppercase">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="group flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Scrollable category cards with fresh pastel backgrounds */}
        <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat, idx) => {
            const isActive = activeSlug === cat.slug;
            const tintClass = CATEGORY_TINTS[idx % CATEGORY_TINTS.length];

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center shrink-0 w-[72px] sm:w-[84px] text-center transition-all touch-press"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1.5 flex items-center justify-center transition-all overflow-hidden border shadow-xs ${
                    isActive
                      ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500/20 scale-105'
                      : `${tintClass} group-hover:scale-105 group-hover:shadow-sm`
                  }`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-bold leading-tight line-clamp-2 transition-colors ${
                    isActive
                      ? 'text-emerald-700'
                      : 'text-slate-800 group-hover:text-emerald-600'
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
