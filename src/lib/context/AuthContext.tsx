'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Address } from '@/types';
import { INITIAL_USERS } from '@/lib/data/mock-data';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  loginWithPhoneOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithFirebaseSession: (phone: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogleCustomer: (email: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogleAdmin: (email: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: Role) => Promise<void> | void;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  updateUserPhone: (phone: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'pravdhan_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // fallback
    }

    // Hydrate live session from HTTP-only cookie if available
    fetch('/api/v1/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res && res.data && res.data.authenticated && res.data.user) {
          const liveUser = res.data.user;
          setUser((curr) => {
            const mappedUser: User = {
              id: liveUser.id,
              name: liveUser.name || curr?.name || `Customer ${liveUser.phone?.slice(-4) || 'User'}`,
              phone: liveUser.phone || curr?.phone || '',
              email: liveUser.email || curr?.email,
              role: liveUser.role || 'CUSTOMER',
              addresses: curr?.addresses || [],
              walletBalance: curr?.walletBalance || 0,
              createdAt: curr?.createdAt || new Date().toISOString(),
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
              // Announce user to cloud customer sync bus on session load
              if (mappedUser.role === 'CUSTOMER') {
                fetch('/api/v1/sync/customers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customer: {
                      id: mappedUser.id,
                      name: mappedUser.name,
                      phone: mappedUser.phone,
                      email: mappedUser.email,
                      role: 'CUSTOMER',
                      walletBalance: mappedUser.walletBalance || 0,
                      totalSpent: 0,
                      orderCount: 0,
                      status: 'ACTIVE',
                      addresses: mappedUser.addresses || [],
                      createdAt: mappedUser.createdAt,
                    },
                  }),
                }).catch(() => null);
              }
            } catch {}
            return mappedUser;
          });

          // Fetch customer's live addresses from backend
          fetch('/api/v1/me/addresses')
            .then((addrRes) => (addrRes.ok ? addrRes.json() : null))
            .then((addrRes) => {
              if (addrRes && addrRes.data && Array.isArray(addrRes.data)) {
                setUser((curr) => {
                  if (!curr) return null;
                  const updated = {
                    ...curr,
                    addresses: addrRes.data.map((a: any) => ({
                      id: a.id,
                      userId: a.userId,
                      label: a.label || 'Home',
                      name: a.name,
                      phone: a.phone,
                      houseNumber: a.houseNumber,
                      street: a.street,
                      landmark: a.landmark || '',
                      area: a.area,
                      city: a.city,
                      pincode: a.pincode,
                      isDefault: Boolean(a.isDefault),
                    })),
                  };
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            })
            .catch(() => null);
        }
      })
      .catch(() => null);

    setMounted(true);
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        // Broadcast customer profile to shared cloud store so Admin CRM shows them live
        if (u.role === 'CUSTOMER') {
          fetch('/api/v1/sync/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: {
                id: u.id,
                name: u.name,
                phone: u.phone,
                email: u.email,
                role: 'CUSTOMER',
                walletBalance: u.walletBalance || 0,
                totalSpent: 0,
                orderCount: 0,
                status: 'ACTIVE',
                addresses: u.addresses || [],
                createdAt: u.createdAt || new Date().toISOString(),
              },
            }),
          }).catch(() => null);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage error fallback
    }
  };

  const loginWithPhoneOtp = async (phone: string, otp: string, name?: string) => {
    if (otp.length < 4) {
      return { success: false, message: 'Please enter a valid OTP' };
    }

    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.user) {
        const liveUser = data.data.user;
        const mappedUser: User = {
          id: liveUser.id,
          name: liveUser.name || name || `Customer ${phone.slice(-4)}`,
          phone: liveUser.phone,
          email: liveUser.email || undefined,
          role: liveUser.role || 'CUSTOMER',
          addresses: liveUser.addresses || [],
          createdAt: liveUser.createdAt || new Date().toISOString(),
        };
        saveUser(mappedUser);
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Verification failed. Incorrect or expired OTP.' };
    } catch {
      return { success: false, message: 'Network connectivity error. Could not verify OTP.' };
    }
  };

  const loginWithFirebaseSession = async (phone: string, name?: string) => {
    try {
      const res = await fetch('/api/v1/auth/firebase-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.user) {
        const liveUser = data.data.user;
        const mappedUser: User = {
          id: liveUser.id,
          name: liveUser.name || name || `Customer ${phone.slice(-4)}`,
          phone: liveUser.phone,
          email: liveUser.email || undefined,
          role: liveUser.role || 'CUSTOMER',
          addresses: liveUser.addresses || [],
          createdAt: liveUser.createdAt || new Date().toISOString(),
        };
        saveUser(mappedUser);
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Failed to establish session.' };
    } catch {
      return { success: false, message: 'Network connectivity error. Could not establish session.' };
    }
  };

  const loginWithGoogleCustomer = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/v1/auth/google-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.user) {
        const liveUser = data.data.user;
        const mappedUser: User = {
          id: liveUser.id,
          name: liveUser.name || name || email.split('@')[0],
          phone: liveUser.phone || '',
          email: liveUser.email || email,
          role: liveUser.role || 'CUSTOMER',
          addresses: liveUser.addresses || [],
          createdAt: liveUser.createdAt || new Date().toISOString(),
        };
        saveUser(mappedUser);
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Failed to sign in with Google.' };
    } catch {
      return { success: false, message: 'Network connectivity error. Could not sign in with Google.' };
    }
  };

  const loginWithGoogleAdmin = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/v1/auth/google-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.user) {
        const liveUser = data.data.user;
        const mappedUser: User = {
          id: liveUser.id,
          name: liveUser.name || name || 'Administrator',
          phone: liveUser.phone || '',
          email: liveUser.email || email,
          role: liveUser.role || 'SUPER_ADMIN',
          addresses: liveUser.addresses || [],
          createdAt: liveUser.createdAt || new Date().toISOString(),
        };
        saveUser(mappedUser);
        return { success: true };
      }
      return {
        success: false,
        message: data.error?.message || `Access Denied: ${email} is not authorized for Admin access.`,
      };
    } catch {
      return { success: false, message: 'Network connectivity error. Could not verify admin access.' };
    }
  };

  const logout = () => {
    try {
      fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => null);
    } catch {
      // ignore
    }
    saveUser(null);
  };

  const switchRole = async (newRole: Role) => {
    try {
      const res = await fetch('/api/v1/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data && data.data.user) {
          saveUser(data.data.user);
          return;
        }
      }
    } catch {
      // fallback to mock switch
    }

    const roleUser = INITIAL_USERS.find((u) => u.role === newRole);
    if (roleUser) {
      saveUser(roleUser);
    } else if (user) {
      saveUser({ ...user, role: newRole });
    }
  };

  const addAddress = (addr: Omit<Address, 'id' | 'userId'>) => {
    if (!user) return;

    fetch('/api/v1/me/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addr),
    }).catch(() => null);

    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
      userId: user.id,
      isDefault: user.addresses.length === 0 ? true : addr.isDefault,
    };

    const updatedAddresses = user.addresses.map((a) =>
      newAddr.isDefault ? { ...a, isDefault: false } : a
    );

    const updatedUser = {
      ...user,
      addresses: [...updatedAddresses, newAddr],
    };
    saveUser(updatedUser);
  };

  const updateAddress = (id: string, updatedFields: Partial<Address>) => {
    if (!user) return;

    fetch(`/api/v1/me/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch(() => null);

    const updatedAddresses = user.addresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...updatedFields };
      }
      if (updatedFields.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    const updatedUser = {
      ...user,
      addresses: updatedAddresses,
    };
    saveUser(updatedUser);
  };

  const deleteAddress = (id: string) => {
    if (!user) return;

    fetch(`/api/v1/me/addresses/${id}`, {
      method: 'DELETE',
    }).catch(() => null);

    const updatedUser = {
      ...user,
      addresses: user.addresses.filter((a) => a.id !== id),
    };
    saveUser(updatedUser);
  };

  const updateUserPhone = async (phone: string) => {
    if (!user) return { success: false, message: 'User not signed in' };
    const cleanDigits = phone.replace(/\D/g, '');
    const validPhone = cleanDigits.length === 10 ? cleanDigits : cleanDigits.slice(-10);

    try {
      const res = await fetch('/api/v1/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: validPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...user, phone: validPhone };
        saveUser(updated);
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Could not update phone number' };
    } catch {
      const updated = { ...user, phone: validPhone };
      saveUser(updated);
      return { success: true };
    }
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      addresses: user.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    };
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : null,
        role: mounted && user ? user.role : 'CUSTOMER',
        isAuthenticated: !!user,
        loginWithPhoneOtp,
        loginWithFirebaseSession,
        loginWithGoogleCustomer,
        loginWithGoogleAdmin,
        logout,
        switchRole,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateUserPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
