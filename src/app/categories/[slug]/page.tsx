import React from 'react';
import { notFound } from 'next/navigation';
import { StoreService } from '@/services/storeService';
import { CategoryProductExplorer } from '@/components/categories/CategoryProductExplorer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await StoreService.getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} | Order Online from Pravdhan Store`,
    description: `Shop fresh ${category.name} online with scheduled delivery slots and genuine prices. Local store delivery in Lucknow.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await StoreService.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await StoreService.getProducts({ categorySlug: slug });

  return (
    <div className="w-full pb-8">
      {/* Category Hero / Breadcrumb */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white py-4 sm:py-6 border-b border-emerald-900/50 shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs text-emerald-200/70 mb-2">
            <Link href="/" className="hover:text-emerald-200 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/categories" className="hover:text-emerald-200 transition-colors">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">{category.name}</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1.5 border border-emerald-400/30">
              Farm Fresh & Handpicked
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{category.name}</h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Guaranteed freshness from Lucknow local mandis • Morning & evening scheduled delivery slots
            </p>
          </div>
        </div>
      </div>

      {/* Explorer: Subcategories, Filters, Sorting & Grid */}
      <CategoryProductExplorer
        category={category}
        initialProducts={products}
      />
    </div>
  );
}
