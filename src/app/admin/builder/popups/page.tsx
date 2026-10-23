'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Bell,
  Sparkles,
  Save,
  CheckCircle2,
  ChevronRight,
  Eye,
  Sliders,
  Calendar,
  Tag,
  Clock,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';

export default function PopupsManagerPage() {
  const { headerConfig, updateHeader, popups, updatePopup } = useCms();
  const [toast, setToast] = useState(false);

  // Active Popup configuration (single or first popup)
  const activePopup = popups[0];

  // Header Announcement Bar Form State
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(headerConfig.showAnnouncementBar);
  const [announcementBarText, setAnnouncementBarText] = useState(headerConfig.announcementBarText);
  const [announcementBarLink, setAnnouncementBarLink] = useState(headerConfig.announcementBarLink || '');
  const [announcementBarBg, setAnnouncementBarBg] = useState(headerConfig.announcementBarBg);
  const [announcementBarTextColor, setAnnouncementBarTextColor] = useState(headerConfig.announcementBarTextColor);

  // Popup Form State
  const [popupTitle, setPopupTitle] = useState(activePopup?.title || '');
  const [popupContent, setPopupContent] = useState(activePopup?.content || '');
  const [couponCode, setCouponCode] = useState(activePopup?.couponCode || '');
  const [buttonText, setButtonText] = useState(activePopup?.buttonText || '');
  const [buttonUrl, setButtonUrl] = useState(activePopup?.buttonUrl || '');
  const [trigger, setTrigger] = useState(activePopup?.trigger || 'TIME_DELAY');
  const [delaySeconds, setDelaySeconds] = useState(activePopup?.delaySeconds || 5);
  const [isPopupActive, setIsPopupActive] = useState(activePopup?.isActive ?? true);
  const [popupImage, setPopupImage] = useState(activePopup?.image || '');
  const [popupBg, setPopupBg] = useState(activePopup?.backgroundColor || '#047857');
  const [popupTextColor, setPopupTextColor] = useState(activePopup?.textColor || '#ffffff');

  // Preview Modal Test Open State
  const [testModalOpen, setTestModalOpen] = useState(false);

  const handleSaveCampaigns = async () => {
    // Save Announcement Bar in Header Config
    await updateHeader({
      showAnnouncementBar,
      announcementBarText,
      announcementBarLink,
      announcementBarBg,
      announcementBarTextColor,
    });

    // Save Popup Config
    if (activePopup) {
      await updatePopup(activePopup.id, {
        title: popupTitle,
        content: popupContent,
        couponCode,
        buttonText,
        buttonUrl,
        trigger,
        delaySeconds,
        isActive: isPopupActive,
        image: popupImage,
        backgroundColor: popupBg,
        textColor: popupTextColor,
      });
    }

    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Marketing campaigns & popups saved and live on storefront!</span>
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
              Popups & Banners
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Popups & Announcement Bars
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Drive instant conversions with top announcement ribbons and high-impact discount popups triggered on page load, timer, or exit intent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Test Popup Preview</span>
          </button>
          <button
            type="button"
            onClick={handleSaveCampaigns}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Campaigns</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 1: Announcement Bar Ribbon */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Announcement Bar</h2>
                <p className="text-[11px] text-slate-400">Fixed top strip above the navbar</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAnnouncementBar}
                onChange={(e) => setShowAnnouncementBar(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Live Preview Ribbon */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Preview
            </span>
            <div
              style={{ backgroundColor: announcementBarBg, color: announcementBarTextColor }}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>{announcementBarText || 'Announcement text goes here...'}</span>
              {announcementBarLink && (
                <span className="text-[10px] underline ml-1 cursor-pointer">Learn more ➜</span>
              )}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Announcement Message *
              </label>
              <input
                type="text"
                value={announcementBarText}
                onChange={(e) => setAnnouncementBarText(e.target.value)}
                placeholder="⚡ Free 10-Min Delivery on all orders above ₹199! Code: FREEDEL"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Destination Link URL (Optional)
              </label>
              <input
                type="text"
                value={announcementBarLink}
                onChange={(e) => setAnnouncementBarLink(e.target.value)}
                placeholder="/shop or /summer-sale"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Background Color</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <input
                    type="color"
                    value={announcementBarBg}
                    onChange={(e) => setAnnouncementBarBg(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={announcementBarBg}
                    onChange={(e) => setAnnouncementBarBg(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent border-0 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Text Color</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <input
                    type="color"
                    value={announcementBarTextColor}
                    onChange={(e) => setAnnouncementBarTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={announcementBarTextColor}
                    onChange={(e) => setAnnouncementBarTextColor(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent border-0 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: High-Converting Modal Popup */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Promotional Modal Popup</h2>
                <p className="text-[11px] text-slate-400">Modal dialog with coupon & countdown</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPopupActive}
                onChange={(e) => setIsPopupActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Campaign Headline *</label>
              <input
                type="text"
                value={popupTitle}
                onChange={(e) => setPopupTitle(e.target.value)}
                placeholder="🎉 Welcome to Pravdhan Store!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Content / Subheading</label>
              <textarea
                rows={2}
                value={popupContent}
                onChange={(e) => setPopupContent(e.target.value)}
                placeholder="Get flat ₹100 OFF on your first 10-minute grocery delivery order above ₹499."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="WELCOME100"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-purple-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Button CTA Text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Claim My Discount ➜"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Button Target Link</label>
                <input
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="/shop"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={popupImage}
                  onChange={(e) => setPopupImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Triggers and Timing */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Trigger & Display Rules
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Display Trigger
                  </label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-xs"
                  >
                    <option value="TIME_DELAY">Time Delay (Seconds)</option>
                    <option value="ON_LOAD">Immediate on Load</option>
                    <option value="EXIT_INTENT">Exit Intent (Mouse Leave)</option>
                    <option value="SCROLL">Scroll 50% Down Page</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Delay (Seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Preview Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
            <button
              onClick={() => setTestModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
            >
              ✕
            </button>

            {popupImage && (
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                <img src={popupImage} alt="Promo" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 text-center space-y-3.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <Tag className="w-3 h-3" /> Special Promo
              </span>
              <h3 className="text-xl font-black text-slate-900">{popupTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{popupContent}</p>

              {couponCode && (
                <div className="p-3 bg-dashed border-2 border-dashed border-emerald-400 bg-emerald-50 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                    Use Coupon Code At Checkout:
                  </span>
                  <span className="text-base font-black text-emerald-800 tracking-wider font-mono">
                    {couponCode}
                  </span>
                </div>
              )}

              <button
                onClick={() => setTestModalOpen(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {buttonText || 'Claim Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
