import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Phone,
  Mail,
  MapPin,
  Package,
  Heart,
  Tag,
  Headphones,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AuthModal } from '@/components/customer/AuthModal';

export const AccountScreen: React.FC = () => {
  const {
    setCustomerPage,
    setShowLocationModal,
    selectedAddress,
    orders,
    wishlist,
    showToast,
    authPhone,
    setAuthPhone,
    isAuthenticated,
    setIsAuthenticated,
  } = useStore();

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthPhone('');
    showToast('Logged out successfully', 'info');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">My Account</span>
      </nav>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center font-black text-lg">
            {isAuthenticated ? (authPhone ? authPhone.slice(-2) : 'RS') : <User className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-base font-black text-[#1C1C1C]">
              {isAuthenticated ? 'Rahul Sharma' : 'Guest Shopper'}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {isAuthenticated ? `+91 ${authPhone || '9876543210'}` : 'Sign in to access your orders and saved addresses'}
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAuthModal(true)}
          >
            Login
          </Button>
        )}
      </div>

      {/* Simple List Layout (Orders, Addresses, Support, Logout) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 shadow-soft overflow-hidden text-xs">
        {/* Orders */}
        <button
          onClick={() => setCustomerPage('orders')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs sm:text-sm">My Orders</p>
              <p className="text-[11px] text-gray-400">{orders.length} orders placed</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Delivery Addresses */}
        <button
          onClick={() => setShowLocationModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1C1C1C] text-xs sm:text-sm">Delivery Addresses</p>
              <p className="text-[11px] text-gray-400 truncate max-w-xs">
                {selectedAddress.houseNo}, {selectedAddress.area}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Wishlist */}
        <button
          onClick={() => setCustomerPage('wishlist')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs sm:text-sm">Saved Items</p>
              <p className="text-[11px] text-gray-400">{wishlist.length} products saved</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Offers & Coupons */}
        <button
          onClick={() => setCustomerPage('offers')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs sm:text-sm">Offers &amp; Coupons</p>
              <p className="text-[11px] text-gray-400">View discounts &amp; bank deals</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Customer Support */}
        <button
          onClick={() => setShowSupportModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs sm:text-sm">Customer Support</p>
              <p className="text-[11px] text-gray-400">Order issues, refunds &amp; feedback</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Log Out */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left text-rose-600 font-bold"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm">Log Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        )}
      </div>

      {/* Customer Support Modal */}
      <Modal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        title="Customer Support"
        subtitle="We typically respond in under 5 minutes"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
            <span className="font-bold text-[#1C1C1C] block">Direct Customer Helpline</span>
            <p className="text-gray-500">Call our Indiranagar Hub manager directly:</p>
            <p className="text-sm font-black text-[#0C831F] pt-1">+91 80 4920 1800</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
            <span className="font-bold text-[#1C1C1C] block">Email Assistance</span>
            <p className="text-gray-500">For invoice copies or refund status:</p>
            <p className="font-bold text-gray-800">care@prabhandhanstore.com</p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              showToast('Support ticket #PB-SUP-841 created', 'success');
              setShowSupportModal(false);
            }}
          >
            Start Live Chat
          </Button>
        </div>
      </Modal>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
