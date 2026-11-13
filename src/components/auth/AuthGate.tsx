'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, ArrowRight, CheckCircle2, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loginWithPhoneOtp, loginWithFirebaseSession, loginWithGoogleCustomer } = useAuth();

  // If user is accessing back-office /admin, let adminLayout handle staff auth
  const isAdminRoute = pathname?.startsWith('/admin');

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [onScreenOtp, setOnScreenOtp] = useState('123456');
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

    // Option 2: Instant On-Screen Verification Code (100% Free, zero card risk)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOnScreenOtp(code);
    setOtp(code);
    setStep('OTP');
    setResendCooldown(30);
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the verification code');
      return;
    }
    setError('');
    setLoading(true);

    // Accept on-screen code or test bypass 123456
    if (otp === onScreenOtp || otp === '123456') {
      const res = await loginWithFirebaseSession(phone, name.trim());
      setLoading(false);

      if (res.success) {
        return;
      }

      // Fallback to server verify
      const fallbackRes = await loginWithPhoneOtp(phone, '123456', name.trim());
      if (fallbackRes.success) return;

      setError(res.message || 'Verification failed. Please try again.');
      return;
    }

    const res = await loginWithPhoneOtp(phone, otp, name.trim());
    setLoading(false);

    if (!res.success) {
      setError(`Incorrect code. Please enter the code: ${onScreenOtp}`);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const displayName = result.user.displayName || undefined;
      if (!email) {
        setError('No email found on Google account.');
        setLoading(false);
        return;
      }

      const res = await loginWithGoogleCustomer(email, displayName);
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in was interrupted. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 overflow-y-auto">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full sm:max-w-md min-h-screen sm:min-h-0 bg-white rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-slate-100 overflow-hidden my-auto flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
        {/* Header: Transparent Logo and Centered Title */}
        <div id="recaptcha-container"></div>
        <div className="pt-6 sm:pt-8 pb-1.5 px-6 text-center flex flex-col items-center">
          <div className="relative w-36 h-12 sm:w-44 sm:h-14 mb-2 sm:mb-2.5 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Pravdhan Store Logo"
              width={180}
              height={60}
              className="object-contain w-auto h-full"
              priority
            />
          </div>
          <h2 className="text-lg sm:text-base font-bold text-slate-800 tracking-tight">
            Login or Sign up
          </h2>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-8 pt-3 sm:px-8 sm:pb-8 flex flex-col justify-center">
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

              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  or
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-[11px] text-slate-500">
                  By continuing, you agree to our Terms of Service & Privacy Policy.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Instant On-Screen Verification Badge */}
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-center">
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Your Instant Verification Code
                </p>
                <div className="my-1.5 inline-block px-4 py-1 bg-white border border-emerald-300 rounded-xl shadow-xs">
                  <span className="text-2xl font-black tracking-widest text-emerald-950 font-mono">
                    {onScreenOtp}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Auto-filled below. Click &ldquo;Verify &amp; Enter Store&rdquo;!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Verification Code
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
                  {resendCooldown > 0 ? `New Code in ${resendCooldown}s` : 'Get New Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
