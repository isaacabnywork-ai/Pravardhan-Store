'use client';

import React, { useState } from 'react';
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
  X,
  FileText,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';

type PolicyType = 'privacy' | 'terms' | 'returns' | null;

export function Footer() {
  const { storeSettings, categories } = useStore();
  const { role } = useAuth();
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

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
              <p className="font-bold text-white text-sm">Express & Slots</p>
              <p className="text-slate-400 text-xs">⚡ 12–15m or 2-hr slots</p>
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
              <p className="text-slate-400 text-xs">24-hr instant replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Gurugram Care</p>
              <p className="text-slate-400 text-xs">+91 124 456 7890</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-white px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center">
              <img
                src="/images/logo.png"
                alt="Pravdhan Store"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {storeSettings.tagline}. Single-warehouse direct-to-customer retail model delivering unadulterated staples, farm-fresh fruits & vegetables, dairy, and household essentials.
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1.5">
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
              <span>+91 124 456 7890</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>care@pravdhanstore.in</span>
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
          <h4 className="font-bold text-white text-sm mb-3">Customer Service & Policies</h4>
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
              <button
                type="button"
                onClick={() => setActivePolicy('returns')}
                className="text-left hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Doorstep Return & Refund Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicy('privacy')}
                className="text-left hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Privacy & Data Protection Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicy('terms')}
                className="text-left hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Terms of Service & Delivery Norms
              </button>
            </li>
            <li className="pt-2 border-t border-slate-800 text-slate-400">
              <span>Minimum Order: ₹{storeSettings.minimumOrderValue} • Delivery: ₹0</span>
            </li>
          </ul>
        </div>

        {/* 4th Column: Customer Trust & Guarantees (or Staff Desk if logged in as staff) */}
        <div>
          {role !== 'CUSTOMER' ? (
            <>
              <h4 className="font-bold text-white text-sm mb-3">Staff Operations Desk</h4>
              <p className="text-xs text-slate-400 mb-3">
                Pravdhan Store physical store management portals:
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
            </>
          ) : (
            <>
              <h4 className="font-bold text-white text-sm mb-3">Why Pravdhan Store?</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">⚡</span>
                  <span><strong>12–15 Mins Express:</strong> Dispatched direct from Sector 14 hub</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">🌱</span>
                  <span><strong>100% Owned Inventory:</strong> Triple-graded fresh produce</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">💰</span>
                  <span><strong>Wholesale Rates:</strong> Free delivery on all carts above ₹100</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">🛡️</span>
                  <span><strong>Doorstep Returns:</strong> 24-hr instant replacement guarantee</span>
                </li>
              </ul>
            </>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Supported Payments:</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 flex-wrap">
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
            © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved. Registered Indian Local Retail Entity (Sector 14, Gurugram).
          </span>
          <span className="text-slate-400">
            Helpline: +91 124 456 7890 • care@pravdhanstore.in
          </span>
        </div>
      </div>

      {/* Policy Modal */}
      {activePolicy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setActivePolicy(null)}
        >
          <div
            className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-base">
                  {activePolicy === 'returns' && 'Doorstep Return & Refund Policy'}
                  {activePolicy === 'privacy' && 'Privacy & Data Protection Policy'}
                  {activePolicy === 'terms' && 'Terms of Service & Delivery Norms'}
                </h3>
              </div>
              <button
                onClick={() => setActivePolicy(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              {activePolicy === 'returns' && (
                <>
                  <p className="font-bold text-slate-800">
                    100% Hassle-Free Doorstep Replacement Guarantee:
                  </p>
                  <p>
                    • <strong>Fresh Fruits & Vegetables:</strong> Any produce item can be checked at delivery. If you are unsatisfied with freshness, request an instant replacement or immediate refund credit within 24 hours of delivery.
                  </p>
                  <p>
                    • <strong>Dairy & Perishables:</strong> Must be reported within 12 hours with batch details for immediate replacement.
                  </p>
                  <p>
                    • <strong>Packaged Grocery & Household Goods:</strong> Eligible for return or exchange within 48 hours if sealed and undamaged.
                  </p>
                  <p>
                    • <strong>Refund Processing:</strong> Refunds for online payments (UPI/Cards) reflect back into source account within 2–4 hours. COD refunds are issued as instant Pravdhan wallet balance or direct UPI payout.
                  </p>
                </>
              )}

              {activePolicy === 'privacy' && (
                <>
                  <p className="font-bold text-slate-800">
                    Your Privacy & Data Security:
                  </p>
                  <p>
                    • <strong>Contact Details:</strong> Your phone number and delivery addresses are utilized solely to fulfill orders, transmit live dispatch tracking, and notify you of delivery status.
                  </p>
                  <p>
                    • <strong>Zero Third-Party Data Selling:</strong> We never sell, rent, or lease customer contact information to third-party telemarketers.
                  </p>
                  <p>
                    • <strong>Payment Information:</strong> Pravdhan Store complies with RBI tokenization guidelines. We do not store full credit/debit card credentials on our servers.
                  </p>
                </>
              )}

              {activePolicy === 'terms' && (
                <>
                  <p className="font-bold text-slate-800">
                    Pravdhan Store Terms & Delivery Guidelines:
                  </p>
                  <p>
                    • <strong>Coverage Area:</strong> Instant delivery (12–15 minutes) is operational across Sector 14, Model Town, and immediate Zone 1 boundaries in Gurugram.
                  </p>
                  <p>
                    • <strong>Order Minimum:</strong> The store maintains a ₹100 minimum order threshold to preserve free doorstep delivery for the local community.
                  </p>
                  <p>
                    • <strong>Operating Hours:</strong> Our dispatch hub operates from 7:00 AM to 10:00 PM daily. Orders placed outside operating hours are dispatched in the first morning 7:00 AM slot.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
