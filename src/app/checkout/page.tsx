'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Share2,
  Clock,
  Heart,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Gift,
  Bike,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Building2,
  CreditCard,
  Banknote,
  Wallet,
  MapPin,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useStore } from '@/lib/context/StoreContext';
import { PaymentMethod, Order } from '@/types';
import { AuthModal } from '@/components/auth/AuthModal';
import { RazorpayPaymentModal } from '@/components/checkout/RazorpayPaymentModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    items,
    subtotal,
    totalMrp,
    productSavings,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    deliveryTip,
    setDeliveryTip,
    donationAmount,
    setDonationAmount,
    handlingFee,
    smallCartFee,
    grandTotal,
    isMinimumOrderMet,
    amountNeededForMinOrder,
    addToCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    selectedZone,
    setIsLocationModalOpen,
  } = useCart();

  const { products, deliverySlots, storeSettings, promotions, createOrder } = useStore();

  // Modals & States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Record<string, boolean>>({});

  // GSTIN accordion
  const [isGstinOpen, setIsGstinOpen] = useState(false);
  const [gstinNumber, setGstinNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstinSaved, setGstinSaved] = useState(false);

  // Custom Tip & Donation inputs
  const [isCustomTipOpen, setIsCustomTipOpen] = useState(false);
  const [customTipInput, setCustomTipInput] = useState('');
  const [isCustomDonationOpen, setIsCustomDonationOpen] = useState(false);
  const [customDonationInput, setCustomDonationInput] = useState('');

  // Coupon input inside modal
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Delivery & Payment
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses[0]?.id || 'default-zone'
  );
  const [slotDateType, setSlotDateType] = useState<'TODAY' | 'TOMORROW'>('TODAY');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    deliverySlots.find((s) => s.dateType === 'TODAY')?.id || deliverySlots[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [pendingOrder, setPendingOrder] = useState<{ liveOrder: any; frontendOrder: Order } | null>(null);

  const checkoutSectionRef = useRef<HTMLDivElement>(null);

  // Auto-select address when user logs in
  useEffect(() => {
    if (user && user.addresses.length > 0 && (!selectedAddressId || selectedAddressId === 'default-zone')) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [user, selectedAddressId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pravdhan Store Checkout',
          text: `Check out these ${items.length} fresh items from Pravdhan Store!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const toggleWishlist = (productId: string, productName: string) => {
    setWishlistItems((prev) => {
      const next = !prev[productId];
      showToast(next ? `Added ${productName} to wishlist` : `Removed from wishlist`);
      return { ...prev, [productId]: next };
    });
  };

  // Related products: filter out items currently in cart
  const cartVariantIds = useMemo(() => new Set(items.map((i) => i.variantId)), [items]);
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'PUBLISHED' && p.variants.some((v) => !cartVariantIds.has(v.id)))
      .slice(0, 9);
  }, [products, cartVariantIds]);

  // Search filtered products
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.status === 'PUBLISHED' &&
        (p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q))
    );
  }, [searchQuery, products]);

  // Address logic
  const selectedAddress = user?.addresses.find((a) => a.id === selectedAddressId) || {
    id: 'zone-address',
    userId: user?.id || 'guest-user',
    label: 'Home' as const,
    name: user?.name || 'Valued Customer',
    phone: user?.phone || '9876543210',
    houseNumber: 'Plot 42B',
    street: 'Main Street',
    landmark: 'Near Metro Station',
    area: selectedZone || 'Sector 14',
    city: 'Gurugram',
    pincode: '122001',
    isDefault: true,
  };

  const activeSlots = deliverySlots.filter((s) => s.dateType === slotDateType);
  const selectedSlot = deliverySlots.find((s) => s.id === selectedSlotId) || deliverySlots[0];

  const handleApplyCouponModal = (code: string) => {
    const res = applyCoupon(code);
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setIsCouponsModalOpen(false);
        setCouponFeedback(null);
      }, 1000);
    }
  };

  // Place Order handler
  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (items.length === 0) {
      setOrderError('Your cart is empty. Add items to checkout.');
      return;
    }

    if (!isMinimumOrderMet) {
      setOrderError(`Minimum order value is ₹${storeSettings.minimumOrderValue}. Add items worth ₹${amountNeededForMinOrder} more.`);
      return;
    }

    setIsPlacingOrder(true);
    setOrderError('');

    const generatedOrderId = `ord-${Date.now()}`;
    const generatedOrderNumber = `PRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let liveOrder = {
      id: generatedOrderId,
      orderNumber: generatedOrderNumber,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    };

    try {
      const liveOrderPayload = {
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email || '',
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.productName,
          packSize: i.unit,
          price: i.price,
          mrp: i.mrp,
          quantity: i.quantity,
          imageUrl: i.image || '',
        })),
        deliveryAddress: {
          label: selectedAddress.label,
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          houseNumber: selectedAddress.houseNumber,
          street: selectedAddress.street,
          landmark: selectedAddress.landmark,
          area: selectedAddress.area,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        slotDate: slotDateType,
        slotTime: selectedSlot?.timeSlot || 'Express 8-min Delivery',
        paymentMethod,
        tipAmount: deliveryTip,
        donationAmount,
        handlingFee,
        smallCartFee,
        gstin: gstinSaved ? gstinNumber : undefined,
        businessName: gstinSaved ? businessName : undefined,
        subtotal,
        deliveryCharge,
        couponDiscount,
        couponCode: appliedCoupon?.code,
        grandTotal,
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liveOrderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        liveOrder = data.data;
      }
    } catch {
      // Graceful fallback to client store order
    }

    // Sync frontend order state
    const frontendOrder: Order = {
      id: liveOrder.id,
      orderNumber: liveOrder.orderNumber,
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
        purchasedPrice: i.price,
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
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      orderStatus: 'ORDER_PLACED',
      statusHistory: [
        {
          status: 'ORDER_PLACED',
          label: 'Order Placed',
          timestamp: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ', Today',
          completed: true,
          note: paymentMethod === 'COD'
            ? 'Order confirmed with Cash on Delivery'
            : 'Online payment awaiting gateway confirmation',
        },
        {
          status: 'ORDER_CONFIRMED',
          label: 'Order Confirmed',
          timestamp: '',
          completed: false,
          note: 'Store is preparing your shipment',
        },
        {
          status: 'BEING_PREPARED',
          label: 'Being Packed',
          timestamp: '',
          completed: false,
        },
        {
          status: 'READY_FOR_DELIVERY',
          label: 'Ready for Delivery',
          timestamp: '',
          completed: false,
        },
        {
          status: 'OUT_FOR_DELIVERY',
          label: 'Out for Delivery',
          timestamp: '',
          completed: false,
        },
        {
          status: 'DELIVERED',
          label: 'Delivered',
          timestamp: `Expected: ${selectedSlot?.timeSlot || 'in 8 mins'}`,
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
      setPendingOrder({ liveOrder, frontendOrder });
      setIsPlacingOrder(false);
      setIsRazorpayModalOpen(true);
      return;
    }

    // COD
    createOrder(frontendOrder);
    clearCart();
    setIsPlacingOrder(false);
    router.push(`/account/orders/${liveOrder.id}`);
  };

  const handleRazorpaySuccess = async (paymentId: string) => {
    if (!pendingOrder) return;
    setIsRazorpayModalOpen(false);
    setIsPlacingOrder(true);

    try {
      await fetch(`/api/v1/orders/${pendingOrder.liveOrder.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayPaymentId: paymentId }),
      });
    } catch {
      // ignore
    }

    const confirmedOrder: Order = {
      ...pendingOrder.frontendOrder,
      paymentStatus: 'PAID',
      orderStatus: 'ORDER_CONFIRMED',
      statusHistory: pendingOrder.frontendOrder.statusHistory.map((s) =>
        s.status === 'ORDER_CONFIRMED'
          ? {
              ...s,
              completed: true,
              timestamp: new Date().toISOString(),
              note: `Paid online via Razorpay (Payment ID: ${paymentId})`,
            }
          : s
      ),
      updatedAt: new Date().toISOString(),
    };

    createOrder(confirmedOrder);
    clearCart();
    setIsPlacingOrder(false);
    router.push(`/account/orders/${pendingOrder.liveOrder.id}`);
  };

  const handleRazorpayFailure = (errorMessage: string) => {
    setIsRazorpayModalOpen(false);
    setOrderError(errorMessage);
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-slate-500 mb-6">
            Looks like you haven&apos;t added anything to your cart yet. Explore thousands of everyday essentials delivered in 8 minutes!
          </p>
          <Link
            href="/"
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Start Shopping
          </Link>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-28 sm:pb-16 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">Checkout</h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Deliver to:</span>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-0.5 truncate max-w-[160px] sm:max-w-xs"
                >
                  <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span className="truncate">{selectedZone}</span>
                </button>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search products"
              className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share cart"
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Unified Page Content */}
      <main className="max-w-2xl mx-auto w-full px-3 py-3 space-y-3">
        {/* TOP SECTION: Delivery in 8 minutes + Cart items */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          {/* 8-minute delivery banner */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Delivery in 8 minutes</h2>
              <p className="text-xs text-slate-500 font-medium">
                Shipment of {items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Cart items list */}
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const mrpTotal = item.mrp * item.quantity;
              const priceTotal = item.price * item.quantity;
              const hasDiscount = item.mrp > item.price;

              return (
                <div key={item.variantId} className="py-3 flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Title & Details */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {item.productName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {item.unit}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(item.productId, item.productName)}
                      className="text-[11px] text-slate-400 hover:text-emerald-700 font-medium mt-1 inline-flex items-center gap-1 transition-colors"
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          wishlistItems[item.productId] ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>Move to wishlist</span>
                    </button>
                  </div>

                  {/* Stepper & Price */}
                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    {/* Green Stepper Pill */}
                    <div className="flex items-center bg-emerald-700 text-white rounded-lg shadow-xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label={`Decrease ${item.productName} quantity`}
                        className="w-7 h-7 flex items-center justify-center hover:bg-emerald-800 transition-colors active:scale-95 text-white"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="w-6 text-center text-xs font-black select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label={`Increase ${item.productName} quantity`}
                        className="w-7 h-7 flex items-center justify-center hover:bg-emerald-800 transition-colors active:scale-95 text-white"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Price display */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {hasDiscount && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{mrpTotal}
                          </span>
                        )}
                        <span className="text-xs font-black text-slate-900">
                          ₹{priceTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RELATED PRODUCTS: "You might also like" */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-900">You might also like</h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              <span>See more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Related products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedProducts.map((p) => {
              const defaultVariant = p.variants[0];
              const inCartItem = items.find((i) => i.variantId === defaultVariant?.id);
              const isWishlisted = !!wishlistItems[p.id];

              return (
                <div
                  key={p.id}
                  className="border border-slate-100 rounded-xl p-2.5 flex flex-col justify-between bg-slate-50/50 hover:border-emerald-200 transition-all group"
                >
                  {/* Top Heart and Image */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id, p.name)}
                      aria-label="Wishlist"
                      className="absolute top-1 right-1 z-10 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-xs"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                    <div className="aspect-square w-full rounded-lg bg-white overflow-hidden relative flex items-center justify-center mb-2">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-contain p-1.5 group-hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 150px, 200px"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                  </div>

                  {/* Pack size & ADD button bar */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate">
                      {defaultVariant?.unit || '1 unit'}
                    </span>

                    {inCartItem ? (
                      <div className="flex items-center bg-emerald-700 text-white rounded-md overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(inCartItem.variantId, inCartItem.quantity - 1)}
                          className="px-1.5 py-0.5 hover:bg-emerald-800 active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1 font-black text-[11px]">{inCartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(inCartItem.variantId, inCartItem.quantity + 1)}
                          className="px-1.5 py-0.5 hover:bg-emerald-800 active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => defaultVariant && addToCart(p, defaultVariant, 1)}
                        className="px-2.5 py-1 text-[11px] font-black text-emerald-700 bg-white border border-emerald-600 rounded-md hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
                      >
                        ADD
                      </button>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-slate-900">
                      ₹{defaultVariant?.price || 0}
                    </span>
                    {defaultVariant && defaultVariant.mrp > defaultVariant.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{defaultVariant.mrp}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 mt-0.5 leading-tight">
                    {p.name}
                  </h4>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                    <span className="text-amber-500 font-bold">★ 4.8</span>
                    <span>(2.4k)</span>
                  </div>

                  {/* "See more like this" link */}
                  <Link
                    href={`/shop?category=${p.categoryId}`}
                    className="text-[10px] font-bold text-slate-400 hover:text-emerald-700 mt-1 flex items-center gap-0.5"
                  >
                    <span>See more like this</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM SECTION: Checkout details as in image 3 */}

        {/* 1. Free Delivery Progress Banner */}
        <section className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bike className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-700">
                  {subtotal >= freeDeliveryThreshold ? 'FREE delivery unlocked!' : 'Get FREE delivery'}
                </span>
                {subtotal < freeDeliveryThreshold && (
                  <span className="text-[11px] font-bold text-slate-600">
                    Add products worth ₹{amountNeededForFreeDelivery} more &rsaquo;
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    subtotal >= freeDeliveryThreshold ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Coupons Banner */}
        <section className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
          {appliedCoupon ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">
                  Coupon <span className="text-emerald-700 uppercase font-black">{appliedCoupon.code}</span> applied!
                </span>
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
            <button
              type="button"
              onClick={() => setIsCouponsModalOpen(true)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-700 px-1 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>See all coupons</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </section>

        {/* 3. Detailed Bill details card (Exact match to reference image) */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
          <h2 className="text-sm font-black text-slate-900">Bill details</h2>

          <div className="space-y-2 text-xs">
            {/* Items total */}
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <span>Items total</span>
                {productSavings > 0 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Saved ₹{productSavings}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {productSavings > 0 && (
                  <span className="line-through text-slate-400">₹{totalMrp}</span>
                )}
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
            </div>

            {/* Delivery charge */}
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <Bike className="w-3.5 h-3.5 text-slate-400" />
                <span className="underline decoration-dotted decoration-slate-300">
                  Delivery charge
                </span>
              </div>
              <span className="font-bold text-slate-900">
                {deliveryCharge === 0 ? (
                  <span className="text-emerald-600 uppercase font-black">FREE</span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>

            {/* Handling charge */}
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                <span className="underline decoration-dotted decoration-slate-300">
                  Handling charge
                </span>
              </div>
              <span className="font-bold text-slate-900">₹{handlingFee}</span>
            </div>

            {/* Small cart charge */}
            {smallCartFee > 0 && (
              <div>
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                    <span className="underline decoration-dotted decoration-slate-300">
                      Small cart charge
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">₹{smallCartFee}</span>
                </div>
                <p className="text-[10px] text-amber-700 font-medium pl-5 mt-0.5">
                  No small cart charge on orders above ₹99
                </p>
              </div>
            )}

            {/* Coupon discount */}
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                </div>
                <span>-₹{couponDiscount}</span>
              </div>
            )}

            {/* Feeding India Donation */}
            {donationAmount > 0 && (
              <div className="flex items-center justify-between text-rose-700 font-bold">
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Feeding India Donation</span>
                </div>
                <span>+₹{donationAmount}</span>
              </div>
            )}

            {/* Delivery Partner Tip */}
            {deliveryTip > 0 && (
              <div className="flex items-center justify-between text-amber-700 font-bold">
                <div className="flex items-center gap-2">
                  <Bike className="w-3.5 h-3.5 text-amber-600" />
                  <span>Delivery Partner Tip</span>
                </div>
                <span>+₹{deliveryTip}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-sm font-black text-slate-900 underline decoration-dotted decoration-slate-300">
                Grand total
              </span>
              <span className="text-base font-black text-slate-900">
                ₹{grandTotal}
              </span>
            </div>
          </div>
        </section>

        {/* 4. Add GSTIN Card */}
        <section className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80">
          <div
            onClick={() => setIsGstinOpen(!isGstinOpen)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">
                  {gstinSaved ? `GSTIN: ${gstinNumber}` : 'Add GSTIN'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {gstinSaved ? businessName : 'Claim GST input credit up to 18% on your order'}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isGstinOpen ? 'rotate-90' : ''
              }`}
            />
          </div>

          {isGstinOpen && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <input
                type="text"
                placeholder="Enter 15-digit GSTIN (e.g. 06AAAAA0000A1Z5)"
                value={gstinNumber}
                onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                maxLength={15}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                placeholder="Registered Legal Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
              <div className="flex gap-2 justify-end pt-1">
                {gstinSaved && (
                  <button
                    type="button"
                    onClick={() => {
                      setGstinNumber('');
                      setBusinessName('');
                      setGstinSaved(false);
                      setIsGstinOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs text-rose-600 font-bold hover:underline"
                  >
                    Clear GSTIN
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (gstinNumber.trim().length >= 10) {
                      setGstinSaved(true);
                      setIsGstinOpen(false);
                      showToast('GST details saved successfully');
                    } else {
                      showToast('Please enter a valid GSTIN');
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                >
                  Save GSTIN
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 5. Join us at Feeding India Banner */}
        <section className="bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 rounded-2xl p-4 shadow-xs border border-sky-100 relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div className="max-w-[70%]">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>Join us at feeding india</span>
                <span className="text-rose-500">❤</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                Together, we can fuel young minds to grow, learn, and thrive
              </p>
            </div>
            {/* Playful illustration tag */}
            <div className="text-right">
              <span className="text-2xl select-none">🪁</span>
            </div>
          </div>

          <div className="mt-3 pt-2">
            <p className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center gap-1">
              <span>Donate with this order</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </p>
            <div className="flex gap-2">
              {[
                { val: 5, label: '₹5' },
                { val: 10, label: '₹10' },
                { val: 15, label: '₹15', badge: '1 MEAL' },
              ].map((item) => {
                const isSelected = donationAmount === item.val;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setDonationAmount(isSelected ? 0 : item.val);
                      setIsCustomDonationOpen(false);
                    }}
                    className={`flex-1 relative py-2 rounded-xl text-xs font-black border transition-all ${
                      isSelected
                        ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-emerald-300 whitespace-nowrap">
                        {item.badge}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsCustomDonationOpen(!isCustomDonationOpen)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isCustomDonationOpen || (donationAmount > 0 && ![5, 10, 15].includes(donationAmount))
                    ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustomDonationOpen && (
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  placeholder="Enter donation amount (₹)"
                  value={customDonationInput}
                  onChange={(e) => setCustomDonationInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    const amt = Number(customDonationInput);
                    if (amt > 0) {
                      setDonationAmount(amt);
                      showToast(`Added ₹${amt} donation`);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 6. Tip your delivery partner Card */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-start justify-between">
            <div className="max-w-[70%]">
              <h3 className="text-xs font-black text-slate-900">Tip your delivery partner</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-2xl select-none">
              🛵
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {[
              { val: 20, emoji: '😀' },
              { val: 30, emoji: '🤩' },
              { val: 50, emoji: '😍' },
            ].map((tip) => {
              const isSelected = deliveryTip === tip.val;
              return (
                <button
                  key={tip.val}
                  type="button"
                  onClick={() => {
                    setDeliveryTip(isSelected ? 0 : tip.val);
                    setIsCustomTipOpen(false);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm ring-2 ring-amber-400/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tip.emoji}</span>
                  <span>₹{tip.val}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsCustomTipOpen(!isCustomTipOpen)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                isCustomTipOpen || (deliveryTip > 0 && ![20, 30, 50].includes(deliveryTip))
                  ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🥳</span>
              <span>Custom</span>
            </button>
          </div>

          {isCustomTipOpen && (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="Enter tip amount (₹)"
                value={customTipInput}
                onChange={(e) => setCustomTipInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  const amt = Number(customTipInput);
                  if (amt > 0) {
                    setDeliveryTip(amt);
                    showToast(`Added ₹${amt} delivery tip`);
                  }
                }}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-600"
              >
                Apply
              </button>
            </div>
          )}
        </section>

        {/* 7. Gift Packaging Card */}
        <section className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">Gift Packaging</h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Apologies, currently unavailable at this location
            </p>
          </div>
        </section>

        {/* 8. Cancellation Policy Card */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <h4 className="text-xs font-black text-slate-900">Cancellation Policy</h4>
          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
            Once order placed, any cancellation may result in a fee. In case of unexpected delays leading to order cancellation, a complete refund will be provided.
          </p>
        </section>

        {/* 9. Delivery Address & Slot Picker Section */}
        <section ref={checkoutSectionRef} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900">Delivery Address</h2>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              <span>Change</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-3">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900">{selectedAddress.label}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                  Fastest 8-min delivery
                </span>
              </div>
              <p className="text-slate-600 font-medium mt-0.5">
                {selectedAddress.houseNumber}, {selectedAddress.street}, {selectedAddress.area}, {selectedAddress.city} - {selectedAddress.pincode}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Recipient: {selectedAddress.name} ({selectedAddress.phone})
              </p>
            </div>
          </div>

          {/* Delivery Slot Selector */}
          <div>
            <h3 className="text-xs font-black text-slate-900 mb-2">Delivery Time Slot</h3>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSlotDateType('TODAY')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  slotDateType === 'TODAY'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Today (Instant)
              </button>
              <button
                type="button"
                onClick={() => setSlotDateType('TOMORROW')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  slotDateType === 'TOMORROW'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tomorrow
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeSlots.slice(0, 4).map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-2 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{slot.timeSlot}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-xs font-black text-slate-900 mb-2">Payment Option</h3>
            <div className="space-y-2">
              {[
                {
                  id: 'UPI' as PaymentMethod,
                  title: 'Pay Online (UPI, Cards, NetBanking)',
                  subtitle: 'Fast, secure checkout via Razorpay Test Gateway',
                  icon: CreditCard,
                  badge: 'Instant 8-min',
                },
                {
                  id: 'COD' as PaymentMethod,
                  title: 'Cash on Delivery (COD)',
                  subtitle: 'Pay cash or scan QR at your doorstep',
                  icon: Banknote,
                  badge: null,
                },
                {
                  id: 'CARD' as PaymentMethod,
                  title: 'Credit / Debit Card',
                  subtitle: 'Visa, MasterCard, RuPay, Amex',
                  icon: Wallet,
                  badge: 'Instant',
                },
              ].map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{opt.title}</span>
                          {opt.badge && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{opt.subtitle}</p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error message banner */}
        {orderError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR (Exact match to reference image green bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-2xl p-3 sm:py-3.5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-slate-500">Total</span>
              <span className="text-lg font-black text-slate-900">₹{grandTotal}</span>
              {productSavings > 0 && (
                <span className="text-[11px] font-bold text-emerald-700">
                  (Saved ₹{productSavings})
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
              {selectedAddress.area}, {selectedAddress.city}
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || !isMinimumOrderMet}
            className="flex-1 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPlacingOrder ? (
              <span>Placing Order...</span>
            ) : paymentMethod === 'COD' ? (
              <span>Place Order (COD) • ₹{grandTotal}</span>
            ) : (
              <span>Proceed to Pay • ₹{grandTotal}</span>
            )}
          </button>
        </div>
      </div>

      {/* SEARCH MODAL */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col p-4">
          <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-3 border-b border-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products to add to cart..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 text-xs outline-none"
              />
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 divide-y divide-slate-100 flex-1">
              {searchedProducts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  {searchQuery ? 'No matching products found.' : 'Type to search products'}
                </p>
              ) : (
                searchedProducts.map((p) => {
                  const defVar = p.variants[0];
                  return (
                    <div key={p.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 relative overflow-hidden shrink-0 border border-slate-200">
                          {p.images[0] && (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-slate-500">₹{defVar?.price}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (defVar) addToCart(p, defVar, 1);
                          showToast(`Added ${p.name}`);
                          setIsSearchModalOpen(false);
                        }}
                        className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                      >
                        ADD
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* COUPONS MODAL */}
      {isCouponsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900">Apply Coupon</h3>
              <button
                onClick={() => setIsCouponsModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input */}
            <div className="py-3 flex gap-2">
              <input
                type="text"
                placeholder="Enter promo coupon code"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => handleApplyCouponModal(couponCodeInput)}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
              >
                Apply
              </button>
            </div>

            {couponFeedback && (
              <p
                className={`text-xs font-bold mb-2 ${
                  couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {couponFeedback.text}
              </p>
            )}

            {/* Available Promotions */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              <p className="text-xs font-bold text-slate-500">Available Coupons</p>
              {promotions.filter((p) => p.isActive).map((promo) => (
                <div
                  key={promo.id}
                  className="p-3 border border-dashed border-emerald-300 rounded-xl bg-emerald-50/40 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {promo.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {promo.discountType === 'FLAT' ? `Save ₹${promo.discountValue}` : `${promo.discountValue}% OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{promo.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Min order: ₹{promo.minOrderValue}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCouponModal(promo.code)}
                    className="px-3 py-1 bg-white border border-emerald-600 text-emerald-700 font-black text-xs rounded-lg hover:bg-emerald-50 active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth & Razorpay Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <RazorpayPaymentModal
        isOpen={isRazorpayModalOpen}
        orderId={pendingOrder?.liveOrder?.id || ''}
        orderNumber={pendingOrder?.liveOrder?.orderNumber || ''}
        amount={grandTotal}
        customerName={user?.name || ''}
        customerPhone={user?.phone || ''}
        customerEmail={user?.email}
        onSuccess={handleRazorpaySuccess}
        onFailure={handleRazorpayFailure}
        onClose={() => setIsRazorpayModalOpen(false)}
      />
      <Footer />
    </div>
  );
}
