'use client';

import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Calendar,
  Bike,
  KeyRound,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function AdminDeliveryPage() {
  const { orders, deliverySlots, updateOrderStatus } = useStore();

  const [otpModalOrder, setOtpModalOrder] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  const handleStatusUpdate = (orderId: string, status: OrderStatus, note: string) => {
    updateOrderStatus(orderId, status, note);
  };

  const deliveryOrders = orders.filter(
    (o) =>
      o.orderStatus === 'READY_FOR_DELIVERY' ||
      o.orderStatus === 'OUT_FOR_DELIVERY' ||
      o.orderStatus === 'DELIVERED'
  );

  const activeDeliveries = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY');

  const handleVerifyOtpAndDeliver = (orderId: string) => {
    // In our system, delivery OTP is simulated as 1234 or any 4 digit code
    if (enteredOtp.length === 4) {
      handleStatusUpdate(
        orderId,
        'DELIVERED',
        `Doorstep OTP verified (${enteredOtp}). Successfully handed over to customer.`
      );
      setOtpModalOrder(null);
      setEnteredOtp('');
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Delivery & Fleet Logistics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <Truck className="w-3.5 h-3.5" />
              {activeDeliveries.length} Bags In Transit
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Field delivery operations: Route dispatch, slot capacities, doorstep OTP confirmations, and rider assignments
          </p>
        </div>

        {/* Assigned Rider Banner */}
        <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs self-start md:self-auto">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold flex-shrink-0">
            <Bike className="w-4 h-4" />
          </div>
          <div className="text-xs pr-2">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Rider On Duty</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Amit Singh (+91 9833445566)</span>
          </div>
        </div>
      </div>

      {/* Rider Fleet Radar Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            name: 'Amit Singh',
            phone: '+91 9833445566',
            status: 'ON_DELIVERY',
            bags: 2,
            vehicle: 'TVS iQube EV (HR-26-EQ-4491)',
            sla: '11.4 mins avg',
          },
          {
            name: 'Rahul Verma',
            phone: '+91 9877112233',
            status: 'IDLE_AT_HUB',
            bags: 0,
            vehicle: 'Honda Activa (HR-26-CF-9081)',
            sla: '13.1 mins avg',
          },
          {
            name: 'Vikram Joshi',
            phone: '+91 9844556677',
            status: 'ON_DELIVERY',
            bags: 1,
            vehicle: 'Ather 450X (HR-26-DZ-1192)',
            sla: '12.8 mins avg',
          },
        ].map((rider) => (
          <div
            key={rider.name}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    rider.status === 'ON_DELIVERY'
                      ? 'bg-purple-100 text-purple-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      rider.status === 'ON_DELIVERY' ? 'bg-purple-600 animate-pulse' : 'bg-emerald-600'
                    }`}
                  />
                  {rider.status === 'ON_DELIVERY' ? 'Out Delivering' : 'Available at Hub'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{rider.sla}</span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 mt-2">{rider.name}</h3>
              <p className="text-[11px] text-slate-500 font-mono">{rider.phone}</p>
              <p className="text-[10px] text-slate-400 mt-1">{rider.vehicle}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Active: <strong className="text-purple-700">{rider.bags} Orders</strong>
              </span>
              <a
                href={`tel:${rider.phone}`}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Call Rider"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Slots Capacity Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Delivery Slot Capacity & Dark Store Dispatch Windows
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-xl">
            Zone: Sector 49 Hub
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {deliverySlots.map((slot) => {
            const fillPercentage = Math.round((slot.bookedCount / slot.capacity) * 100);
            return (
              <div
                key={slot.id}
                className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-slate-900 text-[11px] sm:text-xs truncate">{slot.timeSlot}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
                      {slot.dateType}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mt-1.5">
                    <span>Cap: {slot.capacity}</span>
                    <span className="font-bold text-slate-800">{slot.bookedCount} booked</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-1.5 sm:h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fillPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Delivery Queue for Rider */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Doorstep Delivery Dispatch Queue ({deliveryOrders.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active last-mile consignments: Navigation, customer contact, and OTP handoff
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {deliveryOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No orders currently in the active dispatch queue.
            </p>
          ) : (
            deliveryOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
              >
                {/* Left: Customer address & slot */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      #{ord.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-purple-100 text-purple-900 animate-pulse'
                          : 'bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Slot: {ord.deliverySlot.timeSlot}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs">
                    {ord.customerName} ({ord.deliveryAddress.label})
                  </p>
                  <p className="text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>
                      {ord.deliveryAddress.houseNumber}, {ord.deliveryAddress.street}, {ord.deliveryAddress.area}
                    </span>
                  </p>
                  {ord.deliveryAddress.landmark && (
                    <p className="text-[11px] text-slate-400 pl-4">
                      Landmark: {ord.deliveryAddress.landmark}
                    </p>
                  )}
                  {ord.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      Customer Note: &ldquo;{ord.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <div className="text-left lg:text-right pr-2">
                    <span className="font-black text-slate-900 text-sm block">
                      {formatPrice(ord.grandTotal)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {ord.paymentMethod !== 'COD' ? 'Razorpay Paid' : 'Cash On Delivery'}
                    </span>
                  </div>

                  <a
                    href={`tel:${ord.customerPhone}`}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  {ord.orderStatus === 'READY_FOR_DELIVERY' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          ord.id,
                          'OUT_FOR_DELIVERY',
                          'Rider picked consignment and is out for delivery'
                        )
                      }
                      className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Start Delivery</span>
                    </button>
                  )}

                  {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => setOtpModalOrder(ord.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Enter OTP & Deliver</span>
                    </button>
                  )}

                  {ord.orderStatus === 'DELIVERED' && (
                    <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivered</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Doorstep OTP Verification Modal */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Verify Doorstep Delivery OTP
                </h3>
              </div>
              <button
                onClick={() => setOtpModalOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Ask customer for the 4-digit confirmation OTP sent to their mobile phone.
              </p>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4821"
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setOtpError(false);
                  }}
                  className="w-full text-center font-mono font-black text-2xl tracking-widest p-3 rounded-2xl border border-slate-300 outline-none focus:border-emerald-600"
                />
                {otpError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 text-center">
                    Please enter a valid 4-digit OTP.
                  </p>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center font-medium">
                Testing tip: Any 4-digit code (e.g. 1234) completes the handover.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setOtpModalOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyOtpAndDeliver(otpModalOrder)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
