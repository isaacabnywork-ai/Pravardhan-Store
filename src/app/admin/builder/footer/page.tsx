'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Save,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';

export default function FooterBuilderPage() {
  const { footerConfig, updateFooter } = useCms();
  const [formData, setFormData] = useState(footerConfig);
  const [saveToast, setSaveToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFooter(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Footer settings saved & updated across storefront!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Footer Builder
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Storefront Base
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure columns, support contacts, legal policies, payment trust badges, and copyright notices
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Preview on Site</span>
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Footer</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Footer & Brand Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Brand Summary & Contacts</h3>
              <p className="text-xs text-slate-500">About statement and customer care credentials</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">About Store Summary</label>
                <textarea
                  rows={3}
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Support Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Facility Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Copyright Notice</label>
                <input
                  type="text"
                  value={formData.copyrightText}
                  onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Badges & Trust */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Payment Trust Badges</h3>
              <p className="text-xs text-slate-500">Security logos displayed in the footer strip</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-2">
                {formData.paymentBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold border border-slate-200"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Styling & Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Footer Styling</h3>
            <p className="text-slate-500">Background and text colors</p>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Footer Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.footerBg}
                  onChange={(e) => setFormData({ ...formData, footerBg: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.footerBg}
                  onChange={(e) => setFormData({ ...formData, footerBg: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.footerTextColor}
                  onChange={(e) => setFormData({ ...formData, footerTextColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.footerTextColor}
                  onChange={(e) => setFormData({ ...formData, footerTextColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save & Update Footer
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
