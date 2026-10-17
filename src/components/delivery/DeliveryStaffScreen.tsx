import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Bike,
  Phone,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  Store,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '@/types';

export const DeliveryStaffScreen: React.FC = () => {
  const { orders, updateOrderStatus, setAppMode, showToast } = useStore();

  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState<Order | null>(null);
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [selectedIssueReason, setSelectedIssueReason] = useState<string>('Customer phone unreachable');
  const [otpInput, setOtpInput] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);

  // Delivery staff's orders (Indiranagar route assigned to Ramesh Kumar)
  const riderOrders = orders.filter((o) => o.status !== 'CANCELLED');

  const handleStartDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'OUT FOR DELIVERY');
    showToast(`Started delivery for Order #${order.orderNumber}`, 'success');
  };

  const handleOpenOtpModal = (order: Order) => {
    setActiveDeliveryOrder(order);
    setOtpInput('4281'); // prefill mock OTP for smooth testing
    setShowOtpModal(true);
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeliveryOrder) return;

    updateOrderStatus(activeDeliveryOrder.id, 'DELIVERED');
    setShowOtpModal(false);
    showToast(`Order #${activeDeliveryOrder.orderNumber} successfully marked DELIVERED!`, 'success');
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeliveryOrder) return;

    showToast(`Issue reported for #${activeDeliveryOrder.orderNumber}: ${selectedIssueReason}`, 'error');
    setShowIssueModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-16 text-[#1F2937]">
      {/* Top Rider Navigation Bar */}
      <div className="bg-[#1E293B] text-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center font-bold text-sm">
            <Bike className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">Ramesh Kumar (Rider)</p>
            <p className="text-[10px] text-emerald-400 font-mono">KA-03-EM-8421 • Online</p>
          </div>
        </div>

        <button
          onClick={() => setAppMode('customer')}
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
        >
          <Store className="w-3.5 h-3.5 text-[#F9C74F]" />
          <span>Store View</span>
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Route Header */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Assigned Route
            </span>
            <h2 className="text-sm font-bold text-gray-900 mt-0.5">
              Indiranagar & Domlur Sector 4
            </h2>
          </div>
          <span className="text-xs font-bold bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-1 rounded">
            {riderOrders.length} Drops
          </span>
        </div>

        {/* Assigned Orders List (Requirement #33) */}
        <div className="space-y-4">
          {riderOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const isOutForDelivery = order.status === 'OUT FOR DELIVERY';
            const isReady = order.status === 'READY';
            const isPreparing = order.status === 'PREPARING' || order.status === 'CONFIRMED' || order.status === 'PLACED';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-soft space-y-3.5 transition-all ${
                  isDelivered
                    ? 'border-gray-200 opacity-70 bg-gray-50/50'
                    : isOutForDelivery
                    ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/10'
                    : 'border-gray-200'
                }`}
              >
                {/* Header: Order #, Status, Amount */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isDelivered
                          ? 'bg-emerald-50 text-[#1B5E20]'
                          : isOutForDelivery
                          ? 'bg-blue-50 text-blue-700 animate-pulse'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-gray-900">₹{order.total}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {order.paymentStatus === 'CASH_ON_DELIVERY' ? 'Collect Cash' : 'Prepaid UPI'}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{order.address.name}</h3>
                      <p className="text-gray-500 font-mono">{order.address.phone}</p>
                    </div>

                    <a
                      href={`tel:${order.address.phone}`}
                      onClick={(e) => {
                        e.preventDefault();
                        showToast(`Calling customer ${order.address.name}...`, 'info');
                      }}
                      className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] flex items-center justify-center transition-colors"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4 fill-current" />
                    </a>
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="leading-snug">
                      {order.address.houseNo}, {order.address.street}, {order.address.area} - {order.address.pincode}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Slot: {order.deliverySlot.date} ({order.deliverySlot.time})</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="p-2.5 rounded-lg bg-gray-50 text-[11px] text-gray-600 space-y-0.5">
                  <span className="font-bold text-gray-800">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} to deliver:
                  </span>
                  <p className="truncate">
                    {order.items.map((i) => `${i.product.name} (${i.variant.weight} × ${i.quantity})`).join(', ')}
                  </p>
                </div>

                {/* Primary Actions (Requirement #33) */}
                <div className="pt-2 flex items-center gap-2">
                  {!isDelivered ? (
                    <>
                      {isReady || isPreparing ? (
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          onClick={() => handleStartDelivery(order)}
                          leftIcon={<Bike className="w-4 h-4" />}
                        >
                          Start Delivery
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          onClick={() => handleOpenOtpModal(order)}
                          leftIcon={<Check className="w-4 h-4" />}
                        >
                          Mark Delivered
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setActiveDeliveryOrder(order);
                          setShowIssueModal(true);
                        }}
                      >
                        Report Issue
                      </Button>
                    </>
                  ) : (
                    <div className="w-full py-2 bg-emerald-50 text-[#1B5E20] border border-emerald-200 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivered Successfully</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OTP Delivery Confirmation Modal */}
      {showOtpModal && activeDeliveryOrder && (
        <Modal
          isOpen={true}
          onClose={() => setShowOtpModal(false)}
          title="Verify Doorstep Delivery"
          subtitle={`Order #${activeDeliveryOrder.orderNumber} • ${activeDeliveryOrder.address.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmDelivery} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-[#1B5E20] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Customer OTP Verification
              </p>
              <p className="text-gray-700">
                Ask customer for 4-digit verification code sent via SMS.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Enter 4-Digit Delivery OTP
              </label>
              <input
                required
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="4281"
                className="w-full px-3 py-2 text-center text-lg font-mono font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Confirm Delivered
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && activeDeliveryOrder && (
        <Modal
          isOpen={true}
          onClose={() => setShowIssueModal(false)}
          title="Report Delivery Issue"
          subtitle={`Order #${activeDeliveryOrder.orderNumber}`}
          maxWidth="sm"
        >
          <form onSubmit={handleReportIssue} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Select Reason for Delivery Delay / Failure
              </label>
              <select
                value={selectedIssueReason}
                onChange={(e) => setSelectedIssueReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-rose-500"
              >
                <option value="Customer phone unreachable">Customer phone unreachable</option>
                <option value="Door locked / Nobody at address">Door locked / Nobody at address</option>
                <option value="Incorrect address / landmark not found">Incorrect address / landmark not found</option>
                <option value="Customer requested reschedule">Customer requested reschedule</option>
                <option value="Damaged pack reported during handover">Damaged pack reported during handover</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowIssueModal(false)}
              >
                Back
              </Button>
              <Button type="submit" variant="danger" fullWidth>
                Submit Issue to Hub
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
