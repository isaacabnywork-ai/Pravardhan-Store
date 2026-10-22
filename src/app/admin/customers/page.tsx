'use client';

import React, { useState } from 'react';
import {
  Users,
  Wallet,
  IndianRupee,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ChevronRight,
  X,
  History,
  Download,
  Gift,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { useAuth } from '@/lib/context/AuthContext';
import { CustomerProfile } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function AdminCustomersPage() {
  const { customers, orders, creditCustomerWallet, debitCustomerWallet, updateCustomerStatus } =
    useStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<'ALL' | 'WITH_BALANCE' | 'ZERO_BALANCE' | 'VIP'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Free cash modal state
  const [walletModalCust, setWalletModalCust] = useState<CustomerProfile | null>(null);
  const [walletAmount, setWalletAmount] = useState<number>(100);
  const [walletActionType, setWalletActionType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [walletReason, setWalletReason] = useState('Promotional Welcome Bonus');
  const [walletNotes, setWalletNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const totalWalletCirculation = customers.reduce((sum, c) => sum + c.walletBalance, 0);
  const totalCustomerSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgWalletBalance = customers.length > 0 ? Math.round(totalWalletCirculation / customers.length) : 0;
  const vipCustomersCount = customers.filter((c) => c.totalSpent >= 5000).length;

  const filteredCustomers = customers.filter((c) => {
    if (filterTier === 'WITH_BALANCE' && c.walletBalance <= 0) return false;
    if (filterTier === 'ZERO_BALANCE' && c.walletBalance > 0) return false;
    if (filterTier === 'VIP' && c.totalSpent < 5000) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone.includes(q);
    const matchEmail = c.email?.toLowerCase().includes(q) || false;
    const matchArea = c.addresses.some((a) => a.area.toLowerCase().includes(q) || a.city.toLowerCase().includes(q));
    return matchName || matchPhone || matchEmail || matchArea;
  });

  const handleApplyWalletMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalCust || walletAmount <= 0) return;

    const adminName = user ? `${user.name} (${user.role})` : 'Super Admin';

    if (walletActionType === 'CREDIT') {
      creditCustomerWallet(walletModalCust.id, walletAmount, walletReason, walletNotes, adminName);
      showToast(`Successfully credited ₹${walletAmount} free cash to ${walletModalCust.name}!`);
    } else {
      debitCustomerWallet(walletModalCust.id, walletAmount, walletReason, walletNotes, adminName);
      showToast(`Deducted ₹${walletAmount} from ${walletModalCust.name}'s wallet.`);
    }

    // Refresh selected customer state if active in drawer
    if (selectedCustomer && selectedCustomer.id === walletModalCust.id) {
      const updated = customers.find((c) => c.id === walletModalCust.id);
      if (updated) setSelectedCustomer(updated);
    }

    setWalletModalCust(null);
    setWalletNotes('');
    setWalletAmount(100);
  };

  const handleExportCSV = () => {
    const csvRows = [
      'Customer ID,Name,Phone,Email,Wallet Balance (INR),Total Spend (INR),Orders Count,Status,Join Date',
      ...customers.map(
        (c) =>
          `"${c.id}","${c.name}","+91 ${c.phone}","${c.email || ''}",${c.walletBalance},${c.totalSpent},${c.orderCount},"${c.status}","${c.createdAt}"`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pravdhan-customers-wallet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Customer directory and wallet data exported to CSV!');
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Accounts & Wallet CRM
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Wallet className="w-3.5 h-3.5 text-amber-700" />
              Pravdhan Money Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customer 360 profiles, instant Pravdhan Cash credits, promotional grants, and transaction audit ledger
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Directory</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip - Responsive 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Shoppers
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {customers.length}
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 block truncate">
              OTP Verified
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Free Cash In Wallets
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-amber-800 tracking-tight">
              {formatPrice(totalWalletCirculation)}
            </h2>
            <span className="text-[10px] sm:text-xs text-amber-700 font-medium mt-0.5 block truncate">
              Available Cash
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Avg Balance
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(avgWalletBalance)}
            </h2>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-medium mt-0.5 block truncate">
              Per Customer
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Lifetime Spend
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {formatPrice(totalCustomerSpend)}
            </h2>
            <span className="text-[10px] sm:text-xs text-indigo-700 font-medium mt-0.5 block truncate">
              {vipCustomersCount} VIP Shoppers
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { key: 'ALL', label: 'All Customers', count: customers.length },
            {
              key: 'WITH_BALANCE',
              label: 'Has Wallet Cash',
              count: customers.filter((c) => c.walletBalance > 0).length,
            },
            {
              key: 'ZERO_BALANCE',
              label: 'Zero Wallet Balance',
              count: customers.filter((c) => c.walletBalance === 0).length,
            },
            {
              key: 'VIP',
              label: 'VIP High Spenders',
              count: customers.filter((c) => c.totalSpent >= 5000).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTier(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTier === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterTier === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone (+91), or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4">Lifetime Orders & Spend</th>
                <th className="py-3.5 px-4">Primary Delivery Area</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const defaultAddress = cust.addresses.find((a) => a.isDefault) || cust.addresses[0];

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {cust.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {cust.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <a
                            href={`tel:${cust.phone}`}
                            className="font-mono font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            +91 {cust.phone}
                          </a>
                          {cust.email && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {cust.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200">
                          <Wallet className="w-3.5 h-3.5 text-amber-700" />
                          <span className="font-black text-amber-950 text-sm">
                            {formatPrice(cust.walletBalance)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 block text-xs">
                          {formatPrice(cust.totalSpent)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {cust.orderCount} completed {cust.orderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {defaultAddress ? (
                          <div>
                            <p className="font-semibold text-slate-800">{defaultAddress.area}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {defaultAddress.houseNumber}, {defaultAddress.street}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No saved address</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            cust.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cust.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {cust.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setWalletModalCust(cust);
                              setWalletActionType('CREDIT');
                              setWalletAmount(100);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            title="Give Free Promotional Cash"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Free Cash</span>
                          </button>

                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Customer 360</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Give Free Cash / Wallet Management Modal */}
      {walletModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between flex-shrink-0">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-200 flex-shrink-0" />
                  <h3 className="font-extrabold text-sm sm:text-base truncate">Grant Pravdhan Wallet Money</h3>
                </div>
                <p className="text-xs text-amber-100 mt-0.5 truncate">
                  Customer: <strong>{walletModalCust.name}</strong> (+91 {walletModalCust.phone})
                </p>
              </div>
              <button
                onClick={() => setWalletModalCust(null)}
                className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-amber-800/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyWalletMoney} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Balance Summary Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Current Wallet Balance
                  </span>
                  <p className="text-2xl font-black text-amber-950 mt-0.5">
                    {formatPrice(walletModalCust.walletBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    New Balance Will Be
                  </span>
                  <p className="text-2xl font-black text-emerald-800 mt-0.5">
                    {formatPrice(
                      walletActionType === 'CREDIT'
                        ? walletModalCust.walletBalance + walletAmount
                        : Math.max(0, walletModalCust.walletBalance - walletAmount)
                    )}
                  </p>
                </div>
              </div>

              {/* Action Type Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWalletActionType('CREDIT')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    walletActionType === 'CREDIT'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Give Free Cash (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWalletActionType('DEBIT')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    walletActionType === 'DEBIT'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Deduct Balance (-)</span>
                </button>
              </div>

              {/* Preset Amount Chips */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">
                  Select Preset Amount or Enter Custom:
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[50, 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        walletAmount === amt
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-amber-600"
                />
              </div>

              {/* Purpose / Reason Dropdown */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Campaign / Reason
                </label>
                <select
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white outline-none focus:border-amber-600"
                >
                  <option value="Promotional Welcome Bonus">Promotional Welcome Bonus</option>
                  <option value="App Install Incentive (Free Cash)">
                    App Install Incentive (Free Cash)
                  </option>
                  <option value="VIP High-Spender Loyalty Grant">
                    VIP High-Spender Loyalty Grant
                  </option>
                  <option value="Order Issue / Delay Apology Credit">
                    Order Issue / Delay Apology Credit
                  </option>
                  <option value="Referral Cash Bonus">Referral Cash Bonus</option>
                  <option value="Festive Flash Promo Cash">Festive Flash Promo Cash</option>
                  <option value="Manual Admin Courtesy Credit">Manual Admin Courtesy Credit</option>
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Internal Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free wallet credit given over support call"
                  value={walletNotes}
                  onChange={(e) => setWalletNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-amber-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalletModalCust(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm shadow-amber-600/20 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {walletActionType === 'CREDIT' ? `Credit ₹${walletAmount}` : `Deduct ₹${walletAmount}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 360 Full Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Drawer Header */}
            <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black flex items-center justify-center text-base sm:text-lg shadow-md flex-shrink-0">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-lg text-white truncate">{selectedCustomer.name}</h3>
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Customer Profile 360
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 truncate">
                    +91 {selectedCustomer.phone} • {selectedCustomer.email || 'No email registered'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto text-xs flex-1">
              {/* Wallet Hub Strip */}
              <div className="p-5 bg-gradient-to-r from-amber-50 via-amber-50/50 to-orange-50 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-amber-700" />
                    Pravdhan Money Wallet Balance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-950">
                      {formatPrice(selectedCustomer.walletBalance)}
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">
                      Instant checkout balance
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setWalletModalCust(selectedCustomer);
                      setWalletActionType('CREDIT');
                      setWalletAmount(100);
                    }}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Give Free Cash</span>
                  </button>
                  <button
                    onClick={() => {
                      setWalletModalCust(selectedCustomer);
                      setWalletActionType('DEBIT');
                      setWalletAmount(50);
                    }}
                    className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    Deduct
                  </button>
                </div>
              </div>

              {/* Wallet Transaction Ledger */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-600" />
                    <span>Wallet Transaction Audit Ledger</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedCustomer.walletHistory?.length || 0} Recorded Events
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  {selectedCustomer.walletHistory && selectedCustomer.walletHistory.length > 0 ? (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Reason & Notes</th>
                          <th className="py-2.5 px-3">Authorized By</th>
                          <th className="py-2.5 px-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 font-medium">
                        {selectedCustomer.walletHistory.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-100/50">
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {formatDateTime(tx.createdAt)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  tx.type === 'CREDIT'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-black text-slate-900">
                              {tx.type === 'CREDIT' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              <span className="font-bold block">{tx.reason}</span>
                              {tx.notes && <span className="text-[10px] text-slate-400">{tx.notes}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{tx.adminBy}</td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900">
                              ₹{tx.balanceAfter}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-center text-slate-400">
                      No wallet transactions recorded for this customer yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Saved Delivery Addresses */}
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Saved Delivery Locations ({selectedCustomer.addresses.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCustomer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">
                        {addr.houseNumber}, {addr.street}
                      </p>
                      <p className="text-slate-500 font-medium">
                        {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span>Past Order History</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-700">
                    Total Spend: <strong>{formatPrice(selectedCustomer.totalSpent)}</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {orders.filter((o) => o.customerPhone === selectedCustomer.phone).length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-400">
                      No orders on record with phone +91 {selectedCustomer.phone}.
                    </div>
                  ) : (
                    orders
                      .filter((o) => o.customerPhone === selectedCustomer.phone)
                      .map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-black text-slate-900">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {formatDateTime(ord.createdAt)}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {ord.items.length} items • Slot: {ord.deliverySlot.timeSlot}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900 block">
                              {formatPrice(ord.grandTotal)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {ord.orderStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  const nextStatus = selectedCustomer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                  updateCustomerStatus(selectedCustomer.id, nextStatus);
                  setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
                  showToast(`Customer status updated to ${nextStatus}.`);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedCustomer.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {selectedCustomer.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close 360 View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
