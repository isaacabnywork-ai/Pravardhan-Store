import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Phone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { authPhone, setAuthPhone, setIsAuthenticated, showToast } = useStore();
  const [phone, setPhone] = useState(authPhone || '');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      showToast('OTP sent to +91 ' + cleanPhone, 'info');
    }, 400);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) {
      showToast('Please enter the 4-digit OTP', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthPhone(phone);
      setIsAuthenticated(true);
      showToast('Welcome back! Logged in successfully', 'success');
      onClose();
      setStep('phone');
      setOtp(['', '', '', '']);
    }, 400);
  };

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4']);
    setTimeout(() => {
      setAuthPhone(phone || '9876543210');
      setIsAuthenticated(true);
      showToast('Welcome back! Logged in successfully', 'success');
      onClose();
      setStep('phone');
      setOtp(['', '', '', '']);
    }, 200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'phone' ? 'Login or Sign Up' : 'Verify Mobile'}
      subtitle={
        step === 'phone'
          ? 'Enter your mobile number to get started'
          : `Code sent to +91 ${phone || '9876543210'}`
      }
      maxWidth="sm"
    >
      {step === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Mobile Number
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-[#0C831F] focus-within:ring-2 focus-within:ring-[#0C831F]/20 overflow-hidden bg-white">
              <span className="px-3 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 border-r border-gray-200">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                autoFocus
                className="w-full px-3 py-2.5 text-sm text-[#1C1C1C] outline-none font-semibold tracking-wider placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={phone.length !== 10}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-1">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-xs text-[#0C831F] font-bold flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>
            <span className="text-xs text-gray-500 font-mono">+91 {phone}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 text-center">
              Enter 4-Digit OTP
            </label>
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  autoFocus={idx === 0}
                  className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-gray-300 focus:border-[#0C831F] focus:ring-2 focus:ring-[#0C831F]/20 outline-none text-[#1C1C1C]"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-gray-500">Didn&apos;t receive OTP?</span>
            <button
              type="button"
              onClick={() => showToast('OTP resent', 'info')}
              className="text-[#0C831F] font-bold hover:underline"
            >
              Resend OTP
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={otp.join('').length < 4}
          >
            Verify &amp; Continue
          </Button>

          {/* Quick Demo auto-fill */}
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-center">
            <button
              type="button"
              onClick={fillDemoOtp}
              className="text-xs font-bold text-[#0C831F] hover:underline"
            >
              Quick Test: Auto-fill OTP &amp; Sign In
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
