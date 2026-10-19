'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
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
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { storeSettings, promotions } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) setCouponInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Shopping Cart</span>
        </nav>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
          Shopping Cart ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h2>
            <p className="text-xs text-slate-500 mb-6">
              You haven&apos;t added any items to your cart yet. Explore our pantry staples, fresh fruits, vegetables, and daily dairy.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              Start Shopping Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Minimum Order Value Banner (Section 8) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                {isMinimumOrderMet ? (
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Minimum order requirement of {formatPrice(storeSettings.minimumOrderValue)} met.</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Minimum Order Value: {formatPrice(storeSettings.minimumOrderValue)}
                      </span>
                      <span>Add {formatPrice(amountNeededForMinOrder)} more to checkout</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (subtotal / storeSettings.minimumOrderValue) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>ITEMS IN CART</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>

                {items.map((item) => (
                  <div key={item.variantId} className="p-4 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</p>
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {item.productName}
                      </h3>
                      <span className="inline-block mt-0.5 text-xs text-slate-500 font-medium">
                        Pack: <strong className="text-slate-800">{item.variantTitle}</strong> ({item.unit})
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border border-emerald-600 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="w-9 text-center text-xs font-black text-emerald-950">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-black text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.mrp > item.price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatPrice(item.mrp * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Bill Details & Promo */}
            <div className="space-y-4">
              {/* Coupon Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  Apply Coupon Code
                </h3>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div>
                      <span className="font-black text-emerald-900">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-emerald-700">
                        You saved {formatPrice(couponDiscount)}
                      </p>
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
                        placeholder="ENTER COUPON"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold uppercase outline-none focus:border-emerald-600"
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponInput)}
                        disabled={!couponInput.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        className={`text-[11px] font-medium mt-1.5 ${
                          couponMessage.success ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {couponMessage.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary Bill */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Bill Summary
                </h3>

                <div className="flex justify-between text-slate-600">
                  <span>Item Total (MRP)</span>
                  <span className="line-through">{formatPrice(totalMrp)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Product Savings</span>
                  <span>- {formatPrice(productSavings)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
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

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                  <span className="font-bold text-sm">Grand Total</span>
                  <span className="text-xl font-black text-emerald-800">
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => router.push('/checkout')}
                  disabled={!isMinimumOrderMet}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!isMinimumOrderMet && (
                  <p className="text-[11px] text-amber-700 text-center font-medium">
                    Add {formatPrice(amountNeededForMinOrder)} more to place order (Store Min: ₹{storeSettings.minimumOrderValue})
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
