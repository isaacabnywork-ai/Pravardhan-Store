'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { storeSettings, updateStoreSettings } = useStore();

  const [formData, setFormData] = useState({
    storeName: storeSettings.storeName,
    tagline: storeSettings.tagline,
    serviceArea: storeSettings.serviceArea,
    city: storeSettings.city,
    minimumOrderValue: storeSettings.minimumOrderValue,
    defaultDeliveryCharge: storeSettings.defaultDeliveryCharge,
    freeDeliveryThreshold: storeSettings.freeDeliveryThreshold,
    operatingHours: storeSettings.operatingHours,
    supportPhone: storeSettings.supportPhone,
    supportEmail: storeSettings.supportEmail,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      ...formData,
      minimumOrderValue: Number(formData.minimumOrderValue),
      defaultDeliveryCharge: Number(formData.defaultDeliveryCharge),
      freeDeliveryThreshold: Number(formData.freeDeliveryThreshold),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Rules & Operational Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure business rules, minimum cart value, delivery charges, and local store parameters (Spec Section 7 & 8)
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Settings saved successfully! Minimum order rule and delivery fees updated across the live store.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Rules (Spec Section 7 & 8) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Core Commercial & Checkout Rules (Configurable)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Changes here are verified server-side and take effect on customer checkouts immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Minimum Order Value */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <label className="font-bold text-amber-900 block">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.minimumOrderValue}
                onChange={(e) =>
                  setFormData({ ...formData, minimumOrderValue: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-amber-300 font-black text-base bg-white text-slate-900"
              />
              <p className="text-[10px] text-amber-800">
                Spec Section 8: Orders under this value cannot proceed to checkout.
              </p>
            </div>

            {/* Default Delivery Charge */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <label className="font-bold text-emerald-900 block">
                Default Delivery Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.defaultDeliveryCharge}
                onChange={(e) =>
                  setFormData({ ...formData, defaultDeliveryCharge: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-emerald-300 font-black text-base bg-white text-slate-900"
              />
              <p className="text-[10px] text-emerald-800">
                Spec Section 7: Currently set to ₹0. Can be updated dynamically.
              </p>
            </div>

            {/* Free Delivery Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.freeDeliveryThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-base bg-white text-slate-900"
              />
              <p className="text-[10px] text-slate-500">
                Threshold for promotional ₹0 shipping if delivery charge is &gt; 0.
              </p>
            </div>
          </div>
        </div>

        {/* Store Profile & Logistics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-700" />
              <span>Physical Retail Entity & Local Service Area</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand Tagline</label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Initial Serviceable Area (V1 Hub)
              </label>
              <input
                type="text"
                required
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Operating Hours</label>
              <input
                type="text"
                required
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Support Phone</label>
              <input
                type="text"
                required
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                required
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
