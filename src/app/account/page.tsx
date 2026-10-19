'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  ChevronRight,
  LogOut,
  Building,
  Home,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/lib/context/AuthContext';
import { useStore } from '@/lib/context/StoreContext';
import { Address } from '@/types';

export default function AccountPage() {
  const { user, role, logout, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { storeSettings } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home' as 'Home' | 'Office' | 'Other',
    name: user?.name || '',
    phone: user?.phone || '',
    houseNumber: '',
    street: '',
    landmark: '',
    area: 'Sector 14',
    city: 'Gurugram',
    pincode: '122001',
    isDefault: false,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.houseNumber || !newAddr.street || !newAddr.phone) return;
    addAddress(newAddr);
    setIsAdding(false);
    setNewAddr({
      label: 'Home',
      name: user?.name || '',
      phone: user?.phone || '',
      houseNumber: '',
      street: '',
      landmark: '',
      area: 'Sector 14',
      city: 'Gurugram',
      pincode: '122001',
      isDefault: false,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">My Profile & Addresses</span>
        </nav>

        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {user ? user.name : 'Guest User'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> +91 {user?.phone}
                </span>
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>My Orders</span>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Saved Addresses Section (Spec Section 10) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>Saved Delivery Addresses</span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage your home, office, and secondary delivery destinations
              </p>
            </div>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {isAdding && (
            <form
              onSubmit={handleAddSubmit}
              className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Add New Delivery Address</h3>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Label selector */}
              <div className="flex gap-2">
                {(['Home', 'Office', 'Other'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newAddr.label === lbl
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    House / Flat / Building No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102, Silver Oak Heights"
                    value={newAddr.houseNumber}
                    onChange={(e) => setNewAddr({ ...newAddr, houseNumber: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Street / Society / Sector
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 14, Main Road"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="Opposite Community Center"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={newAddr.area}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={newAddr.pincode}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save New Address
              </button>
            </form>
          )}

          {/* Addresses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 rounded-2xl border transition-all ${
                  addr.isDefault
                    ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {addr.label === 'Home' ? <Home className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                    <span>{addr.label}</span>
                  </span>
                  {addr.isDefault ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Default Address
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[10px] font-semibold text-slate-500 hover:text-emerald-700"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <p className="font-bold text-sm text-slate-900">{addr.name}</p>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  {addr.houseNumber}, {addr.street}
                </p>
                {addr.landmark && (
                  <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                )}
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {addr.area}, {addr.city} - {addr.pincode}
                </p>
                <p className="text-xs text-slate-700 font-bold mt-1">
                  Mobile: +91 {addr.phone}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
