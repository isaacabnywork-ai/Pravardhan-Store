import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Home, Grid, Search, Package, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { customerPage, setCustomerPage } = useStore();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => setCustomerPage('home'),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid,
      action: () => setCustomerPage('categories'),
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: () => setCustomerPage('search'),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      action: () => setCustomerPage('orders'),
    },
    {
      id: 'account',
      label: 'Profile',
      icon: User,
      action: () => setCustomerPage('account'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden px-1 py-1 shadow-cartbar">
      <div className="flex items-center justify-around h-12 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = customerPage === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex-1 h-full flex flex-col items-center justify-center relative select-none transition-colors ${
                isActive ? 'text-[#0C831F]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-0.5 leading-none ${isActive ? 'font-bold text-[#0C831F]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
