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
  X
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
        email: `${phoneInput}@pravardhanstore.in`,
      });
      setShowOtpModal(false);
      setOtpSent(false);
    } else {
      alert('Enter OTP (use 1234 for demo)');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg">
              {isLoggedIn ? userProfile.name[0] : <User className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#0F172A]">
                {isLoggedIn ? userProfile.name : 'Welcome to Pravardhan Store'}
              </h1>
              <p className="text-xs text-[#64748B]">
                {isLoggedIn ? `+91 ${userProfile.phone}` : 'Log in to track orders & save addresses'}
              </p>
            </div>
          </div>

          {!isLoggedIn ? (
            <button
              onClick={() => setShowOtpModal(true)}
              className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg transition-all shadow-xs"
            >
              Login / Sign Up
            </button>
          ) : (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-[#64748B] hover:text-[#DC2626] font-semibold p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Account Navigation Grid */}
      <div className="space-y-3">
        {/* Shopping Links */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-slate-100 overflow-hidden shadow-xs">
          <Link
            href="/orders"
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB]">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#0F172A] block">
                  My Orders
                </span>
                <span className="text-[11px] text-[#64748B]">Track active orders & order again</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </Link>

          <Link
            href="/account/wishlist"
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-50 text-[#DC2626]">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#0F172A] block">
                  My Wishlist ({wishlistProducts.length})
                </span>
                <span className="text-[11px] text-[#64748B]">Saved favorite groceries</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </Link>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-[#0F172A]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#0F172A] block">
                  Delivery Addresses ({addresses.length})
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Default: {currentAddress?.houseFlat}, {currentAddress?.area}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {/* Store Information & Admin Access */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-slate-100 overflow-hidden shadow-xs">
          <Link
            href="/admin"
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB]">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#0F172A] block">
                  Store Partner Admin
                </span>
                <span className="text-[11px] text-[#2563EB] font-semibold">
                  Manage stock, pricing, orders & delivery slots
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </Link>

          <div className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              <Store className="w-4 h-4 text-[#2563EB]" /> Store Details & Support
            </div>
            <div className="text-xs text-[#64748B] space-y-1">
              <p>📍 Shop 12-14, Sector 4 Market, Gomti Nagar, Lucknow - 226010</p>
              <p>📞 Phone Support: +91 98765 43210 (7 AM - 10 PM)</p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Login Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-xl p-5 shadow-xl relative border border-[#E2E8F0]">
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtpSent(false);
              }}
              className="absolute top-3 right-3 p-1 text-[#64748B] hover:text-[#0F172A] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2.5">
              <Phone className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#0F172A]">
              {otpSent ? 'Enter OTP' : 'Login with Mobile'}
            </h3>
            <p className="text-xs text-[#64748B] mb-3">
              {otpSent
                ? `Enter 4-digit OTP sent to +91 ${phoneInput}`
                : 'Enter your 10-digit mobile number'}
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-2.5">
                <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#2563EB]">
                  <span className="px-2.5 text-xs font-bold text-[#64748B] bg-slate-50 border-r border-[#E2E8F0] py-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-2 text-xs font-bold text-[#0F172A] outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneInput.length !== 10}
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-2.5">
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Demo: 1234"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center text-lg font-black tracking-widest p-2 border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg transition-all"
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
