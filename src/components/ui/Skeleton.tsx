import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 rounded ${className}`}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
      <div className="pt-2 flex items-center justify-between border-t border-gray-50 mt-auto">
        <div className="space-y-1">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-12 h-3" />
        </div>
        <Skeleton className="w-16 h-8 rounded-lg" />
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
      <Skeleton className="w-14 h-3" />
    </div>
  );
};
