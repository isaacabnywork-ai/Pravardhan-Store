'use client';

import React, { useState, useRef } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Bike,
  KeyRound,
  X,
  Camera,
  Eye,
  Navigation,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';

export default function AdminDeliveryPage() {
  const { orders, updateOrderStatus, assignDeliveryStaff } = useStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'READY_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED'>('ALL');

  // Proof of Delivery (POD) Modal State
  const [podModalOrder, setPodModalOrder] = useState<Order | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('1234');
  const [otpError, setOtpError] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [cashConfirmed, setCashConfirmed] = useState(true);

  // Lightbox preview
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const SAMPLE_POD_PRESETS = [
    {
      title: 'Doorstep Drop',
      desc: 'Package at front door',
      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Customer Handover',
      desc: 'Handover at doorstep',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Porch Placement',
      desc: 'Package in porch box',
      url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleStatusUpdate = (orderId: string, status: OrderStatus, note: string) => {
    updateOrderStatus(orderId, status, note);
  };

  const deliveryOrders = orders.filter(
    (o) =>
      o.orderStatus === 'READY_FOR_DELIVERY' ||
      o.orderStatus === 'OUT_FOR_DELIVERY' ||
      o.orderStatus === 'DELIVERED'
  );

  const readyForPickupCount = orders.filter((o) => o.orderStatus === 'READY_FOR_DELIVERY').length;
  const activeDeliveries = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY');
  const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  const filteredOrders = deliveryOrders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.orderStatus === activeTab;
  });

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
    if (enteredOtp.length !== 4) {
      setOtpError(true);
      return;
    }

    const note = `Delivered to customer doorstep by ${
      order.deliveryStaffName || 'Amit Singh'
    }. Doorstep photo proof captured. Customer OTP verified (${enteredOtp}).${
      order.paymentMethod === 'COD' ? ' Cash payment collected.' : ''
    }`;

    updateOrderStatus(order.id, 'DELIVERED', note, capturedPhoto);
    setPodModalOrder(null);
    setCapturedPhoto(null);
    setPhotoError(false);
    setOtpError(false);
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Rider Panel & Fleet Logistics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <Truck className="w-3.5 h-3.5" />
              {activeDeliveries.length} Bags In Transit
            </span>
            {readyForPickupCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
                <Bike className="w-3.5 h-3.5" />
                {readyForPickupCount} Ready for Pickup
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rider workspace: Accept dispatched dark-store consignments, confirm out-for-delivery, and capture doorstep delivery photo proof
          </p>
        </div>

        {/* Assigned Rider Banner */}
        <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs self-start md:self-auto">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold flex-shrink-0">
            <Bike className="w-4 h-4" />
          </div>
          <div className="text-xs pr-2">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Active Rider</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Amit Singh (DL-04)</span>
          </div>
        </div>
      </div>

      {/* Rider Fleet Radar Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            name: 'Amit Singh (Current)',
            phone: '+91 9833445566',
            status: 'ON_DELIVERY',
            bags: activeDeliveries.length,
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

      {/* Field Delivery Queue for Rider */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Doorstep Delivery Dispatch Queue ({filteredOrders.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow consignment states: Pickup from hub ➔ Confirm Out for Delivery ➔ Doorstep POD photo capture
            </p>
          </div>

          {/* Filter Tabs for Rider */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL' as const, label: 'All Orders', count: deliveryOrders.length },
              { id: 'READY_FOR_DELIVERY' as const, label: 'Ready for Pickup', count: readyForPickupCount },
              { id: 'OUT_FOR_DELIVERY' as const, label: 'Out for Delivery', count: activeDeliveries.length },
              { id: 'DELIVERED' as const, label: 'Delivered (POD)', count: deliveredCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No orders in this stage</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Orders dispatched by the store will automatically appear under &ldquo;Ready for Pickup&rdquo;.
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isAssignedToMe = ord.deliveryStaffName === 'Amit Singh';
              const isReady = ord.orderStatus === 'READY_FOR_DELIVERY';
              const isOut = ord.orderStatus === 'OUT_FOR_DELIVERY';
              const isDelivered = ord.orderStatus === 'DELIVERED';

              return (
                <div
                  key={ord.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs ${
                    isOut
                      ? 'border-purple-300 bg-purple-50/30 ring-1 ring-purple-200'
                      : isReady
                      ? 'border-indigo-200 bg-indigo-50/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {/* Left: Customer address & slot */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        #{ord.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOut
                            ? 'bg-purple-100 text-purple-900 animate-pulse'
                            : 'bg-indigo-100 text-indigo-900'
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                        Slot: {ord.deliverySlot.timeSlot}
                      </span>
                      {ord.deliveryStaffName && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Rider: {ord.deliveryStaffName}
                        </span>
                      )}
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

                    {/* Items preview */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">Items:</span>
                      {ord.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        >
                          {it.productName} ({it.unit}) ×{it.quantity}
                        </span>
                      ))}
                    </div>

                    {/* Payment Warning Badge */}
                    <div className="pt-1">
                      {ord.paymentMethod === 'COD' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                          ⚠️ Collect {formatPrice(ord.grandTotal)} Cash / QR at Doorstep
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                          ✓ Paid Online ({formatPrice(ord.grandTotal)}) • Do Not Collect Cash
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    <div className="text-left lg:text-right pr-2">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatPrice(ord.grandTotal)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {ord.paymentMethod !== 'COD' ? 'Razorpay Paid' : 'Cash On Delivery'}
                      </span>
                    </div>

                    {/* Call Customer Button */}
                    <a
                      href={`tel:${ord.customerPhone}`}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </a>

                    {/* Google Maps Navigation Button */}
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        `${ord.deliveryAddress.houseNumber}, ${ord.deliveryAddress.street}, ${ord.deliveryAddress.area}, ${ord.deliveryAddress.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Open Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Maps</span>
                    </a>

                    {/* Stage A: Ready for Delivery - Take Order or Confirm Out */}
                    {isReady && (
                      <div className="flex items-center gap-2">
                        {!isAssignedToMe && (
                          <button
                            type="button"
                            onClick={() => {
                              assignDeliveryStaff(ord.id, 'user-del-staff', 'Amit Singh');
                            }}
                            className="px-3.5 py-2 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 text-indigo-900 rounded-xl font-bold transition-all flex items-center gap-1"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Take Order</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            assignDeliveryStaff(ord.id, 'user-del-staff', 'Amit Singh');
                            handleStatusUpdate(
                              ord.id,
                              'OUT_FOR_DELIVERY',
                              'Rider Amit Singh picked up package from hub and started delivery route'
                            );
                          }}
                          className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Confirm Out for Delivery</span>
                        </button>
                      </div>
                    )}

                    {/* Stage B: Out for Delivery - Complete Delivery with POD Photo */}
                    {isOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setPodModalOrder(ord);
                          setCapturedPhoto(ord.deliveryProofPhoto || null);
                          setEnteredOtp('1234');
                          setPhotoError(false);
                          setOtpError(false);
                        }}
                        className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Deliver & Take Picture</span>
                      </button>
                    )}

                    {/* Stage C: Delivered - View POD Photo */}
                    {isDelivered && (
                      <div className="flex items-center gap-2">
                        {ord.deliveryProofPhoto && (
                          <button
                            type="button"
                            onClick={() => setLightboxImage(ord.deliveryProofPhoto || null)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold shadow-2xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View POD Photo</span>
                          </button>
                        )}
                        <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Proof of Delivery (POD) Modal with Camera Capture */}
      {podModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    Doorstep Delivery & Photo Proof (POD)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Order #{podModalOrder.orderNumber} • {podModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPodModalOrder(null);
                  setCapturedPhoto(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Delivery Location
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {podModalOrder.deliveryAddress.houseNumber}, {podModalOrder.deliveryAddress.street},{' '}
                {podModalOrder.deliveryAddress.area}
              </p>
            </div>

            {/* STEP 1: Take Picture of the Delivered Order (MANDATORY) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>1. Take Picture of Delivered Order (Required)</span>
                </label>
                {capturedPhoto && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Photo Ready
                  </span>
                )}
              </div>

              {/* Hidden file input supporting native camera capture */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {capturedPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                  <img
                    src={capturedPhoto}
                    alt="Captured Delivery Proof"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2.5 text-white flex items-center justify-between text-xs backdrop-blur-xs">
                    <div>
                      <span className="font-bold block text-[11px]">✓ Doorstep Photo Captured</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        {new Date().toLocaleTimeString()} • Verified POD
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedPhoto(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Camera Click Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                      photoError
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="font-black text-slate-800 text-xs">
                      Tap to Take Photo with Camera
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Or select image file from your device
                    </p>
                  </div>

                  {/* 1-Click Quick Sample Presets (Ensures instant desktop testing without mobile camera) */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                      Or Select Sample Delivery Photo (For Instant Testing):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_POD_PRESETS.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => {
                            setCapturedPhoto(preset.url);
                            setPhotoError(false);
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-left transition-all group"
                        >
                          <img
                            src={preset.url}
                            alt=""
                            className="w-full h-14 object-cover rounded-lg mb-1 group-hover:scale-102 transition-transform"
                          />
                          <span className="font-bold text-[10px] text-slate-800 block truncate">
                            {preset.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {photoError && (
                <p className="text-[11px] text-rose-600 font-bold">
                  ⚠️ Please take or select a photo of the delivered order to complete delivery.
                </p>
              )}
            </div>

            {/* STEP 2: Customer Handover OTP */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>2. Verify Customer Doorstep OTP</span>
                </label>
                <button
                  type="button"
                  onClick={() => setEnteredOtp('1234')}
                  className="text-[10px] text-emerald-700 font-bold hover:underline"
                >
                  Autofill (1234)
                </button>
              </div>

              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => {
                  setEnteredOtp(e.target.value);
                  setOtpError(false);
                }}
                className="w-full text-center font-mono font-black text-xl tracking-widest p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                placeholder="4-digit OTP"
              />
              {otpError && (
                <p className="text-[11px] text-rose-600 font-bold text-center">
                  Please enter a valid 4-digit OTP.
                </p>
              )}
            </div>

            {/* STEP 3: Payment Collection Confirmation (if COD) */}
            {podModalOrder.paymentMethod === 'COD' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cashConfirmed}
                    onChange={(e) => setCashConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-extrabold text-amber-900 text-xs">
                    I confirm ₹{podModalOrder.grandTotal} cash/UPI was collected from customer
                  </span>
                </label>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPodModalOrder(null);
                  setCapturedPhoto(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelivery(podModalOrder)}
                disabled={!capturedPhoto || (podModalOrder.paymentMethod === 'COD' && !cashConfirmed)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                  capturedPhoto && (podModalOrder.paymentMethod !== 'COD' || cashConfirmed)
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Delivered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image View */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-3"
          >
            <div className="flex items-center justify-between p-2 pb-3">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Doorstep Proof of Delivery
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxImage}
              alt="Proof of Delivery Full"
              className="w-full h-80 object-cover rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
