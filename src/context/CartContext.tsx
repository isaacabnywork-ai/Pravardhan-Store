'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '@/types';
import { StoreService } from '@/services/storeService';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  freeDelivery: boolean;
  amountNeededForFreeDelivery: number;
  total: number;
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  getItemQuantity: (variantId: string) => number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fresh_kirana_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('fresh_kirana_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Error hydrating cart:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('fresh_kirana_cart', JSON.stringify(items));
        if (appliedCoupon) {
          localStorage.setItem('fresh_kirana_coupon', JSON.stringify(appliedCoupon));
        } else {
          localStorage.removeItem('fresh_kirana_coupon');
        }
      } catch (e) {
        console.error('Error saving cart:', e);
      }
    }
  }, [items, appliedCoupon, isHydrated]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    const selectedVariant = variant || product.variants[0];
    if (!selectedVariant) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.variant.id === selectedVariant.id);
      if (existing) {
        // Increment quantity up to available stock
        const newQty = Math.min(selectedVariant.stock, existing.quantity + 1);
        return prev.map((i) =>
          i.variant.id === selectedVariant.id ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prev,
        {
          id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          variant: selectedVariant,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variant.id === variantId) {
          const validQty = Math.min(i.variant.stock, quantity);
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const getItemQuantity = (variantId: string): number => {
    const item = items.find((i) => i.variant.id === variantId);
    return item ? item.quantity : 0;
  };

  const applyCoupon = (code: string) => {
    const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
    const result = StoreService.validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Bill calculations
  const bill = StoreService.calculateBill(items, appliedCoupon);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        ...bill,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
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
