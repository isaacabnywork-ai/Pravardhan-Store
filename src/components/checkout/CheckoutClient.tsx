'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAddress } from '@/context/AddressContext';
import { DELIVERY_SLOTS } from '@/data/mockData';
import { DeliverySlot } from '@/types';

export function CheckoutClient() {
  const router = useRouter();
  const { items, itemCount, subtotal, productDiscount, couponDiscount, deliveryFee, total, appliedCoupon, clearCart } = useCart();
  const { currentAddress, setIsLocationModalOpen } = useAddress();

  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>(DELIVERY_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 border border-emerald-100">
          <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-1">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mb-5">Please add items to proceed with checkout.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <span>Return to Store</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!currentAddress) {
      setErrorMsg('Please select a delivery address');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          address: currentAddress,
          deliverySlot: selectedSlot,
          couponCode: appliedCoupon?.code,
          paymentMethod,
          deliveryNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      router.push(`/orders/${data.order.id}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong while placing order');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <Link href="/cart" className="hover:text-emerald-600 transition-colors">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">Secure Checkout</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Delivery & Payment
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your delivery details and choose a convenient payment option
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Address Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-black">
                  1
                </div>
                <span>Delivery Address</span>
              </span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Change Address
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-slate-900">{currentAddress.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {currentAddress.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                {currentAddress.houseFlat}, {currentAddress.street}, {currentAddress.area}, {currentAddress.city} - {currentAddress.pincode}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Phone: +91 {currentAddress.phone}
              </p>
            </div>

            {/* Delivery Note */}
            <div className="mt-3">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Delivery Instructions (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Leave at door / Call on arrival / Gate code"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. Scheduled Slot Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-black">
                2
              </div>
              <span>Scheduled Delivery Slot</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
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
                      {slot.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-black">
                3
              </div>
              <span>Select Payment Method</span>
            </span>

            <div className="space-y-2.5">
              {/* UPI */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">UPI Instant Payment</span>
                    <span className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM, CRED</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* Cards */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Credit / Debit Card</span>
                    <span className="text-[11px] text-slate-500">Visa, Mastercard, RuPay, Maestro</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* Cash On Delivery */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-slate-500">Pay cash or UPI at delivery doorstep</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h3>

            {/* Items list */}
            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 no-scrollbar mb-3">
              {items.map((it) => (
                <div key={it.variant.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2 truncate">
                    <span className="font-bold text-slate-900">{it.product.name}</span>
                    <span className="text-slate-500 block text-[10px]">
                      {it.variant.weight} × {it.quantity}
                    </span>
                  </div>
                  <span className="font-black text-slate-900">
                    ₹{it.variant.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {productDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Savings</span>
                  <span>- ₹{productDiscount}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-black">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="font-black text-sm">Total Payable</span>
                <span className="font-black text-xl text-slate-900">₹{total}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/25 active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Placing your grocery order...</span>
              ) : (
                <>
                  <span>CONFIRM & PLACE ORDER • ₹{total}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Safe & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
