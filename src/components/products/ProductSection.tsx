import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

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
    <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 my-4 sm:my-7">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-3 sm:mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="group flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors shrink-0"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Product Content: Horizontal Scroll or Responsive Grid */}
      {layout === 'scroll' ? (
        <div className="flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-0.5">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[160px] sm:w-[195px] md:w-[215px] shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
