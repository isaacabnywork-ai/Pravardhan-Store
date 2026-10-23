'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { StoreProvider } from '@/lib/context/StoreContext';
import { CartProvider } from '@/lib/context/CartContext';
import { CmsProvider } from '@/lib/context/CmsContext';
import { FloatingCart } from '@/components/cart/FloatingCart';
import { LocationConfirmModal } from '@/components/location/LocationConfirmModal';
import { PromoPopupModal } from '@/components/cms/PromoPopupModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <CmsProvider>
              {children}
              <FloatingCart />
              <LocationConfirmModal />
              <PromoPopupModal />
            </CmsProvider>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
