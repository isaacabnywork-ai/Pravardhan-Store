import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CategoryCard } from './CategoryCard';
import { ChevronRight, Clock } from 'lucide-react';

export const CategoriesScreen: React.FC = () => {
  const { categories, setCustomerPage } = useStore();

  return (
    <div className="space-y-4 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">All Categories</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#1C1C1C] tracking-tight">
            All Grocery Aisles
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Select a category to browse farm produce, dairy, bakery &amp; kitchen staples
          </p>
        </div>

        <span className="text-[10px] font-extrabold uppercase text-[#0C831F] bg-[#F0F8F1] px-2 py-1 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#0C831F]" />
          <span>15 MINS</span>
        </span>
      </div>

      {/* Categories Grid (4 cols on mobile, 6 to 8 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 sm:gap-3.5">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};
