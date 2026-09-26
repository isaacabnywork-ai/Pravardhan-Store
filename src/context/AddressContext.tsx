'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Address } from '@/types';
import { StoreService } from '@/services/storeService';

interface AddressContextType {
  addresses: Address[];
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
  addNewAddress: (address: Omit<Address, 'id'>) => Address;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>(StoreService.getAddresses());
  const [currentAddress, setCurrentAddress] = useState<Address>(
    addresses.find((a) => a.isDefault) || addresses[0]
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fresh_kirana_curr_address');
      if (saved) {
        setCurrentAddress(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSetCurrentAddress = (addr: Address) => {
    setCurrentAddress(addr);
    try {
      localStorage.setItem('fresh_kirana_curr_address', JSON.stringify(addr));
    } catch (e) {
      console.error(e);
    }
  };

  const addNewAddress = (addrData: Omit<Address, 'id'>) => {
    const created = StoreService.addAddress(addrData);
    setAddresses([...StoreService.getAddresses()]);
    handleSetCurrentAddress(created);
    return created;
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        currentAddress,
        setCurrentAddress: handleSetCurrentAddress,
        addNewAddress,
        isLocationModalOpen,
        setIsLocationModalOpen,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}
