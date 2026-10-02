'use client';

import React, { useState } from 'react';
import { useAddress } from '@/context/AddressContext';
import { MapPin, X, Check, Plus, Home, Briefcase, Navigation } from 'lucide-react';
import { Address } from '@/types';

export function LocationModal() {
  const {
    addresses,
    currentAddress,
    setCurrentAddress,
    addNewAddress,
    isLocationModalOpen,
    setIsLocationModalOpen,
  } = useAddress();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    houseFlat: '',
    street: '',
    area: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226029',
    landmark: '',
    label: 'Home' as 'Home' | 'Work' | 'Other',
    isDefault: false,
  });

  if (!isLocationModalOpen) return null;

  const handleSelect = (addr: Address) => {
    setCurrentAddress(addr);
    setIsLocationModalOpen(false);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.houseFlat || !formData.area || !formData.pincode) return;

    addNewAddress(formData);
    setShowAddForm(false);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl max-h-[85vh] overflow-y-auto no-scrollbar border border-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Delivery Location</h3>
              <p className="text-xs text-slate-500">Scheduled fresh grocery delivery to your doorstep</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLocationModalOpen(false);
              setShowAddForm(false);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!showAddForm ? (
          <div className="mt-4 space-y-3">
            {/* Quick Detect Location GPS */}
            <button
              onClick={() => {
                alert('GPS location detected: Sector 6, Vrindavan Yojna, Lucknow (226029)');
              }}
              className="w-full flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-slate-900 text-left hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold block text-emerald-700">Use Current Location</span>
                <span className="text-[11px] text-slate-500">Detect via GPS / Network</span>
              </div>
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
              Saved Addresses
            </div>

            {addresses.map((addr) => {
              const isSelected = currentAddress?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 shadow-sm'
                      : 'border-slate-200 hover:border-emerald-200 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {addr.label === 'Home' ? (
                        <Home className="w-4 h-4" />
                      ) : (
                        <Briefcase className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Phone: {addr.phone}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 bg-emerald-600 text-white rounded-full shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-emerald-500 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-50/60 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </button>
          </div>
        ) : (
          /* Add Address Form */
          <form onSubmit={handleCreateAddress} className="mt-4 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-slate-900">Add New Delivery Address</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-emerald-600 font-semibold hover:underline"
              >
                Back to saved
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abhinav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1 font-medium">House / Flat / Building No.</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 903, Tower C"
                value={formData.houseFlat}
                onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1 font-medium">Street / Apartment / Society</label>
              <input
                type="text"
                required
                placeholder="e.g. Suraj Apartment, Shaheed Path"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Area / Sector</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vrindavan Yojna"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-medium">Pincode</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 226029"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="text-xs text-slate-500 block mb-1 font-medium">Address Label</label>
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: lbl })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      formData.label === lbl
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20 active:scale-[0.98]"
            >
              Save Address & Deliver Here
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
