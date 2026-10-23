'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  CheckCircle2,
  ExternalLink,
  Save,
  Eye,
  Sparkles,
  Search,
  MapPin,
  ShoppingBag,
  Bell,
  Sun,
  Layout,
  Menu,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';

export default function HeaderBuilderPage() {
  const { headerConfig, updateHeader, menus } = useCms();
  const [formData, setFormData] = useState(headerConfig);
  const [saveToast, setSaveToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHeader(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Header configuration saved & updated across storefront!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Header & Navigation Builder
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Storefront Navigation
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Customize announcement bar, sticky positioning, search bar, location pill, and primary navigation menus
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
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Header Settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Header Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Announcement Bar Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top Announcement Bar</h3>
                <p className="text-xs text-slate-500">Promotional bar displayed at the very top of your site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showAnnouncementBar}
                  onChange={(e) => setFormData({ ...formData, showAnnouncementBar: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {formData.showAnnouncementBar && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={formData.announcementBarText}
                    onChange={(e) => setFormData({ ...formData, announcementBarText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Promotion Link URL</label>
                  <input
                    type="text"
                    value={formData.announcementBarLink || ''}
                    onChange={(e) => setFormData({ ...formData, announcementBarLink: e.target.value })}
                    placeholder="/deals"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Bar Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.announcementBarBg}
                        onChange={(e) => setFormData({ ...formData, announcementBarBg: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.announcementBarBg}
                        onChange={(e) => setFormData({ ...formData, announcementBarBg: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.announcementBarTextColor}
                        onChange={(e) => setFormData({ ...formData, announcementBarTextColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.announcementBarTextColor}
                        onChange={(e) => setFormData({ ...formData, announcementBarTextColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Main Navigation Bar Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Header Elements & Layout</h3>
              <p className="text-xs text-slate-500">Enable or disable core functional modules</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <span>Sticky Header (Stay pinned on scroll)</span>
                <input
                  type="checkbox"
                  checked={formData.isSticky}
                  onChange={(e) => setFormData({ ...formData, isSticky: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <span>Search Bar with Auto-Complete</span>
                <input
                  type="checkbox"
                  checked={formData.showSearchBar}
                  onChange={(e) => setFormData({ ...formData, showSearchBar: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <span>Delivery Location Pill (Sector 14)</span>
                <input
                  type="checkbox"
                  checked={formData.showLocationPicker}
                  onChange={(e) => setFormData({ ...formData, showLocationPicker: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <span>Quick Category Nav Strip</span>
                <input
                  type="checkbox"
                  checked={formData.showCategoryPills}
                  onChange={(e) => setFormData({ ...formData, showCategoryPills: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <span>Cart Drawer Icon & Counter</span>
                <input
                  type="checkbox"
                  checked={formData.showCart}
                  onChange={(e) => setFormData({ ...formData, showCart: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <span>Dark / Light Mode Toggle</span>
                <input
                  type="checkbox"
                  checked={formData.showThemeToggle}
                  onChange={(e) => setFormData({ ...formData, showThemeToggle: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Header Preview</h3>
            <p className="text-xs text-slate-500">Live preview of the announcement bar & layout</p>

            {/* Mock Header Display */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              {formData.showAnnouncementBar && (
                <div
                  className="py-1.5 px-3 text-[10px] font-bold text-center truncate"
                  style={{
                    backgroundColor: formData.announcementBarBg,
                    color: formData.announcementBarTextColor,
                  }}
                >
                  {formData.announcementBarText}
                </div>
              )}
              <div className="p-3 bg-white flex items-center justify-between gap-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <span className="w-5 h-5 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-[10px]">
                    PS
                  </span>
                  <span>Pravdhan</span>
                </div>
                {formData.showSearchBar && (
                  <div className="h-6 bg-slate-100 rounded-lg flex-1 max-w-[120px] px-2 flex items-center text-[10px] text-slate-400">
                    Search...
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-500">
                  {formData.showLocationPicker && <MapPin className="w-3.5 h-3.5" />}
                  {formData.showCart && <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
