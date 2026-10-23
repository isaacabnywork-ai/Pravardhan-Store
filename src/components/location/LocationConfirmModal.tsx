'use client';

import React, { useState, useEffect } from 'react';
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
  Building2,
  BookUser,
  MoreHorizontal,
  Share2,
  Trash2,
  Pencil,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';

export interface SavedLocation {
  id: string;
  title: string;
  distance: string;
  address: string;
  city: string;
  area: string;
  completeAddress: string;
  mapsLink?: string;
  recipientType: 'myself' | 'someone_else';
  receiverName: string;
  phone: string;
  tag?: string | null;
  isDefault?: boolean;
}

const DEFAULT_INITIAL_ADDRESSES: SavedLocation[] = [
  {
    id: 'addr-vrindavan-1',
    title: 'Home',
    distance: '1.38 km',
    city: 'Lucknow',
    area: 'Vrindavan Colony',
    completeAddress: 'Vrindavan Yojna, 4/279, Sector 4',
    address: 'Vrindavan Yojna, 4/279, Sector 4, Vrindavan Colony, Lucknow, Uttar Pradesh 226029',
    recipientType: 'someone_else',
    receiverName: 'Rahul Sharma',
    phone: '7080907954',
    tag: null,
    isDefault: true,
  },
  {
    id: 'addr-gurugram-1',
    title: 'Home (Current)',
    distance: '0.6 km',
    city: 'Gurugram',
    area: 'Sector 14, DLF Phase 1',
    completeAddress: 'House No. 42B, 2nd Floor, Arjun Marg',
    address: 'House No. 42B, 2nd Floor, Arjun Marg, DLF Phase 1, Sector 14, Gurugram, Haryana 122001',
    recipientType: 'myself',
    receiverName: 'Rahul Sharma',
    phone: '9876543210',
    tag: 'Express delivery',
    isDefault: false,
  },
  {
    id: 'addr-gurugram-2',
    title: 'Work / Cyber Hub',
    distance: '1.8 km',
    city: 'Gurugram',
    area: 'Sector 14 Main Road',
    completeAddress: 'Tower B, Suite 405, Cyber City Expressway',
    address: 'Tower B, Suite 405, Cyber City Expressway, Sector 14 Main Road, Gurugram, Haryana 122002',
    recipientType: 'myself',
    receiverName: 'Rahul Sharma',
    phone: '9876543210',
    tag: '12-min delivery',
    isDefault: false,
  },
];

const POPULAR_CITIES = [
  { name: 'Gurugram', state: 'Haryana', hub: 'Dark Store #01 (Active)' },
  { name: 'Lucknow', state: 'Uttar Pradesh', hub: 'Vrindavan Hub (Active)' },
  { name: 'Delhi NCR', state: 'Delhi', hub: 'South Delhi Hub' },
  { name: 'Noida', state: 'Uttar Pradesh', hub: 'Sector 62 Hub' },
  { name: 'Bengaluru', state: 'Karnataka', hub: 'Koramangala Hub' },
  { name: 'Mumbai', state: 'Maharashtra', hub: 'Andheri Hub' },
  { name: 'Jaipur', state: 'Rajasthan', hub: 'Jagatpura Hub' },
];

const POPULAR_AREAS: Record<string, string[]> = {
  Gurugram: [
    'Sector 14, Model Town',
    'DLF Phase 1 & 2, Arjun Marg',
    'Cyber City Expressway',
    'Sushant Lok 1',
    'Golf Course Road',
    'Sector 49, Sohna Road',
  ],
  Lucknow: [
    'Vrindavan Yojna, Sector 4',
    'Gomti Nagar, Patrakarpuram',
    'Hazratganj Main Market',
    'Aliganj, Sector B',
    'Indira Nagar, Sector 14',
    'Gopeshkunj, Sector 6C',
  ],
  'Delhi NCR': [
    'Connaught Place',
    'Hauz Khas',
    'Vasant Kunj',
    'Greater Kailash 1 & 2',
    'Saket',
  ],
  Noida: [
    'Sector 18 Market',
    'Sector 62 IT Park',
    'Sector 137 Expressway',
    'Sector 76 Metro',
  ],
  Jaipur: [
    'Jagatpura, Shree Vihar Colony',
    'Malviya Nagar',
    'Vaishali Nagar',
    'Mansarovar',
  ],
};

const STORAGE_KEY = 'pravdhan_saved_addresses_v3';

export function LocationConfirmModal() {
  const { isLocationModalOpen, setIsLocationModalOpen, selectedZone, setSelectedZone } = useCart();
  const { user, addAddress, updateAddress, deleteAddress: authDeleteAddress } = useAuth();

  // Mode: 'LIST' (Select delivery location) or 'FORM' (Add/Edit address details)
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');

  // Addresses list
  const [savedAddresses, setSavedAddresses] = useState<SavedLocation[]>(DEFAULT_INITIAL_ADDRESSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3-Dots Options Bottom Sheet state
  const [optionsAddress, setOptionsAddress] = useState<SavedLocation | null>(null);

  // Address Form State (matches Image 1)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formCity, setFormCity] = useState('Gurugram');
  const [formArea, setFormArea] = useState('Sector 14, Model Town');
  const [formCompleteAddress, setFormCompleteAddress] = useState('');
  const [formMapsLink, setFormMapsLink] = useState('');
  const [formRecipientType, setFormRecipientType] = useState<'myself' | 'someone_else'>('someone_else');
  const [formReceiverName, setFormReceiverName] = useState('');
  const [formReceiverPhone, setFormReceiverPhone] = useState('');
  const [formSaveAs, setFormSaveAs] = useState('');

  // Inline City / Area Pickers inside the Form
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [isAreaPickerOpen, setIsAreaPickerOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [customAreaInput, setCustomAreaInput] = useState('');

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    city?: string;
    area?: string;
    completeAddress?: string;
    receiverName?: string;
    receiverPhone?: string;
  }>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed);
        }
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  // Save to localStorage when addresses change
  const persistAddresses = (newAddresses: SavedLocation[]) => {
    setSavedAddresses(newAddresses);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddresses));
    } catch {
      // ignore
    }
  };

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

  // Open "Add address details" screen (Image 1)
  const handleOpenAddForm = () => {
    setEditingAddressId(null);
    setFormCity('Gurugram');
    setFormArea('Sector 14, Model Town');
    setFormCompleteAddress('');
    setFormMapsLink('');
    setFormRecipientType('someone_else');
    setFormReceiverName(user?.name || '');
    setFormReceiverPhone(user?.phone || '');
    setFormSaveAs('Home');
    setFormErrors({});
    setIsCityPickerOpen(false);
    setIsAreaPickerOpen(false);
    setViewMode('FORM');
  };

  // Open "Edit address details" screen (Image 1 prefilled)
  const handleOpenEditForm = (addr: SavedLocation) => {
    setEditingAddressId(addr.id);
    setFormCity(addr.city || 'Gurugram');
    setFormArea(addr.area || 'Sector 14, Model Town');
    setFormCompleteAddress(addr.completeAddress || addr.address);
    setFormMapsLink(addr.mapsLink || '');
    setFormRecipientType(addr.recipientType || 'someone_else');
    setFormReceiverName(addr.receiverName || addr.title);
    setFormReceiverPhone(addr.phone || '9876543210');
    setFormSaveAs(addr.title || 'Home');
    setFormErrors({});
    setIsCityPickerOpen(false);
    setIsAreaPickerOpen(false);
    setOptionsAddress(null);
    setViewMode('FORM');
  };

  // Delete address action (Image 2)
  const handleDeleteAddress = (addr: SavedLocation) => {
    const filtered = savedAddresses.filter((a) => a.id !== addr.id);
    persistAddresses(filtered);
    if (user) {
      authDeleteAddress(addr.id);
    }
    setOptionsAddress(null);
    showToast(`Deleted address "${addr.title}"`);
  };

  // Set as delivery address action (Image 2)
  const handleSetAsDeliveryAddress = (addr: SavedLocation) => {
    const updated = savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addr.id,
    }));
    persistAddresses(updated);
    setOptionsAddress(null);
    showToast(`Set "${addr.title}" as delivery address`);
    handleSelectAddress(addr.title, addr.address);
  };

  // Handle Save from "Add/Edit address details" form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof formErrors = {};
    if (!formCity.trim()) errors.city = 'Please select a city';
    if (!formArea.trim()) errors.area = 'Please select an area or street';
    if (!formCompleteAddress.trim()) errors.completeAddress = 'Please enter your complete address';
    if (!formReceiverName.trim()) errors.receiverName = "Please enter receiver's name";
    if (!formReceiverPhone.trim()) {
      errors.receiverPhone = "Please enter receiver's phone number";
    } else if (formReceiverPhone.trim().replace(/\D/g, '').length < 10) {
      errors.receiverPhone = 'Phone number must be at least 10 digits';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const fullAddrString = `${formCompleteAddress.trim()}, ${formArea.trim()}, ${formCity.trim()}`;
    const displayTitle = formSaveAs.trim() || (formRecipientType === 'myself' ? 'Home' : formReceiverName.trim() || 'Address');

    if (editingAddressId) {
      // Update existing
      const updated = savedAddresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            title: displayTitle,
            city: formCity.trim(),
            area: formArea.trim(),
            completeAddress: formCompleteAddress.trim(),
            address: fullAddrString,
            mapsLink: formMapsLink.trim() || undefined,
            recipientType: formRecipientType,
            receiverName: formReceiverName.trim(),
            phone: formReceiverPhone.trim(),
            tag: a.tag || null,
          };
        }
        return a;
      });
      persistAddresses(updated);
      if (user) {
        updateAddress(editingAddressId, {
          name: formReceiverName.trim(),
          phone: formReceiverPhone.trim(),
          houseNumber: formCompleteAddress.trim(),
          street: formArea.trim(),
          city: formCity.trim(),
          area: formArea.trim(),
        });
      }
      showToast('Address updated successfully!');
      handleSelectAddress(displayTitle, fullAddrString);
    } else {
      // Create new
      const newAddr: SavedLocation = {
        id: `addr-${Date.now()}`,
        title: displayTitle,
        distance: '0.8 km',
        city: formCity.trim(),
        area: formArea.trim(),
        completeAddress: formCompleteAddress.trim(),
        address: fullAddrString,
        mapsLink: formMapsLink.trim() || undefined,
        recipientType: formRecipientType,
        receiverName: formReceiverName.trim(),
        phone: formReceiverPhone.trim(),
        tag: 'Just added',
        isDefault: true,
      };

      const updated = [newAddr, ...savedAddresses.map((a) => ({ ...a, isDefault: false }))];
      persistAddresses(updated);
      if (user) {
        addAddress({
          label: 'Home',
          name: formReceiverName.trim(),
          phone: formReceiverPhone.trim(),
          houseNumber: formCompleteAddress.trim(),
          street: formArea.trim(),
          area: formArea.trim(),
          city: formCity.trim(),
          pincode: '122001',
          isDefault: true,
        });
      }
      showToast('New address saved!');
      handleSelectAddress(displayTitle, fullAddrString);
    }

    setViewMode('LIST');
  };

  const filteredAddresses = savedAddresses.filter(
    (a) =>
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery.trim())
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
        className="relative w-full max-w-lg bg-[#F8F9FA] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Dark Close Button at top (Visible on main modal) */}
        {viewMode === 'LIST' && (
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            aria-label="Close location selector"
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900/90 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 active:scale-95 transition-all z-50 border border-white/20 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Global Toast Message Feedback */}
        {toastMessage && (
          <div className="absolute top-3 left-4 right-4 z-50 bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: FORM VIEW (Matches Image 1: Add Address Details)  */}
        {/* ========================================================= */}
        {viewMode === 'FORM' ? (
          <div className="flex flex-col h-full max-h-[90vh] bg-white text-slate-900">
            {/* Header: Back Arrow + Title */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                aria-label="Back to saved locations"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                {editingAddressId ? 'Edit address details' : 'Add address details'}
              </h3>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* SECTION 1: Address details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">
                  Address details
                </h4>

                {/* 1. Select a city Card */}
                <div className="border border-gray-200/90 rounded-2xl p-3 sm:p-3.5 bg-white flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        City
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate block">
                        {formCity || 'Select a city'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCityPickerOpen(!isCityPickerOpen);
                      setIsAreaPickerOpen(false);
                    }}
                    className="px-3.5 py-1 text-xs font-bold text-[#0F5132] border border-[#0F5132] hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                  >
                    Select
                  </button>
                </div>

                {/* Inline City Picker Dropdown */}
                {isCityPickerOpen && (
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 animate-in fade-in">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Popular Service Cities
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {POPULAR_CITIES.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setFormCity(c.name);
                            if (POPULAR_AREAS[c.name]) {
                              setFormArea(POPULAR_AREAS[c.name][0]);
                            }
                            setIsCityPickerOpen(false);
                            if (formErrors.city) {
                              setFormErrors((prev) => ({ ...prev, city: undefined }));
                            }
                          }}
                          className={`p-2 rounded-xl text-left border transition-all text-xs ${
                            formCity === c.name
                              ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span className="font-bold block">{c.name}</span>
                          <span className="text-[9px] text-gray-400 block">{c.state}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Or type custom city..."
                        value={customCityInput}
                        onChange={(e) => setCustomCityInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customCityInput.trim()) {
                            setFormCity(customCityInput.trim());
                            setCustomCityInput('');
                            setIsCityPickerOpen(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#0F5132] text-white text-xs font-bold rounded-lg"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
                {formErrors.city && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{formErrors.city}</p>
                )}

                {/* 2. Select an area, street Card */}
                <div className="border border-gray-200/90 rounded-2xl p-3 sm:p-3.5 bg-white flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        Area / Locality
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate block">
                        {formArea || 'Select an area, street'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAreaPickerOpen(!isAreaPickerOpen);
                      setIsCityPickerOpen(false);
                    }}
                    className="px-3.5 py-1 text-xs font-bold text-[#0F5132] border border-[#0F5132] hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                  >
                    Select
                  </button>
                </div>

                {/* Inline Area Picker Dropdown */}
                {isAreaPickerOpen && (
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 animate-in fade-in">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Popular Areas in {formCity}
                    </span>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {(POPULAR_AREAS[formCity] || POPULAR_AREAS['Gurugram']).map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            setFormArea(area);
                            setIsAreaPickerOpen(false);
                            if (formErrors.area) {
                              setFormErrors((prev) => ({ ...prev, area: undefined }));
                            }
                          }}
                          className={`w-full p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                            formArea === area
                              ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span>{area}</span>
                          {formArea === area && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Or enter custom area / street..."
                        value={customAreaInput}
                        onChange={(e) => setCustomAreaInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customAreaInput.trim()) {
                            setFormArea(customAreaInput.trim());
                            setCustomAreaInput('');
                            setIsAreaPickerOpen(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#0F5132] text-white text-xs font-bold rounded-lg"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
                {formErrors.area && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{formErrors.area}</p>
                )}

                {/* 3. Enter complete address* */}
                <div>
                  <input
                    type="text"
                    value={formCompleteAddress}
                    onChange={(e) => {
                      setFormCompleteAddress(e.target.value);
                      if (formErrors.completeAddress) {
                        setFormErrors((prev) => ({ ...prev, completeAddress: undefined }));
                      }
                    }}
                    placeholder="Enter complete address*"
                    className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5132] shadow-2xs ${
                      formErrors.completeAddress ? 'border-rose-400' : 'border-gray-200/90'
                    }`}
                  />
                  <p className="text-[11px] text-gray-400 mt-1 pl-1">
                    Example: Plot No. 112, Shree Vihar Colony, Jagatpura
                  </p>
                  {formErrors.completeAddress && (
                    <p className="text-[11px] text-rose-600 font-medium pl-1 mt-0.5">
                      {formErrors.completeAddress}
                    </p>
                  )}
                </div>

                {/* 4. Add google maps link (optional) */}
                <div className="border border-gray-200/90 rounded-2xl px-3.5 py-2.5 bg-white flex items-center gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 text-red-500">
                    <MapPin className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                  <input
                    type="url"
                    value={formMapsLink}
                    onChange={(e) => setFormMapsLink(e.target.value)}
                    placeholder="Add google maps link (optional)"
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 2: Contact details */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">
                  Contact details
                </h4>

                {/* Myself / Someone else Radio Buttons */}
                <div className="flex items-center gap-6 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={formRecipientType === 'myself'}
                      onChange={() => {
                        setFormRecipientType('myself');
                        setFormReceiverName(user?.name || 'Rahul Sharma');
                        setFormReceiverPhone(user?.phone || '9876543210');
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        formRecipientType === 'myself'
                          ? 'border-[#0F5132] bg-[#0F5132]'
                          : 'border-gray-400 bg-white'
                      }`}
                    >
                      {formRecipientType === 'myself' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">Myself</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={formRecipientType === 'someone_else'}
                      onChange={() => {
                        setFormRecipientType('someone_else');
                        if (formReceiverName === (user?.name || 'Rahul Sharma')) {
                          setFormReceiverName('');
                        }
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        formRecipientType === 'someone_else'
                          ? 'border-[#0F5132] bg-[#0F5132]'
                          : 'border-gray-400 bg-white'
                      }`}
                    >
                      {formRecipientType === 'someone_else' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      Someone else
                    </span>
                  </label>
                </div>

                {/* Receiver's name* */}
                <div>
                  <input
                    type="text"
                    value={formReceiverName}
                    onChange={(e) => {
                      setFormReceiverName(e.target.value);
                      if (formErrors.receiverName) {
                        setFormErrors((prev) => ({ ...prev, receiverName: undefined }));
                      }
                    }}
                    placeholder="Receiver's name*"
                    className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5132] shadow-2xs ${
                      formErrors.receiverName ? 'border-rose-400' : 'border-gray-200/90'
                    }`}
                  />
                  {formErrors.receiverName && (
                    <p className="text-[11px] text-rose-600 font-medium pl-1 mt-0.5">
                      {formErrors.receiverName}
                    </p>
                  )}
                </div>

                {/* Receiver's phone number* with Contact Book Icon */}
                <div>
                  <div
                    className={`border rounded-2xl px-4 py-2.5 bg-white flex items-center justify-between shadow-2xs focus-within:ring-2 focus-within:ring-[#0F5132] ${
                      formErrors.receiverPhone ? 'border-rose-400' : 'border-gray-200/90'
                    }`}
                  >
                    <input
                      type="tel"
                      value={formReceiverPhone}
                      onChange={(e) => {
                        setFormReceiverPhone(e.target.value);
                        if (formErrors.receiverPhone) {
                          setFormErrors((prev) => ({ ...prev, receiverPhone: undefined }));
                        }
                      }}
                      placeholder="Receiver's phone number*"
                      className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                    <div
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Contact Book"
                    >
                      <BookUser className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  {formErrors.receiverPhone && (
                    <p className="text-[11px] text-rose-600 font-medium pl-1 mt-0.5">
                      {formErrors.receiverPhone}
                    </p>
                  )}
                </div>

                {/* Save as address (optional) */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formSaveAs}
                    onChange={(e) => setFormSaveAs(e.target.value)}
                    placeholder="Save as address (optional)"
                    className="w-full bg-white border border-gray-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5132] shadow-2xs"
                  />
                  {/* Quick tag chips */}
                  <div className="flex items-center gap-2 pl-1">
                    {['Home', 'Work', 'Other'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setFormSaveAs(chip)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                          formSaveAs === chip
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Green "Next" Button */}
              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center cursor-pointer"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ====================================================================== */
          /* VIEW 2: LIST VIEW (Matches Image 2: Select delivery location & 3-dots) */
          /* ====================================================================== */
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                  Select delivery location
                </h3>
                <p className="text-xs text-gray-500">
                  Select your doorstep location for ultra-fast express delivery
                </p>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for area, street name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent shadow-2xs"
              />
            </div>

            {/* Action List (Use current location, Add new address, Request, Import) */}
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
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Crosshair className="w-4 h-4 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 block">
                      Use current location
                    </span>
                    <span className="text-[11px] text-gray-500 block truncate">
                      Sector 11, Vrindavan Colony, Lucknow Division, Lucknow, Uttar Pradesh, 226029
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* 2. Add new address (Clicking this opens Image 1 form!) */}
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700">
                    Add new address
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
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
                  <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Phone className="w-3.5 h-3.5 fill-white stroke-none" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    Request address from someone else
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* 4. Import your addresses from Zomato */}
              <button
                type="button"
                onClick={() => {
                  showToast('Addresses synced successfully!');
                }}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-2xs font-bold text-[10px] tracking-tight">
                    zomato
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    Import your addresses from Zomato
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Saved Addresses Section */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Your saved addresses
              </h4>

              {filteredAddresses.map((addr) => {
                const isSelected =
                  selectedZone.includes(addr.title) ||
                  selectedZone.includes(addr.address.slice(0, 15)) ||
                  addr.isDefault;

                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr.title, addr.address)}
                    className={`bg-white rounded-2xl border p-3.5 space-y-2 shadow-2xs transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'border-[#0F5132] ring-2 ring-[#0F5132]/20'
                        : 'border-gray-200/90 hover:border-[#0F5132]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Address Icon Tile with Distance and Verified Checkmark badge */}
                        <div className="relative w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col items-center justify-center text-amber-700 shrink-0">
                          {isSelected && (
                            <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#0F5132] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          {addr.title.toLowerCase().includes('work') ? (
                            <Briefcase className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Home className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="text-[8px] font-bold text-gray-500 mt-0.5">
                            {addr.distance}
                          </span>
                        </div>

                        <div className="min-w-0 pr-1">
                          <div className="flex items-center gap-2 flex-wrap">
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
                            Phone number: {addr.phone}
                          </p>

                          {/* 3-Dots Button and Share Button Row (Matches Image 2!) */}
                          <div className="flex items-center gap-3 pt-2">
                            {/* 3-Dots Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOptionsAddress(addr);
                              }}
                              aria-label={`Options for ${addr.title}`}
                              className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Share Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof window !== 'undefined') {
                                  navigator.clipboard?.writeText(
                                    `Address: ${addr.title} - ${addr.address} (Ph: ${addr.phone})`
                                  );
                                }
                                showToast(`Address "${addr.title}" copied to share!`);
                              }}
                              aria-label={`Share ${addr.title}`}
                              className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center"
                            >
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Deliver Here badge */}
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-[#0F5132] group-hover:bg-[#0F5132] group-hover:text-white transition-colors shrink-0">
                        Deliver Here
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* BOTTOM SHEET MODAL: Select option (Matches Image 2!)                  */}
        {/* ====================================================================== */}
        {optionsAddress && (
          <div
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
            onClick={() => setOptionsAddress(null)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Select option */}
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-gray-900">
                  Select option
                </h3>
                <button
                  type="button"
                  onClick={() => setOptionsAddress(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Action Rows (Matches Image 2 exactly!) */}
              <div className="border border-gray-200/90 rounded-2xl divide-y divide-gray-100 overflow-hidden shadow-2xs">
                {/* 1. Delete address */}
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(optionsAddress)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-rose-600" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-rose-700">
                      Delete address
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Edit address */}
                <button
                  type="button"
                  onClick={() => handleOpenEditForm(optionsAddress)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Pencil className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                      Edit address
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3. Set as delivery address */}
                <button
                  type="button"
                  onClick={() => handleSetAsDeliveryAddress(optionsAddress)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-emerald-50/50 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-600 group-hover:text-emerald-700" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-emerald-800">
                      Set as delivery address
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}