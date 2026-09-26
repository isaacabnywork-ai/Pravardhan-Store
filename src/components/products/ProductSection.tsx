import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  seeAllLink?: string;
  products: Product[];
  layout?: 'scroll' | 'grid';
}

export function ProductSection({
  title,
  subtitle,
  badge,
  seeAllLink,
  products,
  layout = 'scroll',
}: ProductSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 my-3 sm:my-5">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-lg font-black text-[#0F172A] tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="text-[9px] sm:text-[10px] font-black bg-blue-100 text-[#2563EB] px-1.5 py-0.5 rounded uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-[#64748B] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="text-xs font-bold text-[#2563EB] hover:underline shrink-0"
          >
            See all &rarr;
          </Link>
        )}
      </div>

      {/* Product Content: Dense Horizontal Scroll or Responsive Grid */}
      {layout === 'scroll' ? (
        <div className="flex gap-2 sm:gap-3.5 overflow-x-auto no-scrollbar pb-1">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[155px] sm:w-[190px] md:w-[210px] shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
