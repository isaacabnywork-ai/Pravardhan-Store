'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Crosshair,
} from 'lucide-react';
import { Order } from '@/types';

interface DeliveryLiveMapProps {
  order: Order;
  onGoBack: () => void;
}

export function DeliveryLiveMap({ order, onGoBack }: DeliveryLiveMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecentering, setIsRecentering] = useState(false);

  const handleRecenter = () => {
    setIsRecentering(true);
    setTimeout(() => setIsRecentering(false), 1200);
  };

  const localityName = (order.deliveryAddress?.area || 'Sector 14, Model Town').toUpperCase();
  const addressLabel = order.deliveryAddress?.label || 'Home';
  const isOutForDelivery = order.orderStatus === 'OUT_FOR_DELIVERY';

  return (
    <div className="w-full relative overflow-hidden rounded-3xl shadow-sm border border-slate-200/90 bg-slate-50 transition-all duration-300">
      {/* ================= LIVE INTERACTIVE VECTOR MAP ================= */}
      <div
        className={`w-full relative overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'h-[440px] sm:h-[500px]' : 'h-72 sm:h-84 md:h-96'
        }`}
      >
        {/* SVG Realistic Road & Neighborhood Vector Map */}
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full object-cover select-none pointer-events-none transform scale-105"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Route Gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* River Water Gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c7e8fa" />
              <stop offset="100%" stopColor="#9cd7f7" />
            </linearGradient>

            {/* Drop Shadow for Pins */}
            <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Base Land Fill */}
          <rect width="800" height="500" fill="#f4f6f8" />

          {/* Parks & Greenery Patches */}
          <path
            d="M 520 40 C 620 20, 750 60, 720 160 C 690 230, 580 200, 530 140 Z"
            fill="#dcfce7"
            opacity="0.9"
          />
          <path
            d="M 60 320 C 140 290, 220 340, 190 430 C 160 480, 80 470, 50 400 Z"
            fill="#dcfce7"
            opacity="0.9"
          />
          <path
            d="M 390 370 C 460 340, 530 380, 510 450 C 470 490, 370 480, 360 420 Z"
            fill="#e2f9eb"
            opacity="0.8"
          />
          <path
            d="M 20 80 C 70 50, 150 70, 140 130 C 120 180, 40 160, 20 120 Z"
            fill="#e2f9eb"
            opacity="0.75"
          />

          {/* Water Channel / River (diagonal realistic flow) */}
          <path
            d="M -40 220 Q 220 270, 470 170 T 840 130"
            fill="none"
            stroke="url(#waterGrad)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d="M -40 220 Q 220 270, 470 170 T 840 130"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Urban Building Blocks / Plots Pattern */}
          <g opacity="0.35" stroke="#e2e8f0" strokeWidth="1" fill="#ffffff">
            <rect x="180" y="70" width="40" height="30" rx="3" />
            <rect x="230" y="70" width="50" height="30" rx="3" />
            <rect x="180" y="110" width="45" height="35" rx="3" />
            <rect x="235" y="110" width="45" height="35" rx="3" />
            <rect x="350" y="80" width="55" height="30" rx="3" />
            <rect x="350" y="120" width="55" height="30" rx="3" />
            <rect x="580" y="240" width="45" height="35" rx="3" />
            <rect x="635" y="240" width="45" height="35" rx="3" />
            <rect x="580" y="285" width="45" height="35" rx="3" />
            <rect x="635" y="285" width="45" height="35" rx="3" />
            <rect x="120" y="230" width="50" height="40" rx="3" />
            <rect x="220" y="380" width="60" height="35" rx="3" />
          </g>

          {/* Local Secondary Streets Grid */}
          <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95">
            <line x1="80" y1="0" x2="80" y2="500" />
            <line x1="280" y1="0" x2="280" y2="500" />
            <line x1="420" y1="0" x2="420" y2="500" />
            <line x1="560" y1="0" x2="560" y2="500" />
            <line x1="700" y1="0" x2="700" y2="500" />
            <line x1="0" y1="90" x2="800" y2="90" />
            <line x1="0" y1="180" x2="800" y2="180" />
            <line x1="0" y1="310" x2="800" y2="310" />
            <line x1="0" y1="410" x2="800" y2="410" />
          </g>

          {/* Arterial Highways & Main Expressways */}
          <g strokeLinecap="round">
            {/* Highway 1: Diagonal expressway */}
            <path d="M -50 360 L 850 220" stroke="#cbd5e1" strokeWidth="20" />
            <path d="M -50 360 L 850 220" stroke="#f8fafc" strokeWidth="14" />
            <path d="M -50 360 L 850 220" stroke="#94a3b8" strokeWidth="2" strokeDasharray="12 12" />

            {/* Highway 2: Vertical boulevard */}
            <path d="M 330 -50 L 330 550" stroke="#cbd5e1" strokeWidth="18" />
            <path d="M 330 -50 L 330 550" stroke="#f8fafc" strokeWidth="12" />

            {/* Highway 3: Cross link */}
            <path d="M -50 140 L 850 160" stroke="#cbd5e1" strokeWidth="14" />
            <path d="M -50 140 L 850 160" stroke="#ffffff" strokeWidth="10" />
          </g>

          {/* Locality & Neighborhood Street Text Labels */}
          <g fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="0.8">
            <text x="210" y="340" fill="#475569">SECTOR 14</text>
            <text x="440" y="110" fill="#475569">MODEL TOWN</text>
            <text x="140" y="150" fill="#64748b">CIVIL LINES</text>
            <text x="610" y="170" fill="#64748b">SUKHJIT NAGAR</text>
            <text x="590" y="370" fill="#64748b">OLD RAILWAY RD</text>
            <text x="100" y="440" fill="#94a3b8">MEHRAULI ROAD</text>
            {localityName && (
              <text x="440" y="240" fill="#0f172a" fontSize="12" fontWeight="800">
                {localityName}
              </text>
            )}
          </g>

          {/* Active Navigation Route Line (Store -> Customer Home) */}
          <g>
            {/* Route soft glow */}
            <path
              d="M 280 290 C 330 280, 360 260, 390 225 S 435 195, 480 170"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.45"
            />
            {/* Route main line */}
            <path
              d="M 280 290 C 330 280, 360 260, 390 225 S 435 195, 480 170"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Animated directional dashed beads */}
            <path
              d="M 280 290 C 330 280, 360 260, 390 225 S 435 195, 480 170"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 10"
              className="animate-[dash_1.5s_linear_infinite]"
            />
          </g>

          {/* ================= PINS ON MAP ================= */}
          {/* Origin Pin: Dark Store #01 */}
          <g filter="url(#pinShadow)">
            {/* Ground shadow base */}
            <ellipse cx="280" cy="292" rx="14" ry="5" fill="#0f172a" opacity="0.3" />

            {/* Store Marker Teardrop Pin */}
            <path
              d="M 280 290 C 265 290, 260 270, 260 258 C 260 244, 270 236, 280 236 C 290 236, 300 244, 300 258 C 300 270, 295 290, 280 290 Z"
              fill="#105132"
            />
            <circle cx="280" cy="256" r="14" fill="#ffffff" />
            <circle cx="280" cy="256" r="11" fill="#105132" />
            {/* Store icon text */}
            <text x="280" y="260" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
              P
            </text>
          </g>

          {/* Store Pin Label Banner */}
          <g>
            <rect x="235" y="296" width="90" height="18" rx="9" fill="#0f172a" opacity="0.85" />
            <text x="280" y="309" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
              Dark Store #01
            </text>
          </g>

          {/* Active Rider Marker (Positioned along the route) */}
          {(isOutForDelivery || order.orderStatus === 'READY_FOR_DELIVERY') && (
            <g transform="translate(385, 225)" filter="url(#pinShadow)">
              {/* Radar pulse ring */}
              <circle cx="0" cy="0" r="18" fill="#3b82f6" opacity="0.35" className="animate-ping" />
              <circle cx="0" cy="0" r="16" fill="#2563eb" />
              <circle cx="0" cy="0" r="14" fill="#ffffff" />
              <circle cx="0" cy="0" r="12" fill="#2563eb" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10">
                🛵
              </text>
            </g>
          )}

          {/* Destination Pin: Customer Home (Matching Reference Screenshot) */}
          <g filter="url(#pinShadow)">
            {/* Ground shadow base */}
            <ellipse cx="480" cy="172" rx="16" ry="6" fill="#0f172a" opacity="0.35" />

            {/* Recenter Radar Pulse Animation */}
            {isRecentering && (
              <circle cx="480" cy="140" r="38" fill="#e11d48" opacity="0.25" className="animate-ping" />
            )}

            {/* Navy/Charcoal Teardrop Pin */}
            <path
              d="M 480 170 C 462 170, 456 148, 456 135 C 456 118, 468 110, 480 110 C 492 110, 504 118, 504 135 C 504 148, 498 170, 480 170 Z"
              fill="#1e293b"
            />
            {/* Inner Squircle Badge with House Icon */}
            <rect x="466" y="122" width="28" height="24" rx="6" fill="#334155" />
            <text x="480" y="139" textAnchor="middle" fill="#ffffff" fontSize="13">
              🏠
            </text>
          </g>

          {/* Home Destination Pin Label Banner */}
          <g>
            <rect x="430" y="82" width="100" height="22" rx="11" fill="#0f172a" opacity="0.9" />
            <text x="480" y="97" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
              {addressLabel} Address
            </text>
          </g>
        </svg>

        {/* ================= FLOATING OVERLAY MAP BUTTONS ================= */}
        {/* Top-Left: Back Button */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={onGoBack}
            aria-label="Back to order list"
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Top-Right: Fullscreen & Re-center Buttons */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2.5">
          {/* Expand/Collapse Map Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-rose-500 backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:shadow-lg"
            title={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4.5 h-4.5 stroke-[2.2]" />
            ) : (
              <Maximize2 className="w-4.5 h-4.5 stroke-[2.2]" />
            )}
          </button>

          {/* Recenter / GPS Target Button */}
          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Re-center on delivery address"
            className={`w-10 h-10 rounded-full bg-white/95 hover:bg-white text-rose-500 backdrop-blur-md shadow-md border border-slate-200/90 flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:shadow-lg ${
              isRecentering ? 'ring-4 ring-rose-500/30 text-rose-600 scale-105' : ''
            }`}
            title="Locate my address"
          >
            <Crosshair className={`w-5 h-5 stroke-[2.2] ${isRecentering ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
