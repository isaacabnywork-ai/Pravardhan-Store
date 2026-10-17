import React, { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Clock,
  Phone,
  Package,
  MapPin,
  ArrowLeft,
  RotateCcw,
  Bike,
} from 'lucide-react';
import { OrderStatus } from '@/types';

export const OrderTrackingScreen: React.FC = () => {
  const {
    orders,
    activeOrderId,
    setCustomerPage,
    updateOrderStatus,
    addToCart,
    showToast,
  } = useStore();

  const currentOrder = useMemo(() => {
    return orders.find((o) => o.id === activeOrderId) || orders[0];
  }, [orders, activeOrderId]);

  if (!currentOrder) {
    return (
      <div className="text-center py-16">
        <h3 className="text-base font-bold text-[#1C1C1C]">No order selected</h3>
        <Button onClick={() => setCustomerPage('orders')} className="mt-4">
          View All Orders
        </Button>
      </div>
    );
  }

  const statusProgression: OrderStatus[] = [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT FOR DELIVERY',
    'DELIVERED',
  ];

  const handleSimulateNextStatus = () => {
    const currentIndex = statusProgression.indexOf(currentOrder.status);
    if (currentIndex < statusProgression.length - 1) {
      const nextStatus = statusProgression[currentIndex + 1];
      updateOrderStatus(currentOrder.id, nextStatus);
    } else {
      showToast('Order is already marked delivered', 'info');
    }
  };

  const handleReorder = () => {
    currentOrder.items.forEach((item) => {
      addToCart(item.product, item.variantId, item.quantity);
    });
    showToast(`Items from #${currentOrder.orderNumber} added to cart`, 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <button
          onClick={() => setCustomerPage('orders')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </button>

        <span className="text-xs font-mono font-bold text-gray-500">
          Order #{currentOrder.orderNumber}
        </span>
      </div>

      {/* ETA Banner */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[#0C831F] bg-[#F0F8F1] px-2 py-0.5 rounded">
            {currentOrder.status}
          </span>
          <h1 className="text-base sm:text-lg font-black text-[#1C1C1C] mt-1.5">
            {currentOrder.status === 'DELIVERED'
              ? 'Delivered at Doorstep'
              : `Estimated Delivery: ${currentOrder.estimatedDelivery}`}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Slot: {currentOrder.deliverySlot.date} ({currentOrder.deliverySlot.time})
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {/* Interactive Status Progression Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#1C1C1C]">
            Live Delivery Timeline
          </h2>
          <button
            onClick={handleSimulateNextStatus}
            className="text-[11px] font-bold text-[#0C831F] hover:underline"
          >
            Advance Status (Demo)
          </button>
        </div>

        <div className="space-y-3.5 pl-2 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-gray-200 pointer-events-none" />

          {currentOrder.timeline.map((step, idx) => {
            const isCompleted = step.completed;
            const isCurrent = step.current;

            return (
              <div key={idx} className="flex items-start gap-3 relative z-10 text-xs">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isCompleted
                      ? 'bg-[#0C831F] text-white'
                      : isCurrent
                      ? 'bg-[#0C831F] text-white ring-4 ring-[#F0F8F1]'
                      : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold leading-tight ${
                      isCurrent
                        ? 'text-[#0C831F]'
                        : isCompleted
                        ? 'text-[#1C1C1C]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{step.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Partner Details */}
      {currentOrder.deliveryPartner && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-soft flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <Bike className="w-5 h-5 text-[#0C831F]" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C]">{currentOrder.deliveryPartner.name}</p>
              <p className="text-[11px] text-gray-500">
                Delivery Partner • {currentOrder.deliveryPartner.vehicleNo}
              </p>
            </div>
          </div>

          <a
            href={`tel:${currentOrder.deliveryPartner.phone}`}
            className="px-3 py-1.5 rounded-lg border border-[#CBE8CE] text-[#0C831F] font-bold text-xs bg-[#F0F8F1] hover:bg-[#E2F3E4] flex items-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>
        </div>
      )}

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-soft space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-[#0C831F]" />
          <span>Delivery Address</span>
        </div>
        <p className="font-bold text-[#1C1C1C]">{currentOrder.address.name}</p>
        <p className="text-gray-500 leading-tight">
          {currentOrder.address.houseNo}, {currentOrder.address.street}, {currentOrder.address.area}, {currentOrder.address.city} - {currentOrder.address.pincode}
        </p>
      </div>

      {/* Ordered Items & Bill */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-soft space-y-3 text-xs">
        <h3 className="font-black text-[#1C1C1C] uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>Items in Order ({currentOrder.items.length})</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReorder}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reorder
          </Button>
        </h3>

        <div className="divide-y divide-gray-100">
          {currentOrder.items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.images[0]}
                  alt=""
                  className="w-8 h-8 object-contain bg-gray-50 rounded p-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-[#1C1C1C] truncate">{item.product.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {item.variant.weight} &times; {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-black text-[#1C1C1C] shrink-0">
                ₹{item.variant.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5 text-gray-600">
          <div className="flex justify-between">
            <span>Item Total</span>
            <span>₹{currentOrder.subtotal}</span>
          </div>
          {currentOrder.savings > 0 && (
            <div className="flex justify-between text-[#0C831F] font-semibold">
              <span>Savings</span>
              <span>-₹{currentOrder.savings}</span>
            </div>
          )}
          {currentOrder.couponDiscount > 0 && (
            <div className="flex justify-between text-[#0C831F] font-semibold">
              <span>Coupon Discount ({currentOrder.couponCode})</span>
              <span>-₹{currentOrder.couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{currentOrder.deliveryFee === 0 ? 'FREE' : `₹${currentOrder.deliveryFee}`}</span>
          </div>
          <div className="pt-1.5 border-t border-gray-100 flex justify-between font-black text-sm text-[#1C1C1C]">
            <span>Total Paid</span>
            <span>₹{currentOrder.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
