'use client';

import React from 'react';
import { AddressProvider } from './AddressContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AddressProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AddressProvider>
  );
}
