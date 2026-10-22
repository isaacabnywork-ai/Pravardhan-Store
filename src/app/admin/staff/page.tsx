'use client';

import React, { useState } from 'react';
import {
  Users,
  Truck,
  Plus,
  Search,
  Phone,
  Shield,
  CheckCircle2,
  X,
  Bike,
  Package,
} from 'lucide-react';
import { Role } from '@/types';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  status: 'ON_DUTY' | 'ON_BREAK' | 'OFF_DUTY';
  assignedZone: string;
  vehicleOrStation?: string;
  activeOrdersCount: number;
  completedToday: number;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Amit Singh',
    phone: '+91 9833445566',
    email: 'amit.singh@pravdhan.com',
    role: 'DELIVERY_STAFF',
    status: 'ON_DUTY',
    assignedZone: 'Sector 49 & South City II',
    vehicleOrStation: 'TVS iQube EV (HR-26-EQ-4491)',
    activeOrdersCount: 2,
    completedToday: 18,
  },
  {
    id: 'staff-2',
    name: 'Rahul Verma',
    phone: '+91 9877112233',
    email: 'rahul.verma@pravdhan.com',
    role: 'DELIVERY_STAFF',
    status: 'ON_DUTY',
    assignedZone: 'Sohna Road Corridor',
    vehicleOrStation: 'Honda Activa 6G (HR-26-CF-9081)',
    activeOrdersCount: 1,
    completedToday: 14,
  },
  {
    id: 'staff-3',
    name: 'Deepak Kumar',
    phone: '+91 9811223344',
    email: 'deepak.kumar@pravdhan.com',
    role: 'ORDER_MANAGER',
    status: 'ON_DUTY',
    assignedZone: 'Hub #01 Fulfillment Station',
    vehicleOrStation: 'Packing Bay Alpha',
    activeOrdersCount: 0,
    completedToday: 42,
  },
  {
    id: 'staff-4',
    name: 'Priya Sharma',
    phone: '+91 9899001122',
    email: 'priya.sharma@pravdhan.com',
    role: 'PRODUCT_MANAGER',
    status: 'ON_DUTY',
    assignedZone: 'Central Dark Store Inventory',
    vehicleOrStation: 'Stock Audit Console',
    activeOrdersCount: 0,
    completedToday: 12,
  },
  {
    id: 'staff-5',
    name: 'Vikram Joshi',
    phone: '+91 9844556677',
    email: 'vikram.joshi@pravdhan.com',
    role: 'DELIVERY_STAFF',
    status: 'ON_BREAK',
    assignedZone: 'Golf Course Extension',
    vehicleOrStation: 'Ather 450X (HR-26-DZ-1192)',
    activeOrdersCount: 0,
    completedToday: 11,
  },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('DELIVERY_STAFF');
  const [newZone, setNewZone] = useState('Sector 49 Hub');
  const [newVehicle, setNewVehicle] = useState('');

  const filteredStaff = staff.filter((m) => {
    if (roleFilter !== 'ALL' && m.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchPhone = m.phone.includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const toggleDutyStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus =
          s.status === 'ON_DUTY' ? 'ON_BREAK' : s.status === 'ON_BREAK' ? 'OFF_DUTY' : 'ON_DUTY';
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@pravdhan.com`,
      role: newRole,
      status: 'ON_DUTY',
      assignedZone: newZone,
      vehicleOrStation: newVehicle || (newRole === 'DELIVERY_STAFF' ? 'Delivery Fleet EV' : 'Hub Station'),
      activeOrdersCount: 0,
      completedToday: 0,
    };

    setStaff([newMember, ...staff]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewVehicle('');
  };

  const activeRidersCount = staff.filter(
    (s) => s.role === 'DELIVERY_STAFF' && s.status === 'ON_DUTY'
  ).length;

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Staff & Fleet Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {activeRidersCount} Active Riders on Duty
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dark store personnel, shift rosters, picker stations, and delivery fleet executives
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* KPI Summary Cards - Responsive 2x2 on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Roster
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {staff.length}
            </h2>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 block truncate">
              Across shifts
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Riders on Road
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-700 tracking-tight">
              {activeRidersCount} Active
            </h2>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5 block truncate">
              Ready to dispatch
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Bags In Transit
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-blue-700 tracking-tight">
              {staff.reduce((sum, s) => sum + s.activeOrdersCount, 0)} Bags
            </h2>
            <span className="text-[10px] sm:text-xs text-blue-600 font-medium mt-0.5 block truncate">
              Doorstep delivery
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
              Fulfilled Today
            </span>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {staff.reduce((sum, s) => sum + s.completedToday, 0)}
            </h2>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-medium mt-0.5 block truncate">
              100% OTP verified
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { key: 'ALL', label: 'All Staff' },
            { key: 'DELIVERY_STAFF', label: 'Delivery Riders' },
            { key: 'ORDER_MANAGER', label: 'Picking & Orders' },
            { key: 'PRODUCT_MANAGER', label: 'Inventory Desk' },
            { key: 'SUPER_ADMIN', label: 'Super Admins' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Operational Role</th>
                <th className="py-3.5 px-4">Shift Status</th>
                <th className="py-3.5 px-4">Assigned Station / Vehicle</th>
                <th className="py-3.5 px-4 text-center">Active Load</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {member.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {member.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        member.role === 'DELIVERY_STAFF'
                          ? 'bg-purple-100 text-purple-900'
                          : member.role === 'ORDER_MANAGER'
                          ? 'bg-blue-100 text-blue-900'
                          : member.role === 'PRODUCT_MANAGER'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {member.role === 'DELIVERY_STAFF' && <Truck className="w-3 h-3" />}
                      {member.role === 'ORDER_MANAGER' && <Package className="w-3 h-3" />}
                      {member.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3" />}
                      {member.role.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleDutyStatus(member.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        member.status === 'ON_DUTY'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : member.status === 'ON_BREAK'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Click to toggle shift duty status"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          member.status === 'ON_DUTY'
                            ? 'bg-emerald-500 animate-pulse'
                            : member.status === 'ON_BREAK'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{member.status.replace(/_/g, ' ')}</span>
                    </button>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-800">{member.assignedZone}</p>
                    {member.vehicleOrStation && (
                      <p className="text-[11px] text-slate-500">{member.vehicleOrStation}</p>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="font-extrabold text-slate-900 block text-sm">
                      {member.activeOrdersCount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({member.completedToday} today)
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`tel:${member.phone}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="Call Staff Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => toggleDutyStatus(member.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] transition-colors"
                      >
                        Change Shift
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Register New Staff Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (+91)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role & Privilege</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="DELIVERY_STAFF">Delivery Fleet Rider</option>
                  <option value="ORDER_MANAGER">Order & Picking Manager</option>
                  <option value="PRODUCT_MANAGER">Inventory & Catalog Manager</option>
                  <option value="SUPER_ADMIN">Dark Store Hub Admin</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Zone / Hub Area</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 49, South City II"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Vehicle / Workstation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ather 450X (HR-26-AB-1234)"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors shadow-sm shadow-emerald-700/20"
                >
                  Save & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
