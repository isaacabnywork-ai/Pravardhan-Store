'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User as UserIcon,
  ShoppingBag,
  Wallet,
  MessageSquare,
  Sun,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Heart,
  CreditCard,
  Share2,
  Info,
  Lock,
  Bell,
  LogOut,
  Plus,
  Trash2,
  X,
  Home,
  Building,
  Mail,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/lib/context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, addAddress, deleteAddress, setDefaultAddress } = useAuth();

  // Dialog & Modal states
  const [activeModal, setActiveModal] = useState<
    'address' | 'wallet' | 'help' | 'preferences' | 'toast' | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Address form states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home' as 'Home' | 'Office' | 'Other',
    name: user?.name || 'Rahul Sharma',
    phone: user?.phone || '7080907954',
    houseNumber: '',
    street: '',
    landmark: '',
    area: 'Sector 14',
    city: 'Gurugram',
    pincode: '122001',
    isDefault: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.houseNumber || !newAddr.street || !newAddr.phone) return;
    addAddress(newAddr);
    setIsAddingAddress(false);
    showToast('New address added successfully!');
    setNewAddr({
      label: 'Home',
      name: user?.name || 'Rahul Sharma',
      phone: user?.phone || '7080907954',
      houseNumber: '',
      street: '',
      landmark: '',
      area: 'Sector 14',
      city: 'Gurugram',
      pincode: '122001',
      isDefault: false,
    });
  };

  const handleShareApp = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: 'Pravdhan Store - 12-Min Express Grocery',
          text: 'Order fresh groceries, atta, dal, and daily essentials with express delivery in Gurugram!',
          url: window.location.origin,
        }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(window.location.origin);
        showToast('App link copied to clipboard!');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 pb-20 md:pb-6">
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Top App Bar with Back Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Identity (Large Avatar, Name, Phone Number) */}
        <div className="flex flex-col items-center justify-center text-center pt-2 pb-2">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200/90 flex items-center justify-center text-gray-800 shadow-2xs">
            <UserIcon className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mt-2.5">
            {user?.name || 'Your account'}
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {user?.phone ? `+91 ${user.phone}` : '7080907954'}
          </p>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-lg text-center animate-in fade-in duration-200">
            {toastMessage}
          </div>
        )}

        {/* 3 Quick Action Cards: Your orders, Pravdhan Money, Need help? */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Card 1: Your orders */}
          <Link
            href="/account/orders"
            className="bg-white rounded-2xl p-3 border border-gray-200/80 hover:border-gray-300 transition-all flex flex-col items-center justify-center text-center shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F5132] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Your orders</span>
          </Link>

          {/* Card 2: Pravdhan Money */}
          <button
            type="button"
            onClick={() => setActiveModal('wallet')}
            className="bg-white rounded-2xl p-3 border border-gray-200/80 hover:border-gray-300 transition-all flex flex-col items-center justify-center text-center shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Pravdhan Money</span>
          </button>

          {/* Card 3: Need help? */}
          <button
            type="button"
            onClick={() => setActiveModal('help')}
            className="bg-white rounded-2xl p-3 border border-gray-200/80 hover:border-gray-300 transition-all flex flex-col items-center justify-center text-center shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Need help?</span>
          </button>
        </div>

        {/* Appearance Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-semibold text-gray-900">
              Appearance
            </span>
          </div>
          <button
            type="button"
            onClick={() => showToast('Theme is set to Light')}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <span>LIGHT</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Content Preferences Card (With Green Border & NEW Badge) */}
        <div
          onClick={() => setActiveModal('preferences')}
          className="bg-white rounded-2xl p-3.5 border-2 border-emerald-600 flex items-center justify-between shadow-2xs cursor-pointer hover:bg-emerald-50/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">
              Content preferences
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              NEW
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* ================= SECTION 1: YOUR INFORMATION ================= */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">
            Your information
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveModal('address')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Address book
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              href="/shop"
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Your wishlist
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ================= SECTION 2: PAYMENT AND COUPONS ================= */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">
            Payment and coupons
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => showToast('UPI & Card payment preferences saved')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Payment settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('wallet')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Pravdhan Money
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ================= SECTION 3: OTHER INFORMATION ================= */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">
            Other Information
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handleShareApp}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Share the app
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Pravdhan Store: Sector 14, Model Town, Gurugram. Direct fulfillment hub.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  About us
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Strict RBI data compliance. No card credentials stored.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Account privacy
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Order SMS & WhatsApp updates are active')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  Notification preferences
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ================= SECTION 5: LOG OUT CARD ================= */}
        <div className="pt-1">
          <button
            type="button"
            onClick={logout}
            className="w-full bg-white rounded-2xl p-3.5 border border-gray-200/80 hover:border-rose-200 hover:bg-rose-50/20 transition-all flex items-center justify-between shadow-2xs group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4.5 h-4.5 text-gray-700 group-hover:text-rose-600 transition-colors" />
              <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                Log out
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* ================= SECTION 6: BRAND FOOTER ================= */}
        <div className="text-center pt-6 pb-4 space-y-1">
          <p className="text-lg font-black tracking-tight text-gray-400">
            Pravdhan Store
          </p>
          <p className="text-[11px] text-gray-400 font-medium">
            v18.39.1
          </p>
        </div>
      </main>

      {/* ================= ADDRESS BOOK MODAL ================= */}
      {activeModal === 'address' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0F5132]" />
                <span>Saved Delivery Addresses</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAddingAddress ? (
              <button
                type="button"
                onClick={() => setIsAddingAddress(true)}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#0F5132] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Address</span>
              </button>
            ) : (
              <form onSubmit={handleAddSubmit} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900">New Address Details</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  {(['Home', 'Office', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        newAddr.label === lbl
                          ? 'bg-[#0F5132] text-white border-[#0F5132]'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="House / Flat / Building No."
                  value={newAddr.houseNumber}
                  onChange={(e) => setNewAddr({ ...newAddr, houseNumber: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Street / Society / Sector"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F5132] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {user?.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    addr.isDefault
                      ? 'border-[#0F5132] bg-emerald-50/30 ring-1 ring-emerald-600/30'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                      {addr.label === 'Home' ? <Home className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                      <span>{addr.label}</span>
                    </span>
                    {addr.isDefault ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[10px] font-semibold text-gray-500 hover:text-[#0F5132]"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 leading-snug">
                    {addr.houseNumber}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Phone: +91 {addr.phone}</span>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= PRAVDHAN MONEY MODAL ================= */}
      {activeModal === 'wallet' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-600" />
                <span>Pravdhan Money</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Available Balance</span>
              <p className="text-3xl font-black text-amber-950">₹150.00</p>
              <p className="text-[10px] text-amber-700">Can be utilized for all express grocery orders</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                showToast('Wallet recharge flow opened');
              }}
              className="w-full py-2.5 bg-[#0F5132] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#054A29]"
            >
              Add Money to Wallet
            </button>
          </div>
        </div>
      )}

      {/* ================= NEED HELP MODAL ================= */}
      {activeModal === 'help' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-3.5 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <span>Pravdhan Customer Care</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              We are here to assist with express dispatch, delivery status, returns, and refunds from our Sector 14 Hub.
            </p>
            <div className="space-y-2">
              <a
                href="https://wa.me/911244567890"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center gap-3 text-xs font-bold text-emerald-900 hover:bg-[#25D366]/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <span>Chat on WhatsApp (+91 124 456 7890)</span>
              </a>
              <a
                href="mailto:care@pravdhanstore.in"
                className="w-full p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3 text-xs font-bold text-sky-900 hover:bg-sky-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>Email care@pravdhanstore.in</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTENT PREFERENCES MODAL ================= */}
      {activeModal === 'preferences' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-3.5 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
                <span>Content Preferences</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-700">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <span>Show 100% Vegetarian Filter</span>
                <input type="checkbox" defaultChecked className="accent-[#0F5132]" />
              </label>
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <span>Direct Organic Farm Deals</span>
                <input type="checkbox" defaultChecked className="accent-[#0F5132]" />
              </label>
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <span>Diwali & Festive Gifting Recommendations</span>
                <input type="checkbox" defaultChecked className="accent-[#0F5132]" />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                showToast('Preferences updated successfully!');
              }}
              className="w-full py-2.5 bg-[#0F5132] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#054A29]"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
