import React from 'react';
import { CartView } from '@/components/cart/CartView';

export const metadata = {
  title: 'My Cart | Pravardhan Store',
  description: 'Review your grocery basket, select scheduled delivery slot, and apply coupons.',
};

export default function CartPage() {
  return <CartView />;
}
