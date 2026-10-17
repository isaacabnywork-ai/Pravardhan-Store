import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, Clock, Headphones, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCustomerPage, navigateToCategory, categories } = useStore();

  return (
    <footer className="hidden lg:block bg-white border-t border-gray-200 mt-12 text-xs text-gray-500">
      {/* Value Strip */}
      <div className="border-b border-gray-100 py-6 px-6 bg-[#F8FAF8]">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs">Delivery in 15-30 Mins</p>
              <p className="text-[11px] text-gray-500">Superfast from dark stores</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs">Fresh &amp; Quality Checked</p>
              <p className="text-[11px] text-gray-500">Farm sorted daily</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs">Best Mandi Prices</p>
              <p className="text-[11px] text-gray-500">Guaranteed daily savings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0F8F1] text-[#0C831F] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1C] text-xs">Customer Support</p>
              <p className="text-[11px] text-gray-500">Instant chat &amp; order help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Store Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0C831F] text-white flex items-center justify-center font-black text-xs">
                P
              </div>
              <span className="font-black text-sm text-[#1C1C1C] tracking-tight">
                PRABHANDHAN STORE
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              Your neighborhood daily grocery store delivering fresh produce, dairy, bakery, and pantry staples in minutes.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1C1C1C] text-[11px] uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => navigateToCategory(c.id)}
                    className="hover:text-[#0C831F] transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1C1C1C] text-[11px] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setCustomerPage('orders')} className="hover:text-[#0C831F]">
                  My Orders
                </button>
              </li>
              <li>
                <button onClick={() => setCustomerPage('offers')} className="hover:text-[#0C831F]">
                  Offers &amp; Coupons
                </button>
              </li>
              <li>
                <button onClick={() => setCustomerPage('account')} className="hover:text-[#0C831F]">
                  Account Settings
                </button>
              </li>
              <li>
                <button onClick={() => setCustomerPage('wishlist')} className="hover:text-[#0C831F]">
                  Saved Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1C1C1C] text-[11px] uppercase tracking-wider">
              Support
            </h4>
            <p className="text-xs text-gray-600">Need help with your order?</p>
            <p className="text-xs font-semibold text-[#0C831F]">care@prabhandhanstore.com</p>
            <p className="text-[11px] text-gray-400">Hours: 6:00 AM – 11:00 PM</p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>&copy; {new Date().getFullYear()} Prabhandhan Store. All rights reserved.</span>
          <span>Fast, fresh, trusted grocery delivery.</span>
        </div>
      </div>
    </footer>
  );
};
