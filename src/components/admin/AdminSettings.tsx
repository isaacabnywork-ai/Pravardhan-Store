import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Check } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useStore();

  const [minOrder, setMinOrder] = useState('100');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('500');
  const [standardDeliveryFee, setStandardDeliveryFee] = useState('30');
  const [operatingHoursStart, setOperatingHoursStart] = useState('07:00');
  const [operatingHoursEnd, setOperatingHoursEnd] = useState('22:00');
  const [maxSlotCapacity, setMaxSlotCapacity] = useState('45');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Store fulfillment parameters updated successfully!', 'success');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Store Operations & Policy Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Define delivery pricing thresholds, operational hours, and slot capacities
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
            Cart & Delivery Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Below this, checkout blocks</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Free delivery above this cart value</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Charged when cart &lt; ₹500</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
            Fulfillment Hub Operating Hours & Capacity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Dispatch Opening Time
              </label>
              <input
                type="time"
                value={operatingHoursStart}
                onChange={(e) => setOperatingHoursStart(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Dispatch Closing Time
              </label>
              <input
                type="time"
                value={operatingHoursEnd}
                onChange={(e) => setOperatingHoursEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Max Orders Per 2-Hr Slot
              </label>
              <input
                type="number"
                value={maxSlotCapacity}
                onChange={(e) => setMaxSlotCapacity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Slot marks Full when reached</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Store Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
