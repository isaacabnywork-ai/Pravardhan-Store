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
      <div className="bg-[#0F172A] text-white py-3.5 sm:py-5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/categories" className="hover:underline">Categories</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">{category.name}</span>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">{category.name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Fresh & handpicked daily • Morning & evening delivery slots
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
