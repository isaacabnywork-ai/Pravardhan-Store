'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, ArrowRight, CheckCircle2, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loginWithPhoneOtp } = useAuth();

  // If user is accessing back-office /admin, let adminLayout handle staff auth
  const isAdminRoute = pathname?.startsWith('/admin');

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // If loading client state or user is already authenticated or accessing admin, show content
  if (!mounted || user || isAdminRoute) {
    return <>{children}</>;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanDigits }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setStep('OTP');
        setResendCooldown(60);
        if (data.data?.devCode) {
          setOtp(data.data.devCode);
        } else {
          setOtp('');
        }
      } else {
        setError(data.error?.message || 'Failed to send OTP. Please check the number and try again.');
      }
    } catch {
      setLoading(false);
      setError('Network connectivity error. Could not request OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the OTP you received');
      return;
    }
    setError('');
    setLoading(true);

    const res = await loginWithPhoneOtp(phone, otp, name.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Verification failed. Please check the OTP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-0 sm:p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 overflow-y-auto">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full sm:max-w-md min-h-screen sm:min-h-0 bg-white rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-slate-100 overflow-hidden my-auto flex flex-col justify-center sm:justify-start animate-in fade-in zoom-in-95 duration-200">
        {/* Top Banner */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-emerald-800 to-teal-700 text-white text-center relative flex flex-col items-center">
          <div className="w-16 h-16 mb-3 bg-white rounded-2xl flex items-center justify-center shadow-md p-2">
            <Image
              src="/images/logo.png"
              alt="Pravdhan Store Logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Login or Sign up</h2>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 flex-1 sm:flex-none flex flex-col justify-center">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none z-10 text-xs font-bold text-slate-700 flex items-center gap-1.5 select-none">
                    <span>🇮🇳 +91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    required
                    style={{ paddingLeft: '5.25rem' }}
                    className="w-full pr-10 py-3 rounded-2xl border border-slate-200 text-sm font-semibold tracking-wider focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Sending OTP...' : 'Continue with OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-[11px] text-slate-500">
                  By continuing, you agree to our Terms of Service & Privacy Policy.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-center text-xl font-black tracking-widest text-slate-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify & Enter Store'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('PHONE');
                    setError('');
                  }}
                  className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Change Details
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="font-bold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
