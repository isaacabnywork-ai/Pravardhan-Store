import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { cartCount, cartSubtotal, cartSavings, setShowCartDrawer, customerPage } = useStore();

  // Hide on checkout or confirmation screens
  if (cartCount === 0 || customerPage === 'checkout' || customerPage === 'order-confirmation') {
    return null;
  }

  return (
    <div className="fixed bottom-[60px] lg:bottom-5 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none flex justify-center">
      <div
        onClick={() => setShowCartDrawer(true)}
        role="button"
        tabIndex={0}
        aria-label={`View cart with ${cartCount} items, total ₹${cartSubtotal}`}
        className="pointer-events-auto w-full max-w-lg bg-[#0C831F] hover:bg-[#096317] text-white p-3 sm:py-3.5 sm:px-4 rounded-xl shadow-lg border border-white/20 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none animate-in slide-in-from-bottom-3 duration-200"
      >
        {/* Left: Item count & Price */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-white/60 text-xs">•</span>
              <span className="text-sm font-extrabold text-white">
                ₹{cartSubtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {cartSavings > 0 && (
              <p className="text-[10px] font-semibold text-[#F8B602] leading-tight mt-0.5">
                Saved ₹{cartSavings.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Right: View Cart CTA */}
        <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-white pl-3">
          <span>View Cart</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
