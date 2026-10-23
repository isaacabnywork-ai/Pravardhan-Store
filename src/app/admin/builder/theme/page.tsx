'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Palette,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Type,
  Square,
  Maximize2,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { DEFAULT_THEME_SETTINGS } from '@/modules/cms/default-data';

export default function ThemeCustomizerPage() {
  const { themeSettings, updateTheme } = useCms();
  const [formData, setFormData] = useState(themeSettings);
  const [saveToast, setSaveToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTheme(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset theme tokens to Pravdhan Store default styling?')) {
      setFormData(DEFAULT_THEME_SETTINGS);
      updateTheme(DEFAULT_THEME_SETTINGS);
    }
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Global design tokens saved & injected live into storefront!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Theme Customizer & Global Styles
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  CSS Design Tokens
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Centralized color palette, border radiuses, button styles, typography, container widths, and product card ratios
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Theme Tokens</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Brand Color System */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Brand Color Palette</h3>
              <p className="text-xs text-slate-500">Global primary, secondary, accent, and background tones</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Primary Color (Emerald)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Primary Hover Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryHoverColor}
                    onChange={(e) => setFormData({ ...formData, primaryHoverColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.primaryHoverColor}
                    onChange={(e) => setFormData({ ...formData, primaryHoverColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Secondary Color (Mint)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Accent Color (Amber Deals)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shape, Border Radius & Buttons */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Shapes, Radius & Buttons</h3>
              <p className="text-xs text-slate-500">Geometry and rounded aesthetics across all UI components</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Global Border Radius</label>
                <select
                  value={formData.borderRadius}
                  onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">Sharp Corners (0px)</option>
                  <option value="sm">Small Radius (6px)</option>
                  <option value="md">Medium Radius (12px)</option>
                  <option value="lg">Large Modern Radius (20px - Default)</option>
                  <option value="full">Pill Shaped (9999px)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Primary Button Style</label>
                <select
                  value={formData.buttonStyle}
                  onChange={(e) => setFormData({ ...formData, buttonStyle: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="rounded">Rounded Corners (Modern)</option>
                  <option value="pill">Pill Shaped (Curved)</option>
                  <option value="square">Square Minimalist</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Product Card Layout</label>
                <select
                  value={formData.productCardStyle}
                  onChange={(e) => setFormData({ ...formData, productCardStyle: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="bordered">Bordered Card with Subtle Ring (Default)</option>
                  <option value="elevated">Elevated with Drop Shadow</option>
                  <option value="minimal">Flat Minimalist</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Max Container Width</label>
                <select
                  value={formData.containerWidth}
                  onChange={(e) => setFormData({ ...formData, containerWidth: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1200px">Compact (1200px)</option>
                  <option value="1280px">Standard Desktop (1280px - Default)</option>
                  <option value="1440px">Wide Screen (1440px)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Preview Component Showcase */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Live Component Token Preview</h3>
            <p className="text-xs text-slate-500">Preview of buttons, cards, and badges using your selected styles</p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              {/* Button Preview */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Primary Button
                </span>
                <button
                  type="button"
                  className="w-full py-2.5 text-white font-bold text-xs shadow-sm transition-transform hover:scale-105"
                  style={{
                    backgroundColor: formData.primaryColor,
                    borderRadius:
                      formData.buttonStyle === 'pill'
                        ? '9999px'
                        : formData.buttonStyle === 'square'
                        ? '4px'
                        : '14px',
                  }}
                >
                  Add to Cart • ₹142
                </button>
              </div>

              {/* Accent Button */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Accent Deal Button
                </span>
                <button
                  type="button"
                  className="w-full py-2 text-slate-900 font-black text-xs shadow-sm"
                  style={{
                    backgroundColor: formData.accentColor,
                    borderRadius:
                      formData.buttonStyle === 'pill'
                        ? '9999px'
                        : formData.buttonStyle === 'square'
                        ? '4px'
                        : '14px',
                  }}
                >
                  Claim 30% OFF Coupon
                </button>
              </div>

              {/* Product Badge Preview */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Product Discount Badge
                </span>
                <span
                  className="inline-block text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  20% OFF
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Apply Theme Globally
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
