'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  CheckCircle2,
  X,
  Calendar,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { Promotion } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminPromotionsPage() {
  const { promotions, addPromotion, togglePromotionStatus } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'FLAT' as 'FLAT' | 'PERCENTAGE',
    discountValue: 100,
    minOrderValue: 499,
    maxDiscount: 200,
    validTill: '2027-12-31',
    isActive: true,
  });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    addPromotion({
      code: formData.code.toUpperCase(),
      title: formData.title,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue),
      maxDiscount:
        formData.discountType === 'PERCENTAGE' ? Number(formData.maxDiscount) : undefined,
      validTill: formData.validTill,
      isActive: formData.isActive,
    });

    setIsModalOpen(false);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'FLAT',
      discountValue: 100,
      minOrderValue: 499,
      maxDiscount: 200,
      validTill: '2027-12-31',
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Promotions & Coupons Engine
          </h1>
          <p className="text-xs text-slate-500">
            Create and maintain promotional discount campaigns, promo codes, and basket value rules
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Total Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                    {p.code}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{p.title}</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">{p.description}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-black text-emerald-800 text-xs">
                      {p.discountType === 'FLAT' ? `₹${p.discountValue} FLAT` : `${p.discountValue}% OFF`}
                    </span>
                    {p.maxDiscount && (
                      <span className="block text-[10px] text-slate-400">
                        Max: ₹{p.maxDiscount}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {formatPrice(p.minOrderValue)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                      {p.usageCount} orders
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => togglePromotionStatus(p.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        p.isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                      }`}
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-sm sm:text-base">Create Store Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as 'FLAT' | 'PERCENTAGE',
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Grocery Savings"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat ₹100 OFF on orders above ₹499"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Value ({formData.discountType === 'FLAT' ? '₹' : '%'})
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    disabled={formData.discountType === 'FLAT'}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-sm hover:bg-emerald-800"
                >
                  Save & Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
