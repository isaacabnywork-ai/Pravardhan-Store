'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Promotion } from '@/types';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  appliedCoupon: Promotion | null;
  totalItemsCount: number;
  totalMrp: number;
  subtotal: number; // sum of item.price * quantity
  productSavings: number; // totalMrp - subtotal
  couponDiscount: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  deliveryTip: number;
  setDeliveryTip: (tip: number) => void;
  donationAmount: number;
  setDonationAmount: (amount: number) => void;
  handlingFee: number;
  smallCartFee: number;
  grandTotal: number;
  isMinimumOrderMet: boolean;
  amountNeededForMinOrder: number;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  openCartWithLocationCheck: (onConfirmedCallback?: () => void) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pravdhan_cart_v1';
const COUPON_STORAGE_KEY = 'pravdhan_coupon_v1';
const TIP_STORAGE_KEY = 'pravdhan_tip_v1';
const DONATION_STORAGE_KEY = 'pravdhan_donation_v1';
const ZONE_STORAGE_KEY = 'pravdhan_zone_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { storeSettings, promotions } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Promotion | null>(null);
  const [deliveryTip, setDeliveryTipState] = useState<number>(0);
  const [donationAmount, setDonationAmountState] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedZone, setSelectedZoneState] = useState('Sector 14, Model Town, Gurugram');
  const [onLocationConfirmAction, setOnLocationConfirmAction] = useState<(() => void) | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) setItems(JSON.parse(savedItems));

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));

      const savedTip = localStorage.getItem(TIP_STORAGE_KEY);
      if (savedTip) setDeliveryTipState(Number(savedTip));

      const savedDonation = localStorage.getItem(DONATION_STORAGE_KEY);
      if (savedDonation) setDonationAmountState(Number(savedDonation));

      const savedZone = localStorage.getItem(ZONE_STORAGE_KEY);
      if (savedZone) setSelectedZoneState(savedZone);
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setSelectedZone = (zone: string) => {
    setSelectedZoneState(zone);
    try {
      localStorage.setItem(ZONE_STORAGE_KEY, zone);
    } catch {
      // ignore
    }
    if (onLocationConfirmAction) {
      const action = onLocationConfirmAction;
      setOnLocationConfirmAction(null);
      action();
    }
  };

  const setDonationAmount = (amount: number) => {
    setDonationAmountState(amount);
    try {
      localStorage.setItem(DONATION_STORAGE_KEY, amount.toString());
    } catch {
      // ignore
    }
  };

  const openCartWithLocationCheck = (onConfirmedCallback?: () => void) => {
    if (onConfirmedCallback) {
      setOnLocationConfirmAction(() => onConfirmedCallback);
    }
    setIsLocationModalOpen(true);
  };

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  const saveCoupon = (coupon: Promotion | null) => {
    setAppliedCoupon(coupon);
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  const setDeliveryTip = (tip: number) => {
    setDeliveryTipState(tip);
    try {
      localStorage.setItem(TIP_STORAGE_KEY, tip.toString());
    } catch {
      // ignore
    }
  };

  const addToCart = (product: Product, variant: ProductVariant, qty: number = 1) => {
    const existingIndex = items.findIndex((i) => i.variantId === variant.id);

    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = Math.min(variant.stock, updated[existingIndex].quantity + qty);
      updated[existingIndex].quantity = newQty;
      saveItems(updated);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantTitle: variant.title,
        brand: product.brand,
        unit: variant.unit,
        price: variant.price,
        mrp: variant.mrp,
        image: variant.image || product.images[0] || '',
        quantity: Math.min(variant.stock, qty),
        maxStock: variant.stock,
      };
      saveItems([...items, newItem]);
    }
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    const updated = items.map((item) =>
      item.variantId === variantId
        ? { ...item, quantity: Math.min(item.maxStock, quantity) }
        : item
    );
    saveItems(updated);
  };

  const removeFromCart = (variantId: string) => {
    const updated = items.filter((i) => i.variantId !== variantId);
    saveItems(updated);
  };

  const clearCart = () => {
    saveItems([]);
    saveCoupon(null);
    setDeliveryTip(0);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productSavings = Math.max(0, totalMrp - subtotal);

  // Delivery charge & threshold calculation
  const freeDeliveryThreshold = storeSettings.freeDeliveryThreshold > 0 ? storeSettings.freeDeliveryThreshold : 149;
  const deliveryCharge = totalItemsCount === 0 || subtotal >= freeDeliveryThreshold ? 0 : (storeSettings.defaultDeliveryCharge || 30);
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const handlingFee = totalItemsCount > 0 ? 5 : 0; // Quick commerce nominal packaging & handling fee
  const smallCartFee = totalItemsCount > 0 && subtotal < 99 ? 20 : 0; // Standard small cart charge on orders under ₹99

  // Coupon calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'FLAT') {
      couponDiscount = appliedCoupon.discountValue;
    } else {
      const calc = (subtotal * appliedCoupon.discountValue) / 100;
      couponDiscount = appliedCoupon.maxDiscount
        ? Math.min(appliedCoupon.maxDiscount, calc)
        : calc;
    }
    couponDiscount = Math.min(subtotal, Math.round(couponDiscount));
  }

  const grandTotal = Math.max(
    0,
    subtotal - couponDiscount + deliveryCharge + deliveryTip + donationAmount + handlingFee + smallCartFee
  );

  const isMinimumOrderMet = subtotal >= storeSettings.minimumOrderValue;
  const amountNeededForMinOrder = Math.max(0, storeSettings.minimumOrderValue - subtotal);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = promotions.find((p) => p.code.toUpperCase() === clean && p.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Add items worth ₹${found.minOrderValue - subtotal} more to use this coupon`,
      };
    }

    saveCoupon(found);
    return {
      success: true,
      message: `Coupon '${found.code}' applied! Saved ₹${
        found.discountType === 'FLAT' ? found.discountValue : `${found.discountValue}%`
      }`,
    };
  };

  const removeCoupon = () => {
    saveCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items: mounted ? items : [],
        appliedCoupon: mounted ? appliedCoupon : null,
        totalItemsCount,
        totalMrp,
        subtotal,
        productSavings,
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
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        selectedZone,
        setSelectedZone,
        openCartWithLocationCheck,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
