'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Percent,
  Clock,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalItemsCount,
    totalMrp,
    subtotal,
    productSavings,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    deliveryTip,
    setDeliveryTip,
    handlingFee,
    grandTotal,
    isMinimumOrderMet,
    amountNeededForMinOrder,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const { storeSettings, promotions } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
    setTimeout(() => {
      setCouponFeedback(null);
    }, 4000);
  };

  const handleProceedToCheckout = () => {
    if (!isMinimumOrderMet) return;
    setIsCartDrawerOpen(false);
    router.push('/checkout');
  };

  const totalSavings = productSavings + couponDiscount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200">
          {/* Header */}
          <div className="p-4 bg-[#0F5132] text-white flex items-center justify-between border-b border-[#054A29]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">My Cart</h3>
                <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>Delivery in 12-15 Mins • {storeSettings.serviceArea}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close shopping cart"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-100 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimum Order Value Alert Progress Bar (Spec §8) */}
          <div className="bg-emerald-50/80 px-4 py-2.5 border-b border-emerald-100 text-xs">
            {isMinimumOrderMet ? (
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Minimum order of {formatPrice(storeSettings.minimumOrderValue)} met! Ready to pay.</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    Minimum Order: {formatPrice(storeSettings.minimumOrderValue)}
                  </span>
                  <span className="text-amber-800 font-black">
                    Add {formatPrice(amountNeededForMinOrder)} more
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (subtotal / storeSettings.minimumOrderValue) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Savings Highlight Banner */}
          {totalSavings > 0 && items.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2 flex items-center gap-2 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>🎉 Congratulations! You are saving {formatPrice(totalSavings)} on this order!</span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Explore fresh dairy, flour, farm vegetables, and daily household items.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="pt-3 first:pt-0 flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-14 h-14 object-contain rounded-xl border border-slate-100 bg-slate-50 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {item.brand}
                    </p>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.productName}
                    </p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200">
                      {item.variantTitle}
                    </span>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatPrice(item.mrp)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper with zero layout shift */}
                      <div className="flex items-center border border-emerald-700 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.productName}`}
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="w-7 text-center text-xs font-black text-emerald-950" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.productName}`}
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Delivery Partner Tip Selector (Blinkit/Zepto feature) */}
          {items.length > 0 && (
            <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Tip your delivery partner</span>
                </span>
                {deliveryTip > 0 && (
                  <button
                    type="button"
                    aria-label="Clear delivery partner tip"
                    onClick={() => setDeliveryTip(0)}
                    className="text-[11px] font-bold text-rose-600 hover:underline focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded"
                  >
                    Clear tip
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                100% of the tip goes directly to your local delivery partner.
              </p>
              <div className="flex gap-2">
                {[10, 20, 30, 50].map((tipAmount) => {
                  const isSelected = deliveryTip === tipAmount;
                  return (
                    <button
                      key={tipAmount}
                      type="button"
                      aria-label={`Add ₹${tipAmount} delivery tip`}
                      onClick={() => setDeliveryTip(isSelected ? 0 : tipAmount)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ₹{tipAmount}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Summary & Coupon Section */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Coupon code input & chips */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="font-black text-emerald-900 tracking-wide">
                          {appliedCoupon.code}
                        </span>
                        <p className="text-[10px] text-emerald-800 font-semibold">
                          Saved {formatPrice(couponDiscount)} with this coupon
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove coupon"
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          aria-label="Enter promotional coupon code"
                          placeholder="ENTER PROMO CODE"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-bold uppercase outline-none focus:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Apply promo code"
                        onClick={() => handleApplyCoupon(couponInput)}
                        disabled={!couponInput.trim()}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick Available Promo Badges */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                      {promotions
                        .filter((p) => p.isActive)
                        .slice(0, 3)
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            aria-label={`Apply coupon ${p.code}`}
                            onClick={() => handleApplyCoupon(p.code)}
                            className="flex-shrink-0 text-[10px] font-bold bg-white border border-dashed border-emerald-600 text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                          >
                            Use {p.code} ({p.discountType === 'FLAT' ? `₹${p.discountValue} OFF` : `${p.discountValue}% OFF`})
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[11px] font-medium ${
                      couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Items MRP Total</span>
                  <span className="line-through">{formatPrice(totalMrp)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Product Discount</span>
                  <span>- {formatPrice(productSavings)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-black">
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Handling Charge</span>
                  <span>{formatPrice(handlingFee)}</span>
                </div>
                {deliveryTip > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Delivery Partner Tip</span>
                    <span>+{formatPrice(deliveryTip)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>To Pay</span>
                  <span className="text-base text-emerald-800">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Massive Thumb-Friendly Sticky CTA Button */}
              <button
                type="button"
                aria-label={`Proceed to pay ${formatPrice(grandTotal)} for ${totalItemsCount} items`}
                onClick={handleProceedToCheckout}
                disabled={!isMinimumOrderMet}
                className="w-full py-3.5 bg-[#0F5132] hover:bg-[#054A29] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#0F5132]/25 flex items-center justify-between px-4 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none"
              >
                <div className="text-left">
                  <span className="block text-[10px] text-emerald-200 font-medium">
                    {totalItemsCount} items • {formatPrice(grandTotal)}
                  </span>
                  <span className="block text-xs font-black tracking-wide">
                    Proceed to Pay ➔
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {!isMinimumOrderMet && (
                <p className="text-[11px] text-amber-700 text-center font-medium">
                  Add ₹{amountNeededForMinOrder} more to fulfill store minimum order requirement
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
