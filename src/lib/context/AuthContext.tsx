'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Address } from '@/types';
import { INITIAL_USERS } from '@/lib/data/mock-data';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  loginWithPhoneOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'pravdhan_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(INITIAL_USERS[0]); // default to customer
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
    setMounted(true);
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage error fallback
    }
  };

  const loginWithPhoneOtp = async (phone: string, otp: string, name?: string) => {
    // In V1, any 6-digit OTP is accepted or demo OTP "123456"
    if (otp.length < 4) {
      return { success: false, message: 'Please enter a valid OTP' };
    }

    // Check if user with this phone exists in initial list
    let existing = INITIAL_USERS.find((u) => u.phone === phone);
    if (!existing) {
      existing = {
        id: `user-${Date.now()}`,
        name: name || `Customer ${phone.slice(-4)}`,
        phone,
        role: 'CUSTOMER',
        addresses: [],
        createdAt: new Date().toISOString(),
      };
    }
    saveUser(existing);
    return { success: true };
  };

  const logout = () => {
    saveUser(null);
  };

  const switchRole = (newRole: Role) => {
    const roleUser = INITIAL_USERS.find((u) => u.role === newRole);
    if (roleUser) {
      saveUser(roleUser);
    } else if (user) {
      saveUser({ ...user, role: newRole });
    }
  };

  const addAddress = (addr: Omit<Address, 'id' | 'userId'>) => {
    if (!user) return;
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

  const deleteAddress = (id: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      addresses: user.addresses.filter((a) => a.id !== id),
    };
    saveUser(updatedUser);
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
        user: mounted ? user : INITIAL_USERS[0],
        role: mounted && user ? user.role : 'CUSTOMER',
        isAuthenticated: !!user,
        loginWithPhoneOtp,
        logout,
        switchRole,
        addAddress,
        deleteAddress,
        setDefaultAddress,
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
