import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Tag, Plus, CheckCircle, Percent } from 'lucide-react';
import { Promotion } from '@/types';

export const AdminPromotions: React.FC = () => {
  const { promotions, showToast } = useStore();
  const [promoList, setPromoList] = useState<Promotion[]>(promotions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState('50');
  const [minOrderValue, setMinOrderValue] = useState('499');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;

    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      code: code.toUpperCase().trim(),
      title,
      description,
      discountType,
      discountValue: Number(discountValue) || 50,
      minOrderValue: Number(minOrderValue) || 299,
      validUntil: 'Nov 30, 2026',
    };

    setPromoList([newPromo, ...promoList]);
    setIsModalOpen(false);
    showToast(`Promotion coupon ${newPromo.code} created!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Marketing & Coupon Promotions
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure discount codes, cashback rules, and minimum cart thresholds
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoList.map((promo) => (
          <div
            key={promo.id}
            className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#1B5E20] bg-[#E8F5E9] px-2.5 py-1 rounded border border-[#C8E6C9]">
                  {promo.code}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Valid till {promo.validUntil}
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900">{promo.title}</h3>
              <p className="text-xs text-gray-600">{promo.description}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Min. Cart: <strong>₹{promo.minOrderValue}</strong>
              </span>
              <span className="font-bold text-[#2E7D32]">
                {promo.discountType === 'flat' ? `₹${promo.discountValue} Flat Off` : `${promo.discountValue}% Off`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
        subtitle="Set discount amount and minimum basket validation"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Coupon Code</label>
            <input
              required
              type="text"
              placeholder="e.g. DIWALI150"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 text-xs uppercase font-mono font-bold border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Campaign Title</label>
            <input
              required
              type="text"
              placeholder="e.g. ₹150 Off on Festival Sweets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Get ₹150 flat discount on orders above ₹999"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percent')}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
              >
                <option value="flat">Flat Rupee (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Discount Amount</label>
              <input
                required
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Minimum Order Value (₹)</label>
            <input
              required
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Publish Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
