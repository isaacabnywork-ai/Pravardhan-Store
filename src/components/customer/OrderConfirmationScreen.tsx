import React, { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const OrderConfirmationScreen: React.FC = () => {
  const {
    orders,
    activeOrderId,
    navigateToOrderTracking,
    setCustomerPage,
  } = useStore();

  const currentOrder = useMemo(() => {
    return orders.find((o) => o.id === activeOrderId) || orders[0];
  }, [orders, activeOrderId]);

  if (!currentOrder) {
    return (
      <div className="text-center py-16">
        <h3 className="text-base font-bold text-[#1C1C1C]">No recent order found</h3>
        <Button onClick={() => setCustomerPage('home')} className="mt-4">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-5 pb-16">
      {/* Confirmation Hero Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-soft text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>

        <div>
          <span className="text-xs font-black text-[#0C831F] uppercase tracking-wider bg-[#F0F8F1] px-2.5 py-0.5 rounded">
            Order Confirmed
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-[#1C1C1C] mt-2">
            Your groceries are being packed!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Order ID: <strong className="text-[#1C1C1C]">#{currentOrder.orderNumber}</strong>
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#0C831F] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery Slot</span>
              <p className="font-bold text-[#1C1C1C]">{currentOrder.deliverySlot.time}</p>
              <p className="text-[11px] text-gray-500">{currentOrder.deliverySlot.date}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#0C831F] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery To</span>
              <p className="font-bold text-[#1C1C1C] truncate">{currentOrder.address.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{currentOrder.address.area}, {currentOrder.address.pincode}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-[#0C831F] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Paid</span>
              <p className="font-bold text-[#1C1C1C]">₹{currentOrder.total}</p>
              <p className="text-[11px] text-[#0C831F] font-bold">{currentOrder.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-bold"
            onClick={() => navigateToOrderTracking(currentOrder.id)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Track Order Live
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto font-bold"
            onClick={() => setCustomerPage('home')}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Continue Shopping
          </Button>
        </div>
      </div>

      {/* Items Preview */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft space-y-3">
        <h3 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>Items Ordered ({currentOrder.items.length})</span>
          {currentOrder.savings > 0 && (
            <span className="text-xs text-[#0C831F] font-bold">
              Total Saved: ₹{currentOrder.savings + (currentOrder.couponDiscount || 0)}
            </span>
          )}
        </h3>

        <div className="divide-y divide-gray-100">
          {currentOrder.items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.images[0]}
                  alt=""
                  className="w-9 h-9 object-contain bg-gray-50 rounded p-1 shrink-0"
                />
                <div>
                  <p className="font-bold text-[#1C1C1C]">{item.product.name}</p>
                  <p className="text-gray-500 text-[11px]">
                    {item.variant.weight} &times; {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-black text-[#1C1C1C]">
                ₹{item.variant.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
