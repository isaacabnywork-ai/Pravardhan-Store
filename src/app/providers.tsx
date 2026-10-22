'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { StoreProvider } from '@/lib/context/StoreContext';
import { CartProvider } from '@/lib/context/CartContext';
import { FloatingCart } from '@/components/cart/FloatingCart';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <FloatingCart />
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
