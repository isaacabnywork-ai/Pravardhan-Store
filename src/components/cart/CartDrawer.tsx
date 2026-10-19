'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  Percent,
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
    grandTotal,
    isMinimumOrderMet,
    amountNeededForMinOrder,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const { storeSettings, promotions } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">Your Shopping Cart</h3>
                <p className="text-[11px] text-emerald-200">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} | Serving {storeSettings.serviceArea}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimum Order Value Alert Progress Bar */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
            {isMinimumOrderMet ? (
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Minimum order of {formatPrice(storeSettings.minimumOrderValue)} met! Ready to checkout.</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    Minimum Order: {formatPrice(storeSettings.minimumOrderValue)}
                  </span>
                  <span className="text-amber-800 font-bold">
                    Add {formatPrice(amountNeededForMinOrder)} more
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
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

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Explore fresh vegetables, dairy, atta, rice, and daily household essentials.
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
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {item.brand}
                    </p>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
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

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-emerald-600 rounded-lg overflow-hidden bg-white shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-emerald-950">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
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

          {/* Bottom Summary & Coupon Section */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Coupon code input & chips */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-100/60 border border-emerald-300 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-700" />
                      <div>
                        <span className="font-bold text-emerald-900 tracking-wide">
                          {appliedCoupon.code}
                        </span>
                        <p className="text-[10px] text-emerald-700">
                          Saved {formatPrice(couponDiscount)} with this coupon
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
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
                          placeholder="Enter Promo Code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold uppercase outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handleApplyCoupon(couponInput)}
                        disabled={!couponInput.trim()}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
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
                            onClick={() => handleApplyCoupon(p.code)}
                            className="flex-shrink-0 text-[10px] font-bold bg-white border border-dashed border-emerald-600 text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
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
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Items MRP Total</span>
                  <span className="line-through">{formatPrice(totalMrp)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Product Discount</span>
                  <span>- {formatPrice(productSavings)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-bold">
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>To Pay</span>
                  <span className="text-base text-emerald-800">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={!isMinimumOrderMet}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-between px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="text-left">
                  <span className="block text-[10px] text-emerald-200 font-normal">
                    {totalItemsCount} items • {formatPrice(grandTotal)}
                  </span>
                  <span className="block text-xs font-bold">Proceed to Checkout</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
