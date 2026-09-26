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
  ChevronRight
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
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h2 className="text-base font-bold text-[#0F172A] mb-1">Your cart is empty</h2>
        <p className="text-xs text-[#64748B] mb-4">Please add items to proceed with checkout.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-xl"
        >
          Return to Store
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
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
          <Link href="/cart" className="hover:text-[#2563EB]">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0F172A] font-bold">Checkout</span>
        </div>
        <h1 className="text-lg sm:text-2xl font-black text-[#0F172A]">
          Delivery & Payment
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3 mb-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 1. Address Section */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2563EB]" /> Delivery Address
              </span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Change
              </button>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-[#0F172A]">{currentAddress.name}</span>
                <span className="text-[10px] bg-blue-100 text-[#2563EB] font-bold px-1.5 py-0.5 rounded">
                  {currentAddress.label}
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-snug">
                {currentAddress.houseFlat}, {currentAddress.street}, {currentAddress.area}, {currentAddress.city} - {currentAddress.pincode}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Phone: {currentAddress.phone}
              </p>
            </div>

            {/* Delivery Note */}
            <div className="mt-2.5">
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Instructions for Delivery Partner (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with guard / Ring bell / Call on arrival"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
              />
            </div>
          </div>

          {/* 2. Scheduled Slot Selection */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Clock className="w-4 h-4 text-[#2563EB]" /> Scheduled Delivery Slot
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
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
                      {slot.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <CreditCard className="w-4 h-4 text-[#2563EB]" /> Select Payment Method
            </span>

            <div className="space-y-2">
              {/* UPI */}
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]'
                    : 'border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-[#2563EB]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">UPI Payment</span>
                    <span className="text-[11px] text-[#64748B]">Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                />
              </label>

              {/* Cards */}
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]'
                    : 'border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-[#2563EB]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Credit / Debit Cards</span>
                    <span className="text-[11px] text-[#64748B]">Visa, Mastercard, RuPay</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                />
              </label>

              {/* Cash On Delivery */}
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]'
                    : 'border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-[#2563EB]">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-[#64748B]">Pay cash or UPI at delivery doorstep</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
              Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h3>

            {/* Items list */}
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 no-scrollbar mb-2.5">
              {items.map((it) => (
                <div key={it.variant.id} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2 truncate">
                    <span className="font-bold text-[#0F172A]">{it.product.name}</span>
                    <span className="text-[#64748B] block text-[10px]">
                      {it.variant.weight} × {it.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-[#0F172A]">
                    ₹{it.variant.price * it.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {productDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Product Savings</span>
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
                <span>{deliveryFee === 0 ? <span className="text-[#16A34A] font-bold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-baseline text-[#0F172A]">
                <span className="font-bold text-sm">Total Amount</span>
                <span className="font-black text-lg text-[#0F172A]">₹{total}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full mt-3.5 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <span>PLACE ORDER • ₹{total}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
