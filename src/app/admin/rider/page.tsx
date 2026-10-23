'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bike,
  Truck,
  MapPin,
  Phone,
  Camera,
  CheckCircle2,
  Navigation,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

export default function RiderPanelPage() {
  const { orders, updateOrderStatus } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // POD State
  const [selectedOrderForPod, setSelectedOrderForPod] = useState<Order | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [otp, setOtp] = useState('1234');
  const [photoError, setPhotoError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const assignedOrders = orders.filter(
    (o) =>
      o.orderStatus === 'READY_FOR_DELIVERY' ||
      o.orderStatus === 'OUT_FOR_DELIVERY' ||
      o.orderStatus === 'DELIVERED'
  );

  const readyPickupOrders = assignedOrders.filter((o) => o.orderStatus === 'READY_FOR_DELIVERY');
  const outForDeliveryOrders = assignedOrders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY');
  const deliveredOrders = assignedOrders.filter((o) => o.orderStatus === 'DELIVERED');

  const handleStartDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', 'Picked up by Rider Amit Singh from Dark Store #01');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
        setPhotoError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = (order: Order) => {
    if (!capturedPhoto) {
      setPhotoError(true);
      return;
    }
    if (otp.length !== 4) {
      setOtpError(true);
      return;
    }

    const note = `Delivered to customer doorstep by Rider Amit Singh. Doorstep photo captured. OTP verified (${otp}).${
      order.paymentMethod === 'COD' ? ' Cash payment collected.' : ''
    }`;

    updateOrderStatus(order.id, 'DELIVERED', note, capturedPhoto);
    setSelectedOrderForPod(null);
    setCapturedPhoto(null);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Bike className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Rider Delivery Station
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Role: Delivery Staff (Rider)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Rider Field App • In-transit consignment navigation, customer communication, and POD proof photo capture
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Consignments"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          <Link
            href="/admin/delivery"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Fleet View</span>
          </Link>
        </div>
      </div>

      {/* Rider Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-5 sm:p-6 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Amit Singh (Rider ID: DL-04)
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  On Duty
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Assigned Dark Store: Sector 14, Model Town, Gurugram Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Completed
              </p>
              <p className="text-lg sm:text-xl font-black text-emerald-400">
                {deliveredOrders.length} Drops
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                In Hand
              </p>
              <p className="text-lg sm:text-xl font-black text-amber-400">
                {outForDeliveryOrders.length + readyPickupOrders.length} Orders
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Est. Payout
              </p>
              <p className="text-lg sm:text-xl font-black text-white">
                ₹{deliveredOrders.length * 50 + 150}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Active Consignments for Delivery</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {readyPickupOrders.length + outForDeliveryOrders.length}
          </span>
        </h3>

        {readyPickupOrders.length === 0 && outForDeliveryOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <p className="text-base font-bold text-slate-800">All deliveries caught up!</p>
            <p className="text-xs text-slate-500 mt-1">
              New orders will appear here automatically as soon as the dark store packs them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Orders ready for dark store pickup */}
            {readyPickupOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      Packed & Ready at Hub
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    Customer: {order.customerName}
                  </p>
                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {order.deliveryAddress?.completeAddress ||
                        order.deliveryAddress?.street ||
                        'Gurugram'}
                    </span>
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 text-slate-500">
                    <span>Payment: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                    <span>Total: <strong className="text-slate-900">{formatPrice(order.grandTotal)}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartDelivery(order.id)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Pickup from Hub & Start Delivery</span>
                </button>
              </div>
            ))}

            {/* Orders currently out for delivery */}
            {outForDeliveryOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border-2 border-emerald-500/60 p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                      🛵 Out for Delivery
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Customer ({order.customerPhone})
                    </a>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Address
                    </p>
                    <p className="text-xs text-slate-800">
                      {order.deliveryAddress?.completeAddress ||
                        order.deliveryAddress?.street ||
                        'Gurugram'}
                    </p>
                    {order.deliveryAddress?.mapsLink && (
                      <a
                        href={order.deliveryAddress.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Open Google Maps Navigation
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-600">
                      Collect:{' '}
                      <strong className={order.paymentMethod === 'COD' ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}>
                        {order.paymentMethod === 'COD' ? `${formatPrice(order.grandTotal)} (Cash on Delivery)` : 'PAID ONLINE'}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForPod(order)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Arrived at Doorstep • Confirm Delivery</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Deliveries History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Delivered Consignments & Proof of Delivery ({deliveredOrders.length})
            </h3>
            <p className="text-xs text-slate-500">
              Verified with doorstep photo evidence and customer OTP
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {deliveredOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {order.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Delivered
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Customer: {order.customerName} • {formatPrice(order.grandTotal)}
                </p>
              </div>

              {order.deliveryProofPhoto && (
                <button
                  type="button"
                  onClick={() => setLightboxImage(order.deliveryProofPhoto || null)}
                  className="flex items-center gap-2 text-xs font-bold text-teal-700 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Proof Photo</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Proof of Delivery (POD) Modal */}
      {selectedOrderForPod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Proof of Delivery (POD)
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedOrderForPod.orderNumber} • {selectedOrderForPod.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForPod(null);
                  setCapturedPhoto(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo capture */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                1. Take Doorstep Photo Proof *
              </label>

              {capturedPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500 aspect-video">
                  <img
                    src={capturedPhoto}
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    photoError
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60'
                  }`}
                >
                  <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Tap to take photo or upload proof
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Photograph package at customer doorstep
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photoError && (
                <p className="text-[11px] font-bold text-rose-600">
                  Doorstep photo proof is required before marking delivered.
                </p>
              )}
            </div>

            {/* Customer OTP */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                2. Enter Customer 4-digit Delivery OTP *
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setOtpError(false);
                }}
                placeholder="1234"
                className="w-full text-center font-mono font-bold text-lg tracking-widest py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {otpError && (
                <p className="text-[11px] font-bold text-rose-600">
                  Please enter 4-digit OTP.
                </p>
              )}
            </div>

            {/* Confirm button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleConfirmDelivery(selectedOrderForPod)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Delivered & Submit POD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2">
            <img
              src={lightboxImage}
              alt="POD Proof"
              className="w-full h-auto rounded-2xl object-cover"
            />
            <p className="text-center text-xs text-slate-300 py-2">
              Doorstep Photo Evidence • Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
