'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

export function Footer() {
  const { storeSettings, categories } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-16">
      {/* Trust Badges Strip */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Same-Day Slots</p>
              <p className="text-slate-400 text-xs">Choose 2-hour delivery window</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">100% Quality Mandi</p>
              <p className="text-slate-400 text-xs">Triple-sorted fresh produce</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Doorstep Return</p>
              <p className="text-slate-400 text-xs">No questions asked replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Dedicated Care</p>
              <p className="text-slate-400 text-xs">{storeSettings.supportPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white">
              Pravdhan <span className="text-emerald-400">STORE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {storeSettings.tagline}. Single-warehouse direct-to-customer retail model delivering unadulterated staples, farm-fresh fruits & vegetables, dairy, and household essentials.
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Hub 1: {storeSettings.serviceArea}, {storeSettings.city}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Open: {storeSettings.operatingHours} (All 7 Days)</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{storeSettings.supportPhone}</span>
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Shop Categories</h4>
          <ul className="space-y-2 text-xs">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Help & Account */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Customer Service</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/account/orders" className="hover:text-emerald-400 transition-colors">
                Order Tracking & History
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-emerald-400 transition-colors">
                Saved Delivery Addresses
              </Link>
            </li>
            <li>
              <Link href="/deals" className="hover:text-emerald-400 transition-colors">
                Coupons & Daily Offers
              </Link>
            </li>
            <li>
              <span className="text-slate-400">Minimum Order Value: ₹{storeSettings.minimumOrderValue}</span>
            </li>
            <li>
              <span className="text-emerald-400 font-semibold">Standard Delivery: ₹{storeSettings.defaultDeliveryCharge}</span>
            </li>
          </ul>
        </div>

        {/* Operational Roles & System */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Staff & Admin Desk</h4>
          <p className="text-xs text-slate-400 mb-3">
            Pravdhan Store includes complete multi-role portals for physical store operations:
          </p>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/admin/products" className="text-blue-400 hover:underline">
                • Product Manager Portal
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="text-purple-400 hover:underline">
                • Order Fulfillment & Packing
              </Link>
            </li>
            <li>
              <Link href="/admin/delivery" className="text-amber-400 hover:underline">
                • Delivery Staff Portal
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-rose-400 hover:underline">
                • Super Admin Dashboard
              </Link>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Supported Payments:</span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
              <span className="bg-slate-800 px-2 py-0.5 rounded">UPI (GPay / PhonePe)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Cards</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved. Registered Indian Local Retail Entity.
          </span>
          <span className="text-slate-400">
            Engineered with Next.js App Router, TypeScript, and Tailwind CSS.
          </span>
        </div>
      </div>
    </footer>
  );
}
