import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Truck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    cartCount,
    cartSubtotal,
    cartSavings,
    couponDiscount,
    deliveryFee,
    grandTotal,
    freeDeliveryThreshold,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCustomerPage,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const progressToFreeDelivery = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    applyCoupon(couponInput);
    setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setCustomerPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your cart is empty"
          description="Explore fresh fruits, vegetables, dairy, and grocery staples."
          actionText="Start Shopping"
          onAction={() => setCustomerPage('home')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">My Cart ({cartCount} items)</span>
      </nav>

      {/* Free Delivery Bar */}
      <div className="bg-[#F0F8F1] rounded-2xl p-3.5 sm:p-4 border border-[#CBE8CE] space-y-1.5 shadow-soft">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#0C831F]">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            {remainingForFreeDelivery === 0
              ? 'Awesome! You unlocked FREE Delivery'
              : `Add ₹${remainingForFreeDelivery} more to enjoy FREE Delivery`}
          </span>
          <span>Target: ₹{freeDeliveryThreshold}</span>
        </div>
        <div className="w-full h-1.5 bg-[#CBE8CE] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0C831F] rounded-full transition-all duration-300"
            style={{ width: `${progressToFreeDelivery}%` }}
          />
        </div>
      </div>

      {/* 2-Column Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-soft space-y-4">
          <h2 className="text-sm font-black text-[#1C1C1C] uppercase tracking-wider">
            Items in Basket ({cartCount})
          </h2>

          <div className="divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1C1C1C] truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-[11px] text-gray-500">{item.variant.weight}</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-black text-[#1C1C1C]">
                        ₹{item.variant.price * item.quantity}
                      </span>
                      {item.variant.mrp > item.variant.price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{item.variant.mrp * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-22 shrink-0">
                  <QuantitySelector
                    quantity={item.quantity}
                    maxStock={item.variant.stock}
                    size="sm"
                    fullWidth
                    onIncrement={() =>
                      updateCartQuantity(item.productId, item.variantId, item.quantity + 1)
                    }
                    onDecrement={() =>
                      updateCartQuantity(item.productId, item.variantId, item.quantity - 1)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Coupon & Bill Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-soft space-y-3">
            <h3 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider">
              Apply Coupon
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[#F0F8F1] border border-[#CBE8CE] p-3 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0C831F]" />
                  <div>
                    <span className="font-bold text-[#0C831F] font-mono">{appliedCoupon.code}</span>
                    <span className="text-gray-600 ml-1">applied (₹{couponDiscount} saved)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. FRESH50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full h-10 pl-8 pr-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F] uppercase font-mono font-bold"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!couponInput.trim()}
                >
                  Apply
                </Button>
              </form>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-3">
            <h3 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider">
              Bill Details
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-800">₹{cartSubtotal}</span>
              </div>

              {cartSavings > 0 && (
                <div className="flex justify-between text-[#0C831F] font-semibold">
                  <span>Product Savings</span>
                  <span>-₹{cartSavings}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#0C831F] font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-[#0C831F]">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-black text-[#1C1C1C]">
                <span>To Pay</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleProceedToCheckout}
              className="py-3 font-black text-sm tracking-wide mt-2"
            >
              <span>Proceed to Checkout</span>
              <span className="mx-2">•</span>
              <span>₹{grandTotal}</span>
              <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
