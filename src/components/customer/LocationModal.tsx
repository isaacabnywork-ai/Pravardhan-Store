import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MapPin, Check, Plus, Home, Briefcase, Navigation, ArrowLeft } from 'lucide-react';
import { Address } from '@/types';

export const LocationModal: React.FC = () => {
  const {
    showLocationModal,
    setShowLocationModal,
    addresses,
    selectedAddress,
    setDefaultAddress,
    addAddress,
  } = useStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',
    phone: '9876543210',
    houseNo: '',
    street: '',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    type: 'home' as 'home' | 'work' | 'other',
    isDefault: false,
  });

  const handleSelect = (addrId: string) => {
    setDefaultAddress(addrId);
    setShowLocationModal(false);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.houseNo || !formData.pincode) return;

    addAddress(formData);
    setIsAddingNew(false);
    setShowLocationModal(false);
  };

  return (
    <Modal
      isOpen={showLocationModal}
      onClose={() => {
        setShowLocationModal(false);
        setIsAddingNew(false);
      }}
      title={isAddingNew ? 'Add Delivery Address' : 'Select Delivery Location'}
      subtitle={isAddingNew ? 'Enter flat/house details' : 'Deliveries in 15-30 mins'}
      maxWidth="md"
    >
      {!isAddingNew ? (
        <div className="space-y-4 text-xs">
          {/* Quick GPS detect mock */}
          <button
            onClick={() => {
              setDefaultAddress(addresses[0]?.id || '');
              setShowLocationModal(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#CBE8CE] bg-[#F0F8F1] text-[#0C831F] hover:bg-[#E2F3E4] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0C831F] shadow-xs">
              <Navigation className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="font-bold leading-tight">Use Current GPS Location</p>
              <p className="text-[11px] text-[#0C831F]/80">Indiranagar 560038 • 15 min delivery</p>
            </div>
          </button>

          {/* Saved Addresses List */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Saved Addresses
            </span>

            {addresses.map((addr) => {
              const isSelected = selectedAddress?.id === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-[#0C831F] bg-[#F0F8F1] ring-1 ring-[#0C831F]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#0C831F] text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {addr.type === 'home' ? <Home className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-[#1C1C1C]">
                        <span>{addr.name}</span>
                        <span className="text-[9px] uppercase font-bold text-gray-500 bg-gray-100 px-1 py-0.2 rounded">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] leading-tight mt-0.5">
                        {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[#0C831F] font-bold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsAddingNew(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Address
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSaveNew} className="space-y-3 text-xs">
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="text-xs text-[#0C831F] font-bold flex items-center gap-1 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Saved Addresses</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                House / Flat / Building No.
              </label>
              <input
                type="text"
                required
                value={formData.houseNo}
                onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                placeholder="e.g. Flat 302, Green Glen"
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Street / Road
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="e.g. 12th Main Road"
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Area</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Pincode</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#0C831F]"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsAddingNew(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Save &amp; Deliver Here
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
