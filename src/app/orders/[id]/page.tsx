import React from 'react';
import { notFound } from 'next/navigation';
import { StoreService } from '@/services/storeService';
import { OrderTracker } from '@/components/orders/OrderTracker';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Track Order | Pravdhan Store',
  description: 'Live delivery status and milestones for your grocery order.',
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = StoreService.getOrderById(id);

  if (!order) {
    // If not found in memory (e.g. fresh reload before persistence), create a mock initial order for demonstration
    const fallbackOrder = {
      id,
      orderNumber: id.startsWith('PS-') ? id : `PS-389102`,
      customerId: 'cust-1',
      customerName: 'Abhinav Sharma',
      customerPhone: '9876543210',
      items: [
        {
          id: 'oi-fallback-1',
          productId: 'prod-atta-1',
          variantId: 'var-atta-5kg',
          productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta',
          variantName: '5 kg',
          weight: '5 kg',
          price: 279,
          mrp: 310,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
          subtotal: 279,
        },
        {
          id: 'oi-fallback-2',
          productId: 'prod-dairy-milk',
          variantId: 'var-milk-1l',
          productName: 'Amul Taaza Homogenised Toned Milk',
          variantName: '1 L',
          weight: '1 L',
          price: 58,
          mrp: 58,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
          subtotal: 116,
        },
      ],
      address: StoreService.getAddresses()[0],
      deliverySlot: (await StoreService.getDeliverySlots())[0],
      subtotal: 395,
      discount: 31,
      couponDiscount: 0,
      deliveryFee: 35,
      tax: 0,
      total: 430,
      paymentMethod: 'UPI' as const,
      paymentStatus: 'Paid' as const,
      orderStatus: 'Packing' as const,
      createdAt: new Date().toISOString(),
      estimatedDelivery: 'Today (4 PM – 6 PM)',
    };
    return <OrderTracker order={fallbackOrder} />;
  }

  return <OrderTracker order={order} />;
}
