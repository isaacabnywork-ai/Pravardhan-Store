'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { COUPONS, DELIVERY_SLOTS } from '@/data/mockData';
import { DeliverySlot } from '@/types';

export function CartView() {
  const {
    items,
    itemCount,
    subtotal,
    mrpTotal,
    productDiscount,
    couponDiscount,
    deliveryFee,
    freeDelivery,
    amountNeededForFreeDelivery,
    total,
    appliedCoupon,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>(DELIVERY_SLOTS[0]);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    setIsApplying(true);
    setTimeout(() => {
      const res = applyCoupon(code);
      if (!res.success) {
        setCouponError(res.message);
      } else {
        setCouponInput('');
      }
      setIsApplying(false);
    }, 200);
  };

  // Empty State
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 border border-emerald-100 shadow-xs">
          <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          Your cart is empty
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Add fresh farm vegetables, dairy, atta, dal, and snacks to your cart.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>
    );
  }

  // Progress percentage for free delivery
  const freeDeliveryThreshold = 499;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              My Grocery Cart
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled delivery straight from your neighborhood store
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Free Delivery Meter */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-green-50/80 to-emerald-50 border border-emerald-200/80 rounded-2xl mb-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-600 text-white">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span>
              {freeDelivery
                ? '🎉 Congratulations! You unlocked FREE Delivery'
                : `Add ₹${amountNeededForFreeDelivery} more to enjoy FREE Delivery`}
            </span>
          </div>
          <span className="text-emerald-700 font-black">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cart Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {items.map((item) => (
              <div key={item.variant.id} className="p-3.5 flex items-center gap-3.5 hover:bg-slate-50/50 transition-colors">
                {/* Item Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {item.variant.weight}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-slate-900">
                      ₹{item.variant.price * item.quantity}
                    </span>
                    {item.variant.mrp > item.variant.price && (
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{item.variant.mrp * item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs ring-1 ring-emerald-700">
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-emerald-700 transition-colors active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <span className="px-2 text-xs font-black min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.stock}
                      className="p-1.5 hover:bg-emerald-700 disabled:opacity-40 transition-colors active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                  <button
                    onClick={() => updateQuantity(item.variant.id, 0)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Slot Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> Choose Delivery Slot
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Scheduled Slot
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Select your preferred doorstep arrival timing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{slot.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {slot.date} • {freeDelivery ? 'FREE' : `₹${slot.fee}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Coupons & Bill Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Apply Coupon Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-emerald-600" /> Apply Coupon
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div>
                  <div className="text-xs font-black text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    &apos;{appliedCoupon.code}&apos; Applied
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Saved ₹{couponDiscount} on this order
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
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 uppercase font-black tracking-wider placeholder:normal-case placeholder:font-normal"
                  />
                  <button
                    onClick={() => handleApplyCoupon(couponInput)}
                    disabled={!couponInput.trim() || isApplying}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {couponError}
                  </p>
                )}

                {/* Available Quick Coupons */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Available Coupons:
                  </span>
                  <div className="space-y-1.5">
                    {COUPONS.map((cpn) => (
                      <div
                        key={cpn.code}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs"
                      >
                        <div>
                          <span className="font-black text-slate-900">{cpn.code}</span>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {cpn.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplyCoupon(cpn.code)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline shrink-0"
                        >
                          APPLY
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              Order Bill Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Item Total (MRP)</span>
                <span>₹{mrpTotal}</span>
              </div>

              {productDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Savings</span>
                  <span>- ₹{productDiscount}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>
                  {freeDelivery ? (
                    <span className="text-emerald-600 font-black uppercase text-[11px]">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="font-black text-sm">Grand Total</span>
                <span className="font-black text-xl text-slate-900">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Savings Callout */}
            {(productDiscount + couponDiscount) > 0 && (
              <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold text-center rounded-xl border border-emerald-100">
                Total savings on this order: ₹{productDiscount + couponDiscount}
              </div>
            )}

            {/* Proceed to Checkout Button */}
            <Link
              href="/checkout"
              className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/25 active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
