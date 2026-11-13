'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  MapPin,
  Store,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { Order } from '@/types';

interface DeliveryLiveMapProps {
  order: Order;
  onGoBack: () => void;
}

export function DeliveryLiveMap({ order, onGoBack }: DeliveryLiveMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapType, setMapType] = useState<'google' | 'route'>('google');

  // Exact Coordinates for Lucknow Vrindavan Store & Customer Location
  const STORE_LAT = 26.7824;
  const STORE_LNG = 80.9388;
  const STORE_NAME = 'Pravdhan Store (Vrindavan Colony Hub)';
  const STORE_ADDRESS = 'Vrindavan Colony, Sector 4, Lucknow, UP';

  // Customer Coordinates (extracted from mapsLink or calculated)
  let customerLat = 26.7885;
  let customerLng = 80.9442;
  const mapsLink = order.deliveryAddress?.mapsLink || '';

  if (mapsLink) {
    const match = mapsLink.match(/q=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
    if (match && match[1] && match[2]) {
      customerLat = parseFloat(match[1]);
      customerLng = parseFloat(match[2]);
    }
  }

  // Calculate real Great-Circle distance (Haversine)
  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(0.4, Math.round(R * c * 10) / 10);
  };

  const distanceKm = calculateDistanceKm(
    STORE_LAT,
    STORE_LNG,
    customerLat,
    customerLng
  );
  const estMinutes = Math.max(10, Math.round(5 + distanceKm * 3.5));

  const destinationQuery = encodeURIComponent(
    order.deliveryAddress?.completeAddress
      ? `${order.deliveryAddress.completeAddress}, Vrindavan Colony, Lucknow`
      : `${customerLat},${customerLng}`
  );

  const googleEmbedUrl = `https://www.google.com/maps?saddr=${STORE_LAT},${STORE_LNG}&daddr=${destinationQuery}&output=embed`;
  const externalGoogleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${STORE_LAT},${STORE_LNG}&destination=${destinationQuery}&travelmode=driving`;

  const customerAddressText =
    order.deliveryAddress?.completeAddress ||
    order.deliveryAddress?.street ||
    order.deliveryAddress?.area ||
    'Vrindavan Colony, Sector 4, Lucknow';

  return (
    <div className="w-full relative overflow-hidden rounded-3xl shadow-sm border border-slate-200/90 bg-white transition-all duration-300">
      {/* ================= MAP CONTAINER ================= */}
      <div
        className={`w-full relative overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'h-[440px] sm:h-[520px]' : 'h-72 sm:h-84 md:h-96'
        }`}
      >
        {mapType === 'google' ? (
          /* Real Google Map Embed showing Store, Customer location, and Directions */
          <iframe
            src={googleEmbedUrl}
            title="Real Google Map Route: Store to Customer"
            className="w-full h-full border-0 select-none"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          /* Connected Schematic Route View */
          <div className="w-full h-full bg-slate-50 relative flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Store-to-Doorstep Dispatch Line
              </span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                {distanceKm} km • {estMinutes} mins
              </span>
            </div>

            <div className="flex items-center justify-between my-auto relative px-4">
              {/* Connecting Dashed Line */}
              <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 border-t-4 border-dashed border-emerald-500 z-0" />

              {/* Store Point */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#0F5132] text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 mt-2">
                  Pravdhan Store
                </span>
                <span className="text-[10px] text-slate-500">Vrindavan Hub</span>
              </div>

              {/* Distance Pill */}
              <div className="relative z-10 bg-white border border-emerald-300 rounded-full px-3 py-1 shadow-md text-center">
                <span className="text-xs font-black text-emerald-700 block">
                  {distanceKm} km
                </span>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">
                  Connected
                </span>
              </div>

              {/* Customer Home Point */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 mt-2">
                  Customer Doorstep
                </span>
                <span className="text-[10px] text-slate-500">
                  {order.deliveryAddress?.label || 'Home'}
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 font-medium truncate">
              {customerAddressText}
            </p>
          </div>
        )}

        {/* ================= FLOATING OVERLAY CONTROLS ================= */}
        {/* Top-Left: Back Button */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={onGoBack}
            aria-label="Back to order list"
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Top-Right: Fullscreen & External Google Maps Button */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* External Google Maps Button */}
          <a
            href={externalGoogleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Google Maps app"
            className="h-10 px-3 rounded-full bg-white/95 hover:bg-white text-emerald-800 backdrop-blur-md shadow-md border border-slate-200/90 flex items-center gap-1.5 transition-all active:scale-95 text-xs font-bold hover:shadow-lg"
            title="Open directions in Google Maps app"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Directions</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Expand/Collapse Map Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:shadow-lg"
            title={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4.5 h-4.5 stroke-[2.2]" />
            ) : (
              <Maximize2 className="w-4.5 h-4.5 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Bottom Banner: Connected Store to Doorstep Distance Metric */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 truncate">
                  Pravdhan Hub ➔ {order.deliveryAddress?.label || 'Home'}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                  {distanceKm} km
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {customerAddressText}
              </p>
            </div>
          </div>

          {/* Toggle between Google Map view & Schematic Line view */}
          <button
            type="button"
            onClick={() => setMapType((prev) => (prev === 'google' ? 'route' : 'google'))}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors shrink-0"
          >
            {mapType === 'google' ? 'Schematic' : 'Google Map'}
          </button>
        </div>
      </div>
    </div>
  );
}
