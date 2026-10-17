'use client';

import React, { useState } from 'react';
import { StoreProvider, useStore } from '@/context/StoreContext';
import { Header } from '@/components/customer/Header';
import { BottomNavigation } from '@/components/customer/BottomNavigation';
import { Footer } from '@/components/customer/Footer';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { LocationModal } from '@/components/customer/LocationModal';
import { FloatingCartBar } from '@/components/customer/FloatingCartBar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { DemoSwitcher } from '@/components/common/DemoSwitcher';

// Customer Page Views
import { HomeScreen } from '@/components/customer/HomeScreen';
import { CategoriesScreen } from '@/components/customer/CategoriesScreen';
import { CategoryListingScreen } from '@/components/customer/CategoryListingScreen';
import { ProductDetailScreen } from '@/components/customer/ProductDetailScreen';
import { SearchScreen } from '@/components/customer/SearchScreen';
import { CartScreen } from '@/components/customer/CartScreen';
import { CheckoutScreen } from '@/components/customer/CheckoutScreen';
import { OrderConfirmationScreen } from '@/components/customer/OrderConfirmationScreen';
import { OrderTrackingScreen } from '@/components/customer/OrderTrackingScreen';
import { OrdersScreen } from '@/components/customer/OrdersScreen';
import { WishlistScreen } from '@/components/customer/WishlistScreen';
import { OffersScreen } from '@/components/customer/OffersScreen';
import { AccountScreen } from '@/components/customer/AccountScreen';

// Admin Views
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminInventory } from '@/components/admin/AdminInventory';
import { AdminPromotions } from '@/components/admin/AdminPromotions';
import { AdminCustomers } from '@/components/admin/AdminCustomers';
import { AdminSettings } from '@/components/admin/AdminSettings';

// Delivery Staff View
import { DeliveryStaffScreen } from '@/components/delivery/DeliveryStaffScreen';

function StoreAppContent() {
  const { appMode, customerPage, adminPage } = useStore();
  const [deviceFrame, setDeviceFrame] = useState<'fluid' | 'mobile' | 'tablet'>('fluid');

  const isCheckout = customerPage === 'checkout';

  // Helper to render Customer Pages
  const renderCustomerPage = () => {
    switch (customerPage) {
      case 'home':
        return <HomeScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'category':
        return <CategoryListingScreen />;
      case 'product':
        return <ProductDetailScreen />;
      case 'search':
        return <SearchScreen />;
      case 'cart':
        return <CartScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'order-confirmation':
        return <OrderConfirmationScreen />;
      case 'order-tracking':
        return <OrderTrackingScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'wishlist':
        return <WishlistScreen />;
      case 'offers':
        return <OffersScreen />;
      case 'account':
        return <AccountScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Helper to render Admin Pages
  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'orders':
        return <AdminOrders />;
      case 'products':
        return <AdminProducts />;
      case 'inventory':
        return <AdminInventory />;
      case 'promotions':
        return <AdminPromotions />;
      case 'customers':
        return <AdminCustomers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div
      className={`min-h-screen ${
        deviceFrame !== 'fluid'
          ? 'bg-stone-900 py-6 px-4 flex items-center justify-center'
          : 'bg-[#F4F6F8]'
      }`}
    >
      {/* Device Frame Simulation Container (Fluid by default for full-screen e-commerce) */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrame === 'mobile'
            ? 'max-w-[420px] h-[880px] overflow-y-auto bg-[#F4F6F8] rounded-[44px] shadow-2xl border-[12px] border-slate-900 relative'
            : deviceFrame === 'tablet'
            ? 'max-w-[768px] h-[920px] overflow-y-auto bg-[#F4F6F8] rounded-[32px] shadow-2xl border-[12px] border-slate-900 relative'
            : 'min-h-screen flex flex-col'
        }`}
      >
        {/* Device Simulated Status Bar for mobile preview */}
        {deviceFrame === 'mobile' && (
          <div className="sticky top-0 z-50 bg-white text-gray-900 px-6 pt-3 pb-1.5 flex justify-between items-center text-xs font-semibold border-b border-gray-100">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black/15 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-gray-800 rounded-2xs p-0.5">
                <div className="h-full w-full bg-gray-800 rounded-3xs" />
              </div>
            </div>
          </div>
        )}

        {/* 1. Customer Storefront (Full E-Commerce Website) */}
        {appMode === 'customer' && (
          <div className="flex-1 flex flex-col min-h-full bg-[#F4F6F8]">
            {!isCheckout && <Header />}

            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 pb-28 lg:pb-12">
              {renderCustomerPage()}
            </main>

            {!isCheckout && <Footer />}
            {!isCheckout && <BottomNavigation />}

            {/* Overlays */}
            <CartDrawer />
            <LocationModal />
            <FloatingCartBar />
          </div>
        )}

        {/* 2. Admin Operations Mode */}
        {appMode === 'admin' && (
          <div className="flex-1 flex flex-col">
            <AdminLayout>{renderAdminPage()}</AdminLayout>
          </div>
        )}

        {/* 3. Delivery Partner Mobile Mode */}
        {appMode === 'delivery' && (
          <div className="flex-1 flex flex-col">
            <DeliveryStaffScreen />
          </div>
        )}

        <ToastContainer />
      </div>

      {/* Unobtrusive Developer Role & Frame Switcher */}
      <DemoSwitcher deviceFrame={deviceFrame} setDeviceFrame={setDeviceFrame} />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <StoreAppContent />
    </StoreProvider>
  );
}
