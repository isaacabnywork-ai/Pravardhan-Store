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
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Select Delivery Location</h3>
              <p className="text-xs text-[#64748B]">Scheduled grocery delivery to your doorstep</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLocationModalOpen(false);
              setShowAddForm(false);
            }}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-slate-100 transition-colors"
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
              className="w-full flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-[#0F172A] text-left hover:bg-blue-50 transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#2563EB] shrink-0" />
              <div>
                <span className="text-xs font-bold block text-[#2563EB]">Use Current Location</span>
                <span className="text-[11px] text-[#64748B]">Detect via GPS / Network</span>
              </div>
            </button>

            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider pt-2">
              Saved Addresses
            </div>

            {addresses.map((addr) => {
              const isSelected = currentAddress?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]'
                      : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-[#0F172A]">
                      {addr.label === 'Home' ? (
                        <Home className="w-4 h-4" />
                      ) : (
                        <Briefcase className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-slate-100 text-[#64748B] px-1.5 py-0.5 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                        {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Phone: {addr.phone}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 bg-[#2563EB] text-white rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#2563EB] text-[#2563EB] font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </button>
          </div>
        ) : (
          /* Add Address Form */
          <form onSubmit={handleCreateAddress} className="mt-4 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[#0F172A]">Add New Delivery Address</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#2563EB] font-medium hover:underline"
              >
                Back to saved
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#64748B] block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abhinav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748B] block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#64748B] block mb-1">House / Flat / Building No.</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 903, Tower C"
                value={formData.houseFlat}
                onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
                className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs text-[#64748B] block mb-1">Street / Apartment / Society</label>
              <input
                type="text"
                required
                placeholder="e.g. Suraj Apartment, Shaheed Path"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#64748B] block mb-1">Area / Sector</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vrindavan Yojna"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748B] block mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 226029"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-[#2563EB]"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="text-xs text-[#64748B] block mb-1">Address Label</label>
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: lbl })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      formData.label === lbl
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs transition-colors"
            >
              Save Address & Deliver Here
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
