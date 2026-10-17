import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Plus,
  Home,
  Briefcase,
  Smartphone,
  Banknote,
  ArrowLeft,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Address } from '@/types';

export const CheckoutScreen: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartSavings,
    couponDiscount,
    deliveryFee,
    grandTotal,
    appliedCoupon,
    addresses,
    selectedAddress,
    setDefaultAddress,
    addAddress,
    deliverySlots,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    placeOrder,
    setCustomerPage,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (Google Pay / PhonePe)');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [newAddressForm, setNewAddressForm] = useState<Omit<Address, 'id'>>({
    name: 'Rahul Sharma',
    phone: '9876543210',
    houseNo: '',
    street: '',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    type: 'home',
    isDefault: true,
  });

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-base font-bold text-[#1C1C1C]">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Add items before proceeding to checkout.
        </p>
        <Button variant="primary" onClick={() => setCustomerPage('home')}>
          Return to Shopping
        </Button>
      </div>
    );
  }

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.houseNo.trim()) return;
    addAddress(newAddressForm);
    setIsAddingNewAddress(false);
  };

  const handleConfirmOrder = () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      placeOrder(paymentMethod);
      setIsPlacingOrder(false);
      setCustomerPage('order-confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20">
      {/* Checkout Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
        <button
          onClick={() => setCustomerPage('cart')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0C831F] text-white flex items-center justify-center font-black text-xs">
            P
          </div>
          <span className="text-xs sm:text-sm font-black text-[#1C1C1C] tracking-tight">
            PRABHANDHAN CHECKOUT
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#0C831F] font-bold bg-[#F0F8F1] px-2 py-0.5 rounded">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100% Safe</span>
        </div>
      </div>

      {/* Single-Page Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Address + Slot + Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Section 1: Delivery Address */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0C831F]" />
                <h2 className="text-xs sm:text-sm font-black text-[#1C1C1C] uppercase tracking-wider">
                  Delivery Address
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNewAddress ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {/* Address Selection Cards */}
            <div className="space-y-2">
              {addresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setDefaultAddress(addr.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#0C831F] bg-[#F0F8F1] ring-1 ring-[#0C831F]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#0C831F] bg-[#0C831F]' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#1C1C1C]">
                        <span>{addr.name}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5 leading-tight truncate">
                        {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Add Address Form */}
            {isAddingNewAddress && (
              <form onSubmit={handleAddNewAddressSubmit} className="pt-3 border-t border-gray-100 space-y-2.5">
                <span className="text-xs font-bold text-gray-700 block">Enter New Address</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Flat / House No. / Building"
                    required
                    value={newAddressForm.houseNo}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, houseNo: e.target.value })}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
                  />
                  <input
                    type="text"
                    placeholder="Street / Society"
                    value={newAddressForm.street}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
                  />
                  <input
                    type="text"
                    placeholder="Area / Locality"
                    value={newAddressForm.area}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, area: e.target.value })}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddressForm.pincode}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm">
                  Save Address
                </Button>
              </form>
            )}
          </section>

          {/* Section 2: Delivery Slot */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0C831F]" />
              <h2 className="text-xs sm:text-sm font-black text-[#1C1C1C] uppercase tracking-wider">
                Delivery Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deliverySlots.slice(0, 4).map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#0C831F] bg-[#F0F8F1] ring-1 ring-[#0C831F]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-[#1C1C1C]">{slot.date}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5">{slot.time}</p>
                    </div>
                    {slot.badge && (
                      <span className="text-[10px] font-black uppercase text-[#0C831F] bg-white border border-[#CBE8CE] px-1.5 py-0.5 rounded">
                        {slot.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Payment Method */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0C831F]" />
              <h2 className="text-xs sm:text-sm font-black text-[#1C1C1C] uppercase tracking-wider">
                Payment Method
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { id: 'UPI (Google Pay / PhonePe)', label: 'UPI (Instant via Google Pay, PhonePe, Paytm)', icon: Smartphone },
                { id: 'Credit or Debit Card', label: 'Credit / Debit Card (Visa, Mastercard, RuPay)', icon: CreditCard },
                { id: 'Cash on Delivery', label: 'Cash on Delivery (Pay at doorstep)', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#0C831F] bg-[#F0F8F1] ring-1 ring-[#0C831F]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#0C831F] bg-[#0C831F]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="font-bold text-[#1C1C1C]">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Place Order (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-4">
            <h3 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider">
              Order Summary ({cart.length} items)
            </h3>

            {/* Quick Items Thumbnail list */}
            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-8 h-8 object-contain rounded bg-gray-50 p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#1C1C1C] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {item.variant.weight} &times; {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-[#1C1C1C] shrink-0">
                    ₹{item.variant.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
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
                  <span>Coupon ({appliedCoupon?.code})</span>
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
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Prominent Place Order CTA */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isPlacingOrder}
              onClick={handleConfirmOrder}
              className="py-3.5 font-black text-sm tracking-wide shadow-md"
            >
              <span>Place Order</span>
              <span className="mx-2">•</span>
              <span>₹{grandTotal}</span>
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0C831F]" />
              <span>Safe and encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
