'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Phone,
  MapPin,
  PackageCheck,
  Heart,
  LogOut,
  ChevronRight,
  Store,
  Settings,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAddress } from '@/context/AddressContext';
import { useWishlist } from '@/context/WishlistContext';

export default function AccountPage() {
  const { addresses, currentAddress, setIsLocationModalOpen } = useAddress();
  const { wishlistProducts } = useWishlist();

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Abhinav Sharma',
    phone: '9876543210',
    email: 'abhinav@example.com',
  });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length === 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === '1234' || otpInput.length === 4) {
      setIsLoggedIn(true);
      setUserProfile({
        name: 'Abhinav Sharma',
        phone: phoneInput,
        email: `${phoneInput}@pravdhanstore.in`,
      });
      setShowOtpModal(false);
      setOtpSent(false);
    } else {
      alert('Enter OTP (use 1234 for demo)');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-green-50 rounded-2xl border border-emerald-100 p-5 mb-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
              {isLoggedIn ? userProfile.name[0] : <User className="w-7 h-7" />}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isLoggedIn ? userProfile.name : 'Welcome to Pravdhan Store'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isLoggedIn ? `+91 ${userProfile.phone}` : 'Log in to track grocery orders & save addresses'}
              </p>
            </div>
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => setShowOtpModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              Login / Sign Up
            </button>
          ) : (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-slate-400 hover:text-rose-600 font-semibold p-2 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Account Navigation Grid */}
      <div className="space-y-4">
        {/* Shopping Links */}
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
          <Link
            href="/orders"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <PackageCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                  My Orders
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Track active orders & 1-click reorder</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Link>

          <Link
            href="/account/wishlist"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-rose-600 transition-colors">
                  My Wishlist ({wishlistProducts.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Saved favorite groceries for fast buying</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </Link>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-blue-600 transition-colors">
                  Delivery Addresses ({addresses.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Active: {currentAddress?.houseFlat}, {currentAddress?.area}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        {/* Store Information & Admin Access */}
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
          <Link
            href="/admin"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                  Store Partner Admin
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Manage inventory stock, pricing, orders & delivery slots
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Link>

          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Store className="w-4 h-4 text-emerald-600" /> Store Details & Support
            </div>
            <div className="text-xs text-slate-500 space-y-1.5">
              <p>📍 Shop 12-14, Sector 4 Market, Lucknow - 226029</p>
              <p>📞 Customer Support: +91 98765 43210 (7:00 AM – 10:00 PM Daily)</p>
              <p className="flex items-center gap-1 text-emerald-700 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Quality Fresh Mandi Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Login Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtpSent(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Phone className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {otpSent ? 'Enter OTP' : 'Login with Mobile'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {otpSent
                ? `Enter 4-digit OTP sent to +91 ${phoneInput}`
                : 'Enter your 10-digit mobile number to continue'}
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                  <span className="px-3 text-xs font-black text-slate-600 bg-slate-50 border-r border-slate-200 py-2.5">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-2.5 text-xs font-bold text-slate-900 outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneInput.length !== 10}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Demo: 1234"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center text-xl font-black tracking-widest p-2.5 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Verify & Continue
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
