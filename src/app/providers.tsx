'use client';

import React from 'react';
import { AuthProvider } from '@/lib/context/AuthContext';
import { StoreProvider } from '@/lib/context/StoreContext';
import { CartProvider } from '@/lib/context/CartContext';
import { FloatingCart } from '@/components/cart/FloatingCart';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <FloatingCart />
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
