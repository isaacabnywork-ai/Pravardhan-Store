import React from 'react';
import { INITIAL_CUSTOMERS } from '@/data/mockData';
import { Users, Phone, Mail, ShoppingBag } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Customer Directory & Loyalty
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          View registered customer accounts, total order frequency, and lifetime spend
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Contact Information</th>
                <th className="px-4 py-3">Lifetime Orders</th>
                <th className="px-4 py-3">Total Spend</th>
                <th className="px-4 py-3">Member Since</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {INITIAL_CUSTOMERS.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-xs">
                        {cust.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{cust.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{cust.phone}</p>
                    <p className="text-[11px] text-gray-400">{cust.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {cust.totalOrders} orders
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#1B5E20]">
                    ₹{cust.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cust.joinedDate}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold bg-[#E8F5E9] text-[#1B5E20] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
