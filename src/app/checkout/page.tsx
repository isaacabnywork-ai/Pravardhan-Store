import React from 'react';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata = {
  title: 'Secure Checkout | Pravardhan Store',
  description: 'Complete your grocery order with scheduled delivery slot and flexible payment options.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
