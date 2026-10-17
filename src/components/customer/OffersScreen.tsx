import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Tag, Copy, ChevronRight, Check } from 'lucide-react';

export const OffersScreen: React.FC = () => {
  const { promotions, applyCoupon, setCustomerPage, showToast, setShowCartDrawer } = useStore();

  const handleCopyAndApply = (code: string) => {
    navigator.clipboard?.writeText(code);
    const result = applyCoupon(code);
    if (result.success) {
      setShowCartDrawer(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C]">Offers &amp; Coupons</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft">
        <span className="text-[10px] font-black uppercase text-[#0C831F] bg-[#F0F8F1] px-2 py-0.5 rounded tracking-wider">
          Verified Grocery Savings
        </span>
        <h1 className="text-base sm:text-xl font-black text-[#1C1C1C] mt-1.5">
          Coupons &amp; Instant Discounts
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Apply any coupon code to your basket for instant savings on checkout
        </p>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 hover:shadow-card transition-all p-4 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-[#0C831F] bg-[#F0F8F1] px-2 py-0.5 rounded uppercase">
                  {promo.discountType === 'flat' ? `FLAT ₹${promo.discountValue} OFF` : `${promo.discountValue}% DISCOUNT`}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Valid till {promo.validUntil}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#1C1C1C]">
                {promo.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {promo.description}
              </p>
            </div>

            {/* Bottom code strip & Apply button */}
            <div className="pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 font-mono text-xs font-black text-[#1C1C1C] tracking-wider">
                <Tag className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>{promo.code}</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCopyAndApply(promo.code)}
                rightIcon={<Copy className="w-3.5 h-3.5" />}
              >
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Partner Offers */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-soft space-y-3">
        <h3 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider">
          Bank &amp; Wallet Offers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
            <span className="font-bold text-[#1C1C1C] block">UPI / Google Pay</span>
            <p className="text-gray-500">Get scratch card up to ₹50 on orders above ₹499</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
            <span className="font-bold text-[#1C1C1C] block">HDFC Bank Cards</span>
            <p className="text-gray-500">10% Instant discount on debit/credit cards on weekends</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
            <span className="font-bold text-[#1C1C1C] block">ICICI NetBanking</span>
            <p className="text-gray-500">Flat ₹75 cashback on grocery orders above ₹999</p>
          </div>
        </div>
      </div>
    </div>
  );
};
