'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  QrCode,
  Banknote,
  AlertCircle,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { PaymentMethod, Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, addAddress } = useAuth();
  const {
    items,
    subtotal,
    totalMrp,
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
    clearCart,
  } = useCart();
  const { deliverySlots, storeSettings, createOrder } = useStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses[0]?.id || ''
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home' as 'Home' | 'Office' | 'Other',
    name: user?.name || '',
    phone: user?.phone || '',
    houseNumber: '',
    street: '',
    landmark: '',
    area: 'Sector 14',
    city: 'Gurugram',
    pincode: '122001',
  });

  // Step 2: Delivery Slot
  const [slotDateType, setSlotDateType] = useState<'TODAY' | 'TOMORROW'>('TODAY');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    deliverySlots.find((s) => s.dateType === 'TODAY')?.id || deliverySlots[0]?.id || ''
  );

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiVpa, setUpiVpa] = useState('rahul@okaxis');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Update selected address when user changes
  React.useEffect(() => {
    if (user && user.addresses.length > 0 && !selectedAddressId) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [user, selectedAddressId]);

  const activeSlots = deliverySlots.filter((s) => s.dateType === slotDateType);
  const selectedAddress = user?.addresses.find((a) => a.id === selectedAddressId);
  const selectedSlot = deliverySlots.find((s) => s.id === selectedSlotId);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.houseNumber || !newAddr.street || !newAddr.phone) {
      return;
    }
    addAddress(newAddr);
    setIsAddingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedAddress) {
      setOrderError('Please select or add a delivery address');
      return;
    }

    if (!selectedSlot) {
      setOrderError('Please select a delivery slot');
      return;
    }

    if (!isMinimumOrderMet) {
      setOrderError(`Minimum order value is ${formatPrice(storeSettings.minimumOrderValue)}. Add more items.`);
      return;
    }

    setOrderError('');
    setIsPlacingOrder(true);

    // Simulate payment gateway processing & server verification
    setTimeout(() => {
      const orderId = `ord-${Date.now()}`;
      const orderNumber = `PRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        deliveryAddress: selectedAddress,
        deliverySlot: selectedSlot,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          variantTitle: i.variantTitle,
          brand: i.brand,
          unit: i.unit,
          purchasedPrice: i.price, // Lock historical price
          purchasedMrp: i.mrp,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal,
        discount: productSavings,
        couponCode: appliedCoupon?.code,
        couponDiscount,
        deliveryCharge,
        deliveryTip,
        handlingFee,
        grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'ORDER_PLACED',
        statusHistory: [
          {
            status: 'ORDER_PLACED',
            label: 'Order Placed',
            timestamp: new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            }) + ', Today',
            note: paymentMethod === 'COD' ? 'Order confirmed with Cash on Delivery' : 'Online payment verified via Razorpay UPI',
            completed: true,
          },
          {
            status: 'ORDER_CONFIRMED',
            label: 'Order Confirmed',
            timestamp: 'Pending confirmation',
            note: 'Store manager verifying inventory',
            completed: false,
          },
          {
            status: 'BEING_PREPARED',
            label: 'Being Prepared',
            timestamp: 'Pending',
            completed: false,
          },
          {
            status: 'READY_FOR_DELIVERY',
            label: 'Ready for Delivery',
            timestamp: 'Pending',
            completed: false,
          },
          {
            status: 'OUT_FOR_DELIVERY',
            label: 'Out for Delivery',
            timestamp: 'Pending',
            completed: false,
          },
          {
            status: 'DELIVERED',
            label: 'Delivered',
            timestamp: `Expected: ${selectedSlot.timeSlot}`,
            completed: false,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createOrder(newOrder);
      clearCart();
      setIsPlacingOrder(false);
      router.push(`/account/orders/${orderId}`);
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-xs text-slate-500 mb-6">
              Add some items before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Browse Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-emerald-700">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Checkout</span>
        </nav>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
          Fast & Secure Checkout
        </h1>

        {/* Minimum order alert if not met */}
        {!isMinimumOrderMet && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Minimum Order of {formatPrice(storeSettings.minimumOrderValue)} Required
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Current order is {formatPrice(subtotal)}. Please add {formatPrice(amountNeededForMinOrder)} more of daily groceries or essentials to place this order.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-2 text-xs font-bold text-emerald-800 underline"
              >
                + Add more groceries
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: 1. Address, 2. Slot, 3. Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: Delivery Address */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-bold text-base text-slate-900">
                    Delivery Address
                  </h2>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form
                  onSubmit={handleSaveAddress}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800">Add New Address</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        House / Flat / Floor No.
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 304, Tower B"
                        value={newAddr.houseNumber}
                        onChange={(e) => setNewAddr({ ...newAddr, houseNumber: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Street / Society / Building
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Greenwood Enclave"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="Near Gate 1"
                        value={newAddr.landmark}
                        onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Area / Sector
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={newAddr.area}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={newAddr.pincode}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* Saved Addresses List */}
              {user && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            {addr.label}
                          </span>
                          {isSelected && (
                            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1">{addr.name}</p>
                        <p className="text-xs text-slate-600 leading-snug">
                          {addr.houseNumber}, {addr.street}
                        </p>
                        {addr.landmark && (
                          <p className="text-[11px] text-slate-400">Near {addr.landmark}</p>
                        )}
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          {addr.area}, {addr.city} - {addr.pincode}
                        </p>
                        <p className="text-[11px] text-slate-700 font-bold mt-1">
                          Ph: +91 {addr.phone}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  <p>No addresses found. Click &ldquo;Add New Address&rdquo; above.</p>
                </div>
              )}
            </div>

            {/* STEP 2: Delivery Slot (Spec Section 6) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      Select Delivery Slot
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Same-day or scheduled doorstep delivery
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Tabs: Today vs Tomorrow */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSlotDateType('TODAY');
                    const firstToday = deliverySlots.find((s) => s.dateType === 'TODAY');
                    if (firstToday) setSelectedSlotId(firstToday.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    slotDateType === 'TODAY'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Today (Same-Day Delivery)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSlotDateType('TOMORROW');
                    const firstTmrw = deliverySlots.find((s) => s.dateType === 'TOMORROW');
                    if (firstTmrw) setSelectedSlotId(firstTmrw.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    slotDateType === 'TOMORROW'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📅 Tomorrow (Morning / Evening)
                </button>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{slot.timeSlot}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {slot.dateLabel}
                          </p>
                        </div>
                      </div>
                      {slot.id === 'slot-express-now' ? (
                        <span className="text-[9px] font-black tracking-wider uppercase text-amber-950 bg-amber-400 px-2 py-0.5 rounded shadow-2xs flex-shrink-0">
                          ⚡ FASTEST
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex-shrink-0">
                          Available
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: Payment Method (Spec Section 11) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      Payment Method
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Secured by Indian Payment Gateway Abstraction (Razorpay / UPI)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <QrCode className="w-5 h-5 text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Instant digital payment with zero transaction fees
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pl-7">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="yourname@upi"
                          className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 max-w-xs outline-none"
                        />
                        <span className="text-xs text-emerald-700 font-bold self-center">
                          ✓ Verified VPA
                        </span>
                      </div>
                    </div>
                  )}
                </label>

                {/* Card Option */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <CreditCard className="w-5 h-5 text-blue-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Credit / Debit Card (RuPay, Visa, Mastercard)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        128-bit encrypted bank checkout
                      </p>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Pay via cash or UPI to the delivery executive upon arrival
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Order Review ({items.length} items)
              </h3>

              {/* Items Mini List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                {items.map((i) => (
                  <div key={i.variantId} className="py-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={i.image}
                        alt=""
                        className="w-9 h-9 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{i.productName}</p>
                        <p className="text-[10px] text-slate-400">
                          {i.variantTitle} × {i.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Partner Tip Selector */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>Delivery Partner Tip</span>
                  </span>
                  {deliveryTip > 0 && (
                    <button
                      type="button"
                      onClick={() => setDeliveryTip(0)}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {[10, 20, 30, 50].map((tipVal) => {
                    const isSelected = deliveryTip === tipVal;
                    return (
                      <button
                        key={tipVal}
                        type="button"
                        onClick={() => setDeliveryTip(isSelected ? 0 : tipVal)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{tipVal}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Details */}
              <div className="pt-3 border-t border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Items MRP Total</span>
                  <span className="line-through">{formatPrice(totalMrp)}</span>
                </div>
                {productSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Product Savings</span>
                    <span>- {formatPrice(productSavings)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-bold">
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                {handlingFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Handling Charge</span>
                    <span>{formatPrice(handlingFee)}</span>
                  </div>
                )}
                {deliveryTip > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Delivery Partner Tip</span>
                    <span>+{formatPrice(deliveryTip)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                  <span className="font-bold text-sm">Total Payable</span>
                  <span className="text-xl font-black text-emerald-800">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {orderError}
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !isMinimumOrderMet}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <span>Processing Secure Order...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Place Order • {formatPrice(grandTotal)}</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center space-y-1">
                <p>🔒 256-Bit SSL Encrypted Server Verification</p>
                <p>Delivery to {storeSettings.serviceArea}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
