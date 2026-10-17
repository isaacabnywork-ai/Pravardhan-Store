import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ShoppingBag, ArrowRight, Tag, Check, Trash2, Clock, Truck, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    showCartDrawer,
    setShowCartDrawer,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    cartMRP,
    cartSavings,
    couponDiscount,
    deliveryFee,
    grandTotal,
    freeDeliveryThreshold,
    minimumOrderValue,
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
    setShowCartDrawer(false);
    setCustomerPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Drawer
      isOpen={showCartDrawer}
      onClose={() => setShowCartDrawer(false)}
      title={`My Cart (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
      subtitle="Delivery in 15-30 mins"
      maxWidth="md"
    >
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-[#1C1C1C]">Your cart is empty</h4>
          <p className="text-xs text-gray-500 mt-1 mb-6 max-w-xs">
            Add fresh groceries, fruits, milk &amp; daily staples to your cart
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setShowCartDrawer(false);
              setCustomerPage('home');
            }}
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full -mx-5 -my-5">
          {/* Free Delivery Bar */}
          <div className="bg-[#F0F8F1] px-4 py-2.5 border-b border-[#CBE8CE]">
            <div className="flex items-center justify-between text-xs font-bold text-[#0C831F] mb-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                {remainingForFreeDelivery === 0
                  ? "Yay! You've unlocked FREE Delivery"
                  : `Add ₹${remainingForFreeDelivery} more for FREE Delivery`}
              </span>
              <span>₹{freeDeliveryThreshold}</span>
            </div>
            <div className="w-full h-1.5 bg-[#CBE8CE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0C831F] rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeDelivery}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="py-3 flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#1C1C1C] truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-gray-500">{item.variant.weight}</p>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xs font-black text-[#1C1C1C]">
                      ₹{item.variant.price * item.quantity}
                    </span>
                    {item.variant.mrp > item.variant.price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{item.variant.mrp * item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper */}
                <div className="w-20 shrink-0 self-center">
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

          {/* Coupon Input & Bill Summary Footer */}
          <div className="bg-gray-50 border-t border-gray-200/80 p-4 space-y-3 shrink-0">
            {/* Coupon Section */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[#F0F8F1] border border-[#CBE8CE] p-2.5 rounded-xl text-xs">
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
                    className="w-full h-9 pl-8 pr-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0C831F] uppercase font-mono font-semibold"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={!couponInput.trim()}
                  className="px-3 h-9 rounded-lg bg-[#0C831F] hover:bg-[#096317] disabled:opacity-50 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Bill Summary */}
            <div className="bg-white p-3 rounded-xl border border-gray-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span>₹{cartSubtotal}</span>
              </div>

              {cartSavings > 0 && (
                <div className="flex justify-between text-[#0C831F] font-semibold">
                  <span>Product Discount</span>
                  <span>-₹{cartSavings}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#0C831F] font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-[#0C831F]">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-black text-[#1C1C1C]">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleProceedToCheckout}
              className="py-3 font-black text-sm tracking-wide"
            >
              <span>Proceed to Checkout</span>
              <span className="mx-2">•</span>
              <span>₹{grandTotal}</span>
              <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
