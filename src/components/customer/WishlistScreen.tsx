import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heart, ChevronRight } from 'lucide-react';

export const WishlistScreen: React.FC = () => {
  const { wishlist, products, setCustomerPage } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="space-y-4 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">Saved Items</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#1C1C1C] tracking-tight">
            Saved Items ({wishlistedProducts.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Your frequently purchased groceries saved for 1-tap reordering
          </p>
        </div>
      </div>

      {/* Grid or Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 shadow-soft">
          <EmptyState
            icon={<Heart className="w-8 h-8 text-rose-500" />}
            title="No items in wishlist"
            description="Tap the heart icon on any product to save it here for quick reordering."
            actionText="Start Shopping"
            onAction={() => setCustomerPage('home')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
