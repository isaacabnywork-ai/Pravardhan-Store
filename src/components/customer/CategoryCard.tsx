import React, { useState } from 'react';
import { Category } from '@/types';
import { useStore } from '@/context/StoreContext';

interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  compact = false,
}) => {
  const { navigateToCategory, activeCategoryId } = useStore();
  const isSelected = activeCategoryId === category.id;
  const [imgError, setImgError] = useState(false);

  if (compact) {
    return (
      <button
        onClick={() => navigateToCategory(category.id)}
        className="flex flex-col items-center gap-1.5 group select-none min-w-[70px] text-center"
      >
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl p-1 transition-all duration-150 overflow-hidden flex items-center justify-center bg-white border ${
            isSelected
              ? 'border-[#0C831F] ring-2 ring-[#0C831F]/20 shadow-xs'
              : 'border-gray-200/80 group-hover:border-gray-300 group-hover:shadow-card'
          }`}
        >
          {imgError ? (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
              {category.name.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
            />
          )}
        </div>
        <span
          className={`text-[11px] sm:text-xs font-semibold leading-tight max-w-[80px] line-clamp-2 ${
            isSelected ? 'text-[#0C831F]' : 'text-[#1C1C1C] group-hover:text-[#0C831F]'
          }`}
        >
          {category.name}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={() => navigateToCategory(category.id)}
      className="group relative bg-white rounded-xl border border-gray-200/80 p-2.5 sm:p-3 hover:border-gray-300 hover:shadow-card transition-all duration-150 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2 p-1 flex items-center justify-center">
        {imgError ? (
          <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-400">
            {category.name}
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
          />
        )}
      </div>

      <div>
        <h3 className="text-xs sm:text-sm font-bold text-[#1C1C1C] group-hover:text-[#0C831F] transition-colors leading-tight line-clamp-2">
          {category.name}
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {category.itemCount}+ items
        </p>
      </div>
    </div>
  );
};
