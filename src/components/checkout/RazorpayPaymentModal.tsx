'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Building2,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  orderId: string;
  amount: number; // in rupees
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (errorMessage: string) => void;
  onClose: () => void;
}

export function RazorpayPaymentModal({
  isOpen,
  orderNumber,
  amount,
  customerName,
  customerPhone,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        const fakePaymentId = `pay_test_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        onSuccess(fakePaymentId);
      } else {
        onFailure('Payment was cancelled or rejected by issuing bank in test mode.');
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Header - Razorpay Dark Theme */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-blue-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-extrabold tracking-wider text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> RAZORPAY
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 rounded-full">
                Test Mode
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Pravdhan Store Express</h3>
            <p className="text-xs text-slate-300">Order #{orderNumber}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
            <span className="text-xl font-extrabold text-emerald-400">{formatPrice(amount)}</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Badge */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Paying as: <strong>{customerName || 'Customer'}</strong> ({customerPhone})</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Secure
          </span>
        </div>

        {/* Method Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('UPI')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'UPI'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" /> UPI & QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CARD')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'CARD'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NET_BANKING')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'NET_BANKING'
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Netbanking
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {activeTab === 'UPI' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Select Instant UPI App</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                  { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                  { id: 'paytm', label: 'Paytm UPI', icon: '🔵' },
                  { id: 'bhim', label: 'BHIM UPI', icon: '🟠' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpiApp(app.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedUpiApp === app.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{app.icon}</span>
                    <span>{app.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <QrCode className="w-8 h-8 text-slate-700" />
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold block text-slate-900">Scan & Pay via QR</span>
                  Works with any UPI app on your phone
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CARD' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Card Number (Test Mode)</label>
                <input
                  type="text"
                  readOnly
                  value="4111 •••• •••• 1111 (Visa Sandbox)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12/28"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CVV</label>
                  <input
                    type="text"
                    readOnly
                    value="123"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700 text-xs"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Test cards are pre-filled. Real money will not be deducted.
              </p>
            </div>
          )}

          {activeTab === 'NET_BANKING' && (
            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">Popular Banks (Sandbox)</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                  <div
                    key={bank}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>{bank}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulatePayment(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying with Razorpay...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Pay {formatPrice(amount)} (Simulate Success)
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulatePayment(false)}
            className="w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  );
}
