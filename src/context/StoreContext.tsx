'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppMode,
  CustomerPage,
  AdminPage,
  Product,
  Category,
  CartItem,
  Address,
  DeliverySlot,
  Promotion,
  Order,
  OrderStatus,
  ProductVariant
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADDRESSES,
  INITIAL_DELIVERY_SLOTS,
  INITIAL_PROMOTIONS,
  INITIAL_ORDERS
} from '@/data/mockData';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface StoreContextType {
  // Navigation & Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  customerPage: CustomerPage;
  setCustomerPage: (page: CustomerPage) => void;
  adminPage: AdminPage;
  setAdminPage: (page: AdminPage) => void;
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
  activeProductId: string | null;
  setActiveProductId: (id: string | null) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  navigateToProduct: (productId: string) => void;
  navigateToCategory: (categoryId: string) => void;
  navigateToOrderTracking: (orderId: string) => void;

  // Catalog Data
  products: Product[];
  categories: Category[];
  promotions: Promotion[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, variantId: string, adjustment: number, reason?: string) => void;

  // Cart State & Calculations
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, qty?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, variantId?: string) => number;
  cartCount: number;
  cartSubtotal: number;
  cartMRP: number;
  cartSavings: number;
  couponDiscount: number;
  deliveryFee: number;
  grandTotal: number;
  freeDeliveryThreshold: number;
  minimumOrderValue: number;
  appliedCoupon: Promotion | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Addresses
  addresses: Address[];
  selectedAddress: Address;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  updateAddress: (addr: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Delivery Slots
  deliverySlots: DeliverySlot[];
  selectedSlotId: string;
  setSelectedSlotId: (id: string) => void;
  selectedSlot: DeliverySlot;

  // Orders
  orders: Order[];
  placeOrder: (paymentMethod: string) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  // UI Modals & Drawers
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  showCartDrawer: boolean;
  setShowCartDrawer: (show: boolean) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;

  // Auth State
  authPhone: string;
  setAuthPhone: (phone: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Mode & Routing
  const [appMode, setAppMode] = useState<AppMode>('customer');
  const [customerPage, setCustomerPage] = useState<CustomerPage>('home');
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>('prod-atta-1');
  const [activeOrderId, setActiveOrderId] = useState<string | null>('ord-101');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Core Data
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [promotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [cart, setCart] = useState<CartItem[]>([
    {
      productId: 'prod-atta-1',
      variantId: 'var-atta-5kg',
      product: INITIAL_PRODUCTS[0],
      variant: INITIAL_PRODUCTS[0].variants[1],
      quantity: 1
    },
    {
      productId: 'prod-amul-milk',
      variantId: 'var-milk-1l',
      product: INITIAL_PRODUCTS[2],
      variant: INITIAL_PRODUCTS[2].variants[1],
      quantity: 2
    }
  ]);
  const [wishlist, setWishlist] = useState<string[]>(['prod-mango-alphonso', 'prod-tata-tea-gold']);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [deliverySlots] = useState<DeliverySlot[]>(INITIAL_DELIVERY_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-today-1');
  const [appliedCoupon, setAppliedCoupon] = useState<Promotion | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Aashirvaad Atta',
    'Amul Milk',
    'Fortune Oil',
    'Mangoes',
    'Tomatoes'
  ]);

  // Modals & Feedback
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Navigation helpers
  const navigateToProduct = (productId: string) => {
    setActiveProductId(productId);
    setCustomerPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setCustomerPage('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrderTracking = (orderId: string) => {
    setActiveOrderId(orderId);
    setCustomerPage('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast feedback
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const getItemQuantity = (productId: string, variantId?: string) => {
    if (variantId) {
      const item = cart.find((i) => i.productId === productId && i.variantId === variantId);
      return item ? item.quantity : 0;
    }
    // Sum all variants of this product
    return cart
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const addToCart = (product: Product, variantId?: string, qty: number = 1) => {
    const selectedVariant = variantId 
      ? product.variants.find((v) => v.id === variantId) || product.variants[0]
      : product.variants.find((v) => v.isDefault) || product.variants[0];

    if (!selectedVariant || selectedVariant.stock <= 0) {
      showToast('This product variant is currently out of stock', 'error');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.variantId === selectedVariant.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        if (newQty > selectedVariant.stock) {
          showToast(`Only ${selectedVariant.stock} items left in stock`, 'info');
          updated[existingIndex].quantity = selectedVariant.stock;
        } else {
          updated[existingIndex].quantity = newQty;
          showToast(`Updated quantity: ${product.name} (${selectedVariant.weight})`, 'success');
        }
        return updated;
      } else {
        showToast(`Added to cart: ${product.name} (${selectedVariant.weight})`, 'success');
        return [
          ...prev,
          {
            productId: product.id,
            variantId: selectedVariant.id,
            product,
            variant: selectedVariant,
            quantity: Math.min(qty, selectedVariant.stock)
          }
        ];
      }
    });
  };

  const updateCartQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const clamped = Math.min(quantity, item.variant.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
    [cart]
  );

  const cartMRP = useMemo(
    () => cart.reduce((sum, item) => sum + item.variant.mrp * item.quantity, 0),
    [cart]
  );

  const cartSavings = Math.max(0, cartMRP - cartSubtotal);

  const freeDeliveryThreshold = 500;
  const minimumOrderValue = 100;

  const deliveryFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= freeDeliveryThreshold ? 0 : 30;
  }, [cartSubtotal]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (cartSubtotal < appliedCoupon.minOrderValue) return 0;

    if (appliedCoupon.discountType === 'flat') {
      return appliedCoupon.discountValue;
    } else {
      const calc = (cartSubtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    }
  }, [appliedCoupon, cartSubtotal]);

  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryFee);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = promotions.find((p) => p.code.toUpperCase() === cleanCode);

    if (!found) {
      showToast('Invalid coupon code. Try FRESH50 or PRABHANDHAN100', 'error');
      return { success: false, message: 'Invalid coupon code.' };
    }

    if (cartSubtotal < found.minOrderValue) {
      const diff = found.minOrderValue - cartSubtotal;
      showToast(`Add ₹${diff} more to avail coupon ${found.code}`, 'info');
      return { success: false, message: `Minimum order value for this coupon is ₹${found.minOrderValue}` };
    }

    setAppliedCoupon(found);
    showToast(`Coupon applied! You saved extra ₹${found.discountType === 'flat' ? found.discountValue : found.discountValue + '%'}`, 'success');
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Address
  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newId = `addr-${Date.now()}`;
    const newAddress: Address = { ...addr, id: newId };
    setAddresses((prev) => {
      if (addr.isDefault) {
        return prev.map((a) => ({ ...a, isDefault: false })).concat(newAddress);
      }
      return [...prev, newAddress];
    });
    setSelectedAddressId(newId);
    showToast('New address saved', 'success');
  };

  const updateAddress = (addr: Address) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === addr.id) return addr;
        if (addr.isDefault) return { ...a, isDefault: false };
        return a;
      })
    );
    showToast('Address updated', 'success');
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address deleted', 'info');
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    setSelectedAddressId(id);
    showToast('Default address updated', 'success');
  };

  // Delivery Slots
  const selectedSlot = useMemo(() => {
    return deliverySlots.find((s) => s.id === selectedSlotId) || deliverySlots[0];
  }, [deliverySlots, selectedSlotId]);

  // Order Operations
  const placeOrder = (paymentMethod: string): Order => {
    const orderNum = `PB-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      items: [...cart],
      address: selectedAddress,
      deliverySlot: selectedSlot,
      paymentMethod,
      paymentStatus: paymentMethod.toLowerCase().includes('cash') ? 'CASH_ON_DELIVERY' : 'PAID',
      subtotal: cartSubtotal,
      savings: cartSavings,
      couponDiscount,
      couponCode: appliedCoupon?.code,
      deliveryFee,
      total: grandTotal,
      estimatedDelivery: `${selectedSlot.date}, ${selectedSlot.time}`,
      deliveryPartner: {
        name: 'Ramesh Kumar',
        phone: '+91 98450 12345',
        vehicleNo: 'KA-03-EM-8421'
      },
      timeline: [
        { status: 'PLACED', label: 'Order Placed', time: 'Just now', completed: true, current: false },
        { status: 'CONFIRMED', label: 'Order Confirmed', time: 'Just now', completed: true, current: true },
        { status: 'PREPARING', label: 'Being Packed & Checked', time: 'Upcoming', completed: false, current: false },
        { status: 'READY', label: 'Ready for Dispatch', time: 'Upcoming', completed: false, current: false },
        { status: 'OUT FOR DELIVERY', label: 'Out for Delivery', time: 'Upcoming', completed: false, current: false },
        { status: 'DELIVERED', label: 'Delivered at Doorstep', time: 'Upcoming', completed: false, current: false }
      ]
    };

    // Update inventory stock for purchased items
    setProducts((prev) =>
      prev.map((prod) => {
        const purchasedInCart = cart.filter((c) => c.productId === prod.id);
        if (!purchasedInCart.length) return prod;

        return {
          ...prod,
          variants: prod.variants.map((v) => {
            const purchasedVariant = purchasedInCart.find((c) => c.variantId === v.id);
            if (!purchasedVariant) return v;
            return {
              ...v,
              stock: Math.max(0, v.stock - purchasedVariant.quantity)
            };
          })
        };
      })
    );

    // Prepend to orders
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();
    setAppliedCoupon(null);
    showToast(`Order #${orderNum} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT FOR DELIVERY',
      'DELIVERED'
    ];

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const newTargetIndex = statusOrder.indexOf(newStatus);
        const updatedTimeline = order.timeline.map((event) => {
          const eventIndex = statusOrder.indexOf(event.status);
          const isCompleted = eventIndex <= newTargetIndex;
          const isCurrent = event.status === newStatus;
          return {
            ...event,
            completed: isCompleted,
            current: isCurrent,
            time: isCurrent ? 'Updated just now' : event.time
          };
        });

        return {
          ...order,
          status: newStatus,
          timeline: updatedTimeline
        };
      })
    );

    showToast(`Order status updated to: ${newStatus}`, 'info');
  };

  // Product Admin Operations
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added to catalog`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Product "${updated.name}" updated`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from catalog', 'info');
  };

  const updateStock = (productId: string, variantId: string, adjustment: number, reason?: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          variants: prod.variants.map((v) => {
            if (v.id !== variantId) return v;
            const newStock = Math.max(0, v.stock + adjustment);
            return { ...v, stock: newStock };
          })
        };
      })
    );
    showToast(`Inventory updated ${adjustment > 0 ? '+' : ''}${adjustment} units${reason ? ` (${reason})` : ''}`, 'success');
  };

  // Search Helpers
  const addRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setAddresses(INITIAL_ADDRESSES);
    showToast('Demo data reset to fresh defaults', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        appMode,
        setAppMode,
        customerPage,
        setCustomerPage,
        adminPage,
        setAdminPage,
        activeCategoryId,
        setActiveCategoryId,
        activeProductId,
        setActiveProductId,
        activeOrderId,
        setActiveOrderId,
        navigateToProduct,
        navigateToCategory,
        navigateToOrderTracking,

        products,
        categories,
        promotions,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getItemQuantity,
        cartCount,
        cartSubtotal,
        cartMRP,
        cartSavings,
        couponDiscount,
        deliveryFee,
        grandTotal,
        freeDeliveryThreshold,
        minimumOrderValue,
        appliedCoupon,
        applyCoupon,
        removeCoupon,

        wishlist,
        toggleWishlist,
        isInWishlist,

        addresses,
        selectedAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,

        deliverySlots,
        selectedSlotId,
        setSelectedSlotId,
        selectedSlot,

        orders,
        placeOrder,
        updateOrderStatus,

        searchQuery,
        setSearchQuery,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,

        showLocationModal,
        setShowLocationModal,
        showCartDrawer,
        setShowCartDrawer,
        toasts,
        showToast,
        dismissToast,
        resetDemoData,
        authPhone,
        setAuthPhone,
        isAuthenticated,
        setIsAuthenticated
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
