'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Crosshair,
  Plus,
  Phone,
  Home,
  Briefcase,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';

export function LocationConfirmModal() {
  const { isLocationModalOpen, setIsLocationModalOpen, selectedZone, setSelectedZone } = useCart();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState('');

  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr-gurugram-1',
      title: 'Home (Current)',
      distance: '0.6 km',
      address: 'House No. 42B, 2nd Floor, Arjun Marg, DLF Phase 1, Sector 14, Gurugram, Haryana 122001',
      phone: '9876543210',
      tag: 'Express delivery',
    },
    {
      id: 'addr-gurugram-2',
      title: 'Work / Cyber Hub',
      distance: '1.8 km',
      address: 'Tower B, Suite 405, Cyber City Expressway, Sector 14 Main Road, Gurugram, Haryana 122002',
      phone: '9876543210',
      tag: '12-min delivery',
    },
    {
      id: 'addr-vrindavan-1',
      title: 'Home (Lucknow)',
      distance: '1.38 km',
      address: 'Vrindavan Yojna, 4/279, Sector 4, Vrindavan Colony, Lucknow, Uttar Pradesh 226029',
      phone: '7080907954',
      tag: null,
    },
  ]);

  if (!isLocationModalOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectAddress = (label: string, fullAddress: string) => {
    const shortLabel = fullAddress.split(',').slice(0, 3).join(',').trim();
    setSelectedZone(shortLabel || label);
    setIsLocationModalOpen(false);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim()) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      title: 'New Address',
      distance: '0.8 km',
      address: newAddressInput.trim(),
      phone: user?.phone || '9876543210',
      tag: 'Just added',
    };
    setSavedAddresses([newAddr, ...savedAddresses]);
    handleSelectAddress('New Address', newAddressInput.trim());
    setNewAddressInput('');
    setIsAddingNew(false);
  };

  const filteredAddresses = savedAddresses.filter(
    (a) =>
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Delivery Location"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setIsLocationModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-[#F8F9FA] rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl max-h-[88vh] overflow-y-auto space-y-3.5 animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Dark Close Button at top */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(false)}
          aria-label="Close location selector"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900/90 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 active:scale-95 transition-all z-50 border border-white/20 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
              Confirm delivery location
            </h3>
            <p className="text-xs text-gray-500">
              Select your doorstep location for ultra-fast 8-12 min delivery
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for area, apartment, street name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent shadow-2xs"
          />
        </div>

        {/* Toast feedback if any */}
        {toastMessage && (
          <div className="bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Action List (White rounded rows with chevron) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden shadow-2xs">
          {/* 1. Use current location */}
          <button
            type="button"
            onClick={() =>
              handleSelectAddress(
                'Current Location',
                'Sector 14, Model Town, Gurugram, Haryana 122001'
              )
            }
            className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Crosshair className="w-4 h-4 text-emerald-600 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-emerald-700 block">
                  Use current location
                </span>
                <span className="text-[11px] text-gray-500 block truncate">
                  Sector 14, Model Town, Gurugram (Express Dark Store Hub)
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>

          {/* 2. Add new address */}
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-emerald-600 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-700">
                Add new address
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>

          {/* 3. Request address from someone else */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard?.writeText(window.location.origin);
              }
              showToast('WhatsApp request link copied to clipboard!');
            }}
            className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
                <Phone className="w-3.5 h-3.5 fill-white stroke-none" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                Request address from someone else
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>
        </div>

        {/* Inline Add Address Form if toggled */}
        {isAddingNew && (
          <form
            onSubmit={handleAddNewAddress}
            className="bg-white p-3.5 rounded-2xl border border-emerald-300 shadow-xs space-y-2.5 animate-in fade-in"
          >
            <p className="text-xs font-bold text-gray-900">Enter Delivery Address</p>
            <input
              type="text"
              required
              placeholder="Flat/House No., Floor, Building, Street..."
              value={newAddressInput}
              onChange={(e) => setNewAddressInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#054A29] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Save & Deliver Here
              </button>
            </div>
          </form>
        )}

        {/* Your saved addresses */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your saved addresses
          </h4>

          {filteredAddresses.map((addr) => {
            const isSelected = selectedZone.includes(addr.title) || selectedZone.includes(addr.address.slice(0, 15));
            return (
              <div
                key={addr.id}
                onClick={() => handleSelectAddress(addr.title, addr.address)}
                className={`bg-white rounded-2xl border p-3.5 space-y-2 shadow-2xs transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-[#0F5132] ring-2 ring-[#0F5132]/20'
                    : 'border-gray-200/90 hover:border-[#0F5132]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Icon Tile */}
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col items-center justify-center text-amber-700 flex-shrink-0">
                      {addr.title.toLowerCase().includes('work') ? (
                        <Briefcase className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Home className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="text-[8px] font-bold text-gray-500 mt-0.5">
                        {addr.distance}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#0F5132] transition-colors truncate">
                          {addr.title}
                        </h5>
                        {addr.tag && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                            {addr.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mt-0.5">
                        {addr.address}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-[#0F5132] group-hover:bg-[#0F5132] group-hover:text-white transition-colors flex-shrink-0">
                    Deliver Here
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
