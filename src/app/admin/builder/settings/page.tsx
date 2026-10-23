'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Code,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';

export default function WebsiteSettingsPage() {
  const { websiteSettings, updateWebsiteSettings } = useCms();
  const [toast, setToast] = useState(false);

  // Form State
  const [siteName, setSiteName] = useState(websiteSettings.siteName);
  const [siteDescription, setSiteDescription] = useState(websiteSettings.siteDescription);
  const [maintenanceMode, setMaintenanceMode] = useState(websiteSettings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(websiteSettings.maintenanceMessage);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(websiteSettings.googleAnalyticsId || '');
  const [facebookPixelId, setFacebookPixelId] = useState(websiteSettings.facebookPixelId || '');
  const [customHeadCode, setCustomHeadCode] = useState(websiteSettings.customHeadCode || '');
  const [customFooterCode, setCustomFooterCode] = useState(websiteSettings.customFooterCode || '');
  const [enableCustomerReviews, setEnableCustomerReviews] = useState(websiteSettings.enableCustomerReviews);
  const [enableWishlist, setEnableWishlist] = useState(websiteSettings.enableWishlist);
  const [enableSearchSuggestions, setEnableSearchSuggestions] = useState(websiteSettings.enableSearchSuggestions);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWebsiteSettings({
      siteName,
      siteDescription,
      maintenanceMode,
      maintenanceMessage,
      googleAnalyticsId,
      facebookPixelId,
      customHeadCode,
      customFooterCode,
      enableCustomerReviews,
      enableWishlist,
      enableSearchSuggestions,
    });

    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Website settings updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/builder"
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
            >
              CMS Overview
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Website Settings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Storefront & CMS Website Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Configure site identity, enable maintenance lockouts, embed tracking scripts (GA4, Meta Pixel), and manage global storefront features.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Global Settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Site Identity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Settings className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Site Identity & Details
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Storefront Name *</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Global Store Description
                </label>
                <textarea
                  rows={2}
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode Lockout */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Maintenance Mode
                </h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            <p className="text-xs text-slate-500">
              When enabled, customer storefront visitors will see a graceful maintenance page while admin operators retain full access.
            </p>

            {maintenanceMode && (
              <div className="space-y-2 text-xs animate-in fade-in">
                <label className="font-bold text-slate-700 block">
                  Maintenance Notice Message
                </label>
                <input
                  type="text"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-950 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Embed Scripts & Custom Code */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Code className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Header & Footer Script Injections
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom &lt;head&gt; Scripts / Meta Tags
                </label>
                <textarea
                  rows={3}
                  value={customHeadCode}
                  onChange={(e) => setCustomHeadCode(e.target.value)}
                  placeholder="<!-- Custom verification tags, font imports, or head trackers -->"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom Body/Footer Scripts (Chat widgets, telemetry)
                </label>
                <textarea
                  rows={3}
                  value={customFooterCode}
                  onChange={(e) => setCustomFooterCode(e.target.value)}
                  placeholder="<!-- Live chat scripts or conversion pingers -->"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking IDs & Feature Toggles */}
        <div className="space-y-6">
          {/* Tracking IDs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Marketing & Analytics IDs
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Google Analytics 4 ID
                </label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Meta / Facebook Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="123456789012345"
                  value={facebookPixelId}
                  onChange={(e) => setFacebookPixelId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Storefront Feature Toggles
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Customer Reviews</p>
                  <p className="text-[10px] text-slate-400">Display ratings on product cards</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableCustomerReviews}
                  onChange={(e) => setEnableCustomerReviews(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Wishlist & Saved</p>
                  <p className="text-[10px] text-slate-400">Allow customers to bookmark items</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableWishlist}
                  onChange={(e) => setEnableWishlist(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Search Auto-Complete</p>
                  <p className="text-[10px] text-slate-400">Live product search predictions</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableSearchSuggestions}
                  onChange={(e) => setEnableSearchSuggestions(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
