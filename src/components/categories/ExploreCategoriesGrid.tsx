'use client';

import React from 'react';
import Link from 'next/link';
import {
  CATEGORY_DIRECTORY_SECTIONS,
  CategoryDirectorySection,
} from '@/lib/data/categories-directory';

interface ExploreCategoriesGridProps {
  sections?: CategoryDirectorySection[];
  maxSections?: number;
  className?: string;
  showSectionTitles?: boolean;
}

export function ExploreCategoriesGrid({
  sections = CATEGORY_DIRECTORY_SECTIONS,
  maxSections,
  className = '',
  showSectionTitles = true,
}: ExploreCategoriesGridProps) {
  const displayedSections = maxSections ? sections.slice(0, maxSections) : sections;

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {displayedSections.map((section) => (
        <div key={section.id} className="space-y-3">
          {showSectionTitles && (
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight">
              {section.title}
            </h3>
          )}

          {/* 4-column layout on mobile, expanding gracefully on larger screens */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-4">
            {section.items.map((item) => (
              <Link
                key={item.id}
                href={
                  item.subSlug
                    ? `/shop?category=${item.categorySlug}&sub=${item.subSlug}`
                    : `/shop?category=${item.categorySlug}`
                }
                className="flex flex-col items-center group cursor-pointer active:scale-95 transition-all text-center focus-visible:outline-none"
              >
                {/* Rounded Squircle Container with Soft Pastel Background */}
                <div
                  className={`w-full aspect-square rounded-2xl sm:rounded-3xl ${item.pastelBg} p-2 sm:p-2.5 flex items-center justify-center relative overflow-hidden shadow-2xs group-hover:scale-105 group-hover:shadow-xs transition-all duration-200 border border-black/[0.04]`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl shadow-2xs group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Subcategory Label underneath squircle */}
                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 group-hover:text-[#0F5132] text-center leading-snug line-clamp-2 mt-1.5 px-0.5 transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
