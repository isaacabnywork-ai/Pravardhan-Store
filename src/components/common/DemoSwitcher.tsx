'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Store, ShieldCheck, Bike, Smartphone, Monitor, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';

interface DemoSwitcherProps {
  deviceFrame: 'fluid' | 'mobile' | 'tablet';
  setDeviceFrame: (frame: 'fluid' | 'mobile' | 'tablet') => void;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  deviceFrame,
  setDeviceFrame,
}) => {
  const { appMode, setAppMode, customerPage, setCustomerPage, resetDemoData } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Interactive Demo Switcher"
      className="fixed bottom-16 right-3 lg:bottom-4 lg:left-4 z-50 flex flex-col items-end lg:items-start select-none font-sans"
    >
      {/* Expanded Control Box */}
      {isExpanded && (
        <div className="mb-2 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-3.5 w-72 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive View Switcher
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Role Mode Selector */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Switch Application Role
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setAppMode('customer')}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  appMode === 'customer'
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Store className="w-4 h-4 text-[#F9C74F]" />
                <span className="text-[11px]">Customer</span>
              </button>

              <button
                onClick={() => setAppMode('admin')}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  appMode === 'admin'
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">Store Admin</span>
              </button>

              <button
                onClick={() => setAppMode('delivery')}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  appMode === 'delivery'
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-300" />
                <span className="text-[11px]">Delivery</span>
              </button>
            </div>
          </div>

          {/* Device Frame Simulator */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Device Frame Simulator
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setDeviceFrame('fluid')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                  deviceFrame === 'fluid'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Responsive</span>
              </button>

              <button
                onClick={() => setDeviceFrame('mobile')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                  deviceFrame === 'mobile'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>

              <button
                onClick={() => setDeviceFrame('tablet')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                  deviceFrame === 'tablet'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <span>Tablet</span>
              </button>
            </div>
          </div>

          {/* Quick jump shortcuts */}
          {appMode === 'customer' && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Jump Customer Pages
              </span>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {(['home', 'categories', 'product', 'cart', 'checkout', 'order-tracking', 'orders', 'wishlist', 'offers', 'account'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCustomerPage(p)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      customerPage === p
                        ? 'bg-[#2E7D32] text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={resetDemoData}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seed Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
      >
        <div className="w-2 h-2 rounded-full bg-[#0C831F] animate-ping" />
        <span className="capitalize">{appMode} View</span>
        <span className="text-slate-400 font-normal">|</span>
        <span className="text-emerald-400 text-[11px]">Switch Roles</span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 ml-0.5" /> : <ChevronUp className="w-3.5 h-3.5 ml-0.5" />}
      </button>
    </aside>
  );
};
