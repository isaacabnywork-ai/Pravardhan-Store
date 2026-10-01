import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreService } from '@/services/storeService';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'All Grocery Categories | Pravdhan Store',
  description: 'Browse all grocery categories: fresh fruits, vegetables, dairy, atta, dal, spices, snacks, and household essentials.',
};

export default async function CategoriesPage() {
  const categories = await StoreService.getCategories();

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          All Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Fresh groceries and daily ration delivered to your doorstep
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col justify-between hover:border-emerald-600 hover:shadow-md transition-all active:scale-98"
          >
            <div className="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 45vw, 220px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                {cat.itemCount || 30}+ products
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
