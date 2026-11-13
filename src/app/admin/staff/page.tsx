'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Edit,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { Role } from '@/types';
import { useAuth } from '@/lib/context/AuthContext';

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
  const { role: currentUserRole, user: currentAuthUser } = useAuth();
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<StaffMember | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('DELIVERY_STAFF');
  const [newZone, setNewZone] = useState('Sector 49 Hub');
  const [newVehicle, setNewVehicle] = useState('');

  // Load live DB staff list on mount
  useEffect(() => {
    fetch('/api/v1/admin/staff')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: StaffMember[] = data.data.map((u: any, idx: number) => ({
            id: u.id,
            name: u.name || 'Staff Member',
            phone: u.phone || '+91 9800000000',
            email: u.email || 'staff@pravdhan.com',
            role: (u.role as Role) || 'STORE_MANAGER',
            status: u.isActive ? 'ON_DUTY' : 'OFF_DUTY',
            assignedZone: 'Central Store Hub',
            vehicleOrStation: u.role === 'DELIVERY_STAFF' ? 'Delivery Fleet EV' : 'Management Console',
            activeOrdersCount: 0,
            completedToday: 5 + (idx * 3),
          }));
          setStaff((prev) => {
            // merge unique by email or phone
            const existingKeys = new Set(mapped.map((m) => m.email.toLowerCase()));
            const remainingMock = prev.filter((p) => !existingKeys.has(p.email.toLowerCase()));
            return [...mapped, ...remainingMock];
          });
        }
      })
      .catch(() => {});
  }, []);

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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    if (!isSuperAdmin) {
      setActionError('Permission Denied: Only Super Admin can register new staff members and grant roles.');
      return;
    }

    setActionError('');
    const emailToUse = newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@pravdhan.com`;

    try {
      // Create in backend database
      const res = await fetch('/api/v1/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          email: emailToUse,
          role: newRole,
          password: 'Password@123',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error?.message || 'Could not save staff member to server.');
      } else {
        setActionSuccess(`Staff member ${newName} successfully granted ${newRole.replace(/_/g, ' ')} access.`);
        setTimeout(() => setActionSuccess(''), 5000);
      }

      const newMember: StaffMember = {
        id: (data && data.data && data.data.id) || `staff-${Date.now()}`,
        name: newName,
        phone: newPhone,
        email: emailToUse,
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
    } catch {
      // Local optimistic fallback
      const newMember: StaffMember = {
        id: `staff-${Date.now()}`,
        name: newName,
        phone: newPhone,
        email: emailToUse,
        role: newRole,
        status: 'ON_DUTY',
        assignedZone: newZone,
        vehicleOrStation: newVehicle || (newRole === 'DELIVERY_STAFF' ? 'Delivery Fleet EV' : 'Hub Station'),
        activeOrdersCount: 0,
        completedToday: 0,
      };
      setStaff([newMember, ...staff]);
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateRole = async (memberId: string, updatedRole: Role) => {
    if (!isSuperAdmin) {
      setActionError('Permission Denied: Only Super Admin can change staff roles.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/staff/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: updatedRole }),
      });
      if (res.ok) {
        setActionSuccess('Role successfully updated.');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch {}

    setStaff((prev) =>
      prev.map((s) => (s.id === memberId ? { ...s, role: updatedRole } : s))
    );
    setEditingMember(null);
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (!isSuperAdmin) {
      setActionError('Permission Denied: Only Super Admin can remove staff members.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/staff/${member.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionSuccess(`Staff member ${member.name} access revoked.`);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch {}

    setStaff((prev) => prev.filter((s) => s.id !== member.id));
    setDeleteConfirmMember(null);
  };

  const activeRidersCount = staff.filter(
    (s) => s.role === 'DELIVERY_STAFF' && s.status === 'ON_DUTY'
  ).length;

  return (
    <div className="space-y-8 max-w-full">
      {/* Feedback Alerts */}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-semibold">{actionError}</p>
          </div>
          <button onClick={() => setActionError('')} className="p-1 hover:bg-rose-100 rounded-lg">
            <X className="w-3.5 h-3.5 text-rose-700" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-semibold">{actionSuccess}</p>
          </div>
          <button onClick={() => setActionSuccess('')} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      )}

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
            Dark store personnel, shift rosters, picker stations, and role privileges
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
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
                    <div className="flex items-center justify-end gap-1.5">
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
                        title="Change Shift Status"
                      >
                        Shift
                      </button>

                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => setEditingMember(member)}
                            className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-xl transition-colors"
                            title="Edit Role & Permissions"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmMember(member)}
                            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl transition-colors"
                            title="Remove Member from Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
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

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-4 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Change Staff Role
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-900">{editingMember.name}</p>
                <p className="text-[11px] text-slate-500">{editingMember.email}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">Select New Role</label>
                <select
                  defaultValue={editingMember.role}
                  id="editRoleSelect"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="SUPER_ADMIN">👑 Super Admin</option>
                  <option value="STORE_MANAGER">🏬 Store Manager</option>
                  <option value="PRODUCT_MANAGER">📦 Product Manager</option>
                  <option value="ORDER_MANAGER">⚡ Order Manager</option>
                  <option value="DELIVERY_STAFF">🛵 Delivery Fleet Staff</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = document.getElementById('editRoleSelect') as HTMLSelectElement;
                  if (sel) handleUpdateRole(editingMember.id, sel.value as Role);
                }}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-4 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Revoke Staff Access?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <span className="font-bold text-slate-800">{deleteConfirmMember.name}</span> from staff? They will lose all backend access.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMember(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteStaff(deleteConfirmMember)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm shadow-rose-600/20"
              >
                Yes, Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
