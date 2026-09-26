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
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAddress } from '@/context/AddressContext';
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
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3 border border-blue-100">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base sm:text-lg font-black text-[#0F172A] mb-1">
          Your cart is empty
        </h2>
        <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
          Add fresh vegetables, dairy, atta, dal, and snacks to your cart.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-95"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Progress percentage for free delivery
  const freeDeliveryThreshold = 499;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0] mb-3">
        <div>
          <h1 className="text-base sm:text-xl font-black text-[#0F172A] tracking-tight">
            My Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-[#64748B]">Scheduled delivery from your neighborhood store</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#DC2626] font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Free Delivery Meter */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] mb-1">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#2563EB]" />
            <span>
              {freeDelivery
                ? 'FREE Delivery unlocked!'
                : `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery`}
            </span>
          </div>
          <span className="text-[#2563EB]">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Cart Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.variant.id} className="p-3 flex items-center gap-3">
                {/* Item Thumbnail */}
                <div className="relative w-14 h-14 rounded-lg bg-[#F8FAFC] overflow-hidden shrink-0 border border-[#E2E8F0]">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                    {item.product.name}
                  </h3>
                  <div className="text-[11px] text-[#64748B] font-medium">
                    {item.variant.weight}
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs sm:text-sm font-black text-[#0F172A]">
                      ₹{item.variant.price * item.quantity}
                    </span>
                    {item.variant.mrp > item.variant.price && (
                      <span className="text-[10px] text-[#64748B] line-through">
                        ₹{item.variant.mrp * item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-[#2563EB] text-white rounded-lg overflow-hidden shadow-xs">
                  <button
                    onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                    className="p-1 hover:bg-[#1D4ED8] transition-colors active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="px-1.5 text-xs font-black min-w-[18px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                    disabled={item.quantity >= item.variant.stock}
                    className="p-1 hover:bg-[#1D4ED8] disabled:opacity-40 transition-colors active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Slot Selection */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2563EB]" /> Choose Delivery Slot
              </span>
              <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded">
                Normal Delivery
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mb-2.5">
              Select your preferred arrival slot.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]'
                        : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A]">{slot.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      {slot.date} • {freeDelivery ? 'FREE' : `₹${slot.fee}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Coupons & Bill Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Apply Coupon Box */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-[#2563EB]" /> Apply Coupon
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="text-xs font-black text-[#2563EB]">
                    &apos;{appliedCoupon.code}&apos; Applied
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Saved ₹{couponDiscount} on this order
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-[#DC2626] hover:underline"
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
                    className="flex-1 text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB] uppercase font-bold"
                  />
                  <button
                    onClick={() => handleApplyCoupon(couponInput)}
                    disabled={!couponInput.trim() || isApplying}
                    className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {couponError}
                  </p>
                )}

                {/* Available Quick Coupons */}
                <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                    Available Coupons:
                  </span>
                  <div className="space-y-1">
                    {COUPONS.map((cpn) => (
                      <div
                        key={cpn.code}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#0F172A]">{cpn.code}</span>
                          <p className="text-[10px] text-[#64748B] line-clamp-1">
                            {cpn.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplyCoupon(cpn.code)}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline shrink-0"
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
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
              Bill Summary
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Item Total (MRP)</span>
                <span>₹{mrpTotal}</span>
              </div>

              {productDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Product Discount</span>
                  <span>- ₹{productDiscount}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-[#64748B]">
                <span>Delivery Charge</span>
                <span>
                  {freeDelivery ? (
                    <span className="text-[#16A34A] font-bold uppercase text-[11px]">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-baseline text-[#0F172A]">
                <span className="font-bold text-sm">To Pay</span>
                <span className="font-black text-lg text-[#0F172A]">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Savings Callout */}
            {(productDiscount + couponDiscount) > 0 && (
              <div className="mt-2.5 p-2 bg-green-50 text-[#16A34A] text-xs font-bold text-center rounded-lg">
                You save ₹{productDiscount + couponDiscount} on this order
              </div>
            )}

            {/* Proceed to Checkout Button */}
            <Link
              href="/checkout"
              className="w-full mt-3 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
