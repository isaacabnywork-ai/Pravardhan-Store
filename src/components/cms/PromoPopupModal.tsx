'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { useCart } from '@/lib/context/CartContext';

export function PromoPopupModal() {
  const { popups } = useCms();
  const { applyCoupon } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const activePopup = popups.find((p) => p.isActive);

  useEffect(() => {
    if (!activePopup) return;

    try {
      const dismissed = sessionStorage.getItem(`popup_dismissed_${activePopup.id}`);
      if (dismissed) return;
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, (activePopup.delaySeconds || 3) * 1000);

    return () => clearTimeout(timer);
  }, [activePopup]);

  if (!isOpen || !activePopup) return null;

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(`popup_dismissed_${activePopup.id}`, 'true');
    } catch {
      // ignore
    }
  };

  const handleApplyCoupon = (code: string) => {
    applyCoupon(code);
    setIsCopied(true);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
          aria-label="Close promotion"
        >
          <X className="w-4 h-4" />
        </button>

        {activePopup.image && (
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
            <img
              src={activePopup.image}
              alt={activePopup.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Special
            </span>
          </div>
        )}

        <div className="p-6 space-y-4 text-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {activePopup.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {activePopup.content}
            </p>
          </div>

          {activePopup.couponCode && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Coupon Code
                </span>
                <p className="font-mono font-black text-base text-emerald-950">
                  {activePopup.couponCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyCoupon(activePopup.couponCode!)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Apply Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activePopup.buttonText && (
            <Link
              href={activePopup.buttonUrl || '/deals'}
              onClick={handleClose}
              className="block w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              {activePopup.buttonText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
