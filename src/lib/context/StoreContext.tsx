'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  InventoryHistory,
  Promotion,
  DeliverySlot,
  StoreSettings,
  OrderStatus,
  ProductVariant,
  CustomerProfile,
  WalletTransaction,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_SLOTS,
  INITIAL_PROMOTIONS,
  INITIAL_STORE_SETTINGS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY_HISTORY,
  INITIAL_CUSTOMERS,
} from '@/lib/data/mock-data';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  inventoryHistory: InventoryHistory[];
  promotions: Promotion[];
  deliverySlots: DeliverySlot[];
  storeSettings: StoreSettings;
  customers: CustomerProfile[];
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  adjustStock: (variantId: string, quantityChange: number, reason: string, updatedBy: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  assignDeliveryStaff: (orderId: string, staffId: string, staffName: string) => void;
  createOrder: (order: Order) => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  togglePromotionStatus: (id: string) => void;
  creditCustomerWallet: (customerId: string, amount: number, reason: string, notes?: string, adminBy?: string) => void;
  debitCustomerWallet: (customerId: string, amount: number, reason: string, notes?: string, adminBy?: string) => void;
  updateCustomerStatus: (customerId: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  getCustomerById: (customerId: string) => CustomerProfile | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_KEY = 'pravdhan_products_v3';
const ORDERS_KEY = 'pravdhan_orders_v1';
const INVENTORY_HIST_KEY = 'pravdhan_inv_hist_v1';
const PROMOS_KEY = 'pravdhan_promos_v1';
const SETTINGS_KEY = 'pravdhan_settings_v2';
const CUSTOMERS_KEY = 'pravdhan_customers_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory[]>(INITIAL_INVENTORY_HISTORY);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [deliverySlots] = useState<DeliverySlot[]>(INITIAL_DELIVERY_SLOTS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PRODUCTS_KEY);
      if (p) {
        const loaded: Product[] = JSON.parse(p);
        const existingIds = new Set(loaded.map((item) => item.id));
        const merged = [...loaded, ...INITIAL_PRODUCTS.filter((item) => !existingIds.has(item.id))];
        setProducts(merged);
      }

      const o = localStorage.getItem(ORDERS_KEY);
      if (o) {
        const loaded: Order[] = JSON.parse(o);
        const existingIds = new Set(loaded.map((item) => item.id));
        const merged = [...loaded, ...INITIAL_ORDERS.filter((item) => !existingIds.has(item.id))];
        setOrders(merged);
      }

      const inv = localStorage.getItem(INVENTORY_HIST_KEY);
      if (inv) setInventoryHistory(JSON.parse(inv));

      const pr = localStorage.getItem(PROMOS_KEY);
      if (pr) setPromotions(JSON.parse(pr));

      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setStoreSettings(JSON.parse(s));

      const c = localStorage.getItem(CUSTOMERS_KEY);
      if (c) {
        const loaded: CustomerProfile[] = JSON.parse(c);
        const existingIds = new Set(loaded.map((item) => item.id));
        const merged = [...loaded, ...INITIAL_CUSTOMERS.filter((item) => !existingIds.has(item.id))];
        setCustomers(merged);
      }

      // Asynchronously sync stock levels with live Neon backend
      fetch('/api/v1/products?pageSize=100')
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
            setProducts((current) => {
              const liveMap = new Map(res.data.map((p: any) => [p.slug, p]));
              return current.map((item) => {
                const live = liveMap.get(item.slug) as any;
                if (!live) return item;
                return {
                  ...item,
                  variants: item.variants.map((v) => {
                    if (
                      live.primaryVariant &&
                      (v.sku === live.primaryVariant.sku || v.title === live.primaryVariant.title)
                    ) {
                      return {
                        ...v,
                        stock: live.primaryVariant.availableStock ?? v.stock,
                      };
                    }
                    return v;
                  }),
                };
              });
            });
          }
        })
        .catch(() => null);

      // Asynchronously sync customer/admin orders with live Neon backend
      fetch('/api/v1/orders')
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
            setOrders((current) => {
              const liveOrders = res.data.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                userId: o.userId,
                customerName: o.customerName,
                customerPhone: o.customerPhone,
                deliveryAddress: o.deliveryAddress,
                deliverySlot: {
                  id: 'slot-instant',
                  label: o.deliverySlot || 'Instant (10-15 mins)',
                  timeSlot: o.deliverySlot || 'Instant (10-15 mins)',
                  dateType: 'TODAY' as const,
                  isAvailable: true,
                },
                items: (o.items || []).map((i: any) => ({
                  productId: i.productId,
                  variantId: i.variantId,
                  productName: i.productName,
                  variantTitle: i.variantTitle,
                  brand: i.brand,
                  unit: i.unit,
                  purchasedPrice: Math.round((i.purchasedPrice || 0) / 100),
                  purchasedMrp: Math.round((i.purchasedMrp || 0) / 100),
                  quantity: i.quantity,
                  image: i.image,
                })),
                subtotal: Math.round((o.subtotal || 0) / 100),
                discount: Math.round((o.discount || 0) / 100),
                couponCode: o.couponCode,
                couponDiscount: Math.round((o.couponDiscount || 0) / 100),
                deliveryCharge: Math.round((o.deliveryFee || 0) / 100),
                deliveryTip: Math.round((o.deliveryTip || 0) / 100),
                handlingFee: Math.round((o.handlingFee || 0) / 100),
                grandTotal: Math.round((o.grandTotal || 0) / 100),
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                orderStatus:
                  o.orderStatus === 'PLACED'
                    ? 'ORDER_PLACED'
                    : o.orderStatus === 'CONFIRMED'
                    ? 'ORDER_CONFIRMED'
                    : o.orderStatus === 'PREPARING'
                    ? 'BEING_PREPARED'
                    : o.orderStatus === 'READY_FOR_PICKUP'
                    ? 'READY_FOR_DELIVERY'
                    : o.orderStatus,
                statusHistory: (o.statusHistory || []).map((h: any) => ({
                  status: h.status,
                  label: h.label,
                  timestamp: new Date(h.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  note: h.note,
                  completed: true,
                })),
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
              }));

              const liveIds = new Set(liveOrders.map((lo: any) => lo.id));
              const remaining = current.filter((c) => !liveIds.has(c.id));
              return [...liveOrders, ...remaining];
            });
          }
        })
        .catch(() => null);
    } catch {
      // ignore
    }
  }, []);

  const saveProducts = (newProds: Product[]) => {
    setProducts(newProds);
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProds));
    } catch {
      // ignore
    }
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
    } catch {
      // ignore
    }
  };

  const saveInventoryHistory = (newHist: InventoryHistory[]) => {
    setInventoryHistory(newHist);
    try {
      localStorage.setItem(INVENTORY_HIST_KEY, JSON.stringify(newHist));
    } catch {
      // ignore
    }
  };

  const savePromotions = (newPromos: Promotion[]) => {
    setPromotions(newPromos);
    try {
      localStorage.setItem(PROMOS_KEY, JSON.stringify(newPromos));
    } catch {
      // ignore
    }
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...newSettings };
    setStoreSettings(updated);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const updateProduct = (updated: Product) => {
    const updatedList = products.map((p) => (p.id === updated.id ? updated : p));
    saveProducts(updatedList);
  };

  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);
    return newProduct;
  };

  const adjustStock = (variantId: string, quantityChange: number, reason: string, updatedBy: string) => {
    let targetProduct: Product | undefined;
    let targetVariant: ProductVariant | undefined;

    const newProducts = products.map((prod) => {
      const hasVariant = prod.variants.some((v) => v.id === variantId);
      if (!hasVariant) return prod;

      targetProduct = prod;
      const updatedVariants = prod.variants.map((v) => {
        if (v.id === variantId) {
          targetVariant = v;
          const newStock = Math.max(0, v.stock + quantityChange);
          return { ...v, stock: newStock };
        }
        return v;
      });

      return { ...prod, variants: updatedVariants };
    });

    if (targetProduct && targetVariant) {
      const prev = targetVariant.stock;
      const next = Math.max(0, prev + quantityChange);

      // Async sync with live backend
      fetch('/api/v1/admin/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          changeType: quantityChange > 0 ? 'STOCK_RECEIVED' : 'STOCK_ADJUSTMENT',
          quantity: Math.abs(quantityChange),
          reason,
        }),
      }).catch(() => null);

      const historyEntry: InventoryHistory = {
        id: `inv-hist-${Date.now()}`,
        variantId,
        productId: targetProduct.id,
        productName: targetProduct.name,
        variantTitle: targetVariant.title,
        sku: targetVariant.sku,
        changeType: quantityChange > 0 ? 'STOCK_RECEIVED' : 'STOCK_ADJUSTMENT',
        quantityChange,
        previousStock: prev,
        newStock: next,
        reason,
        updatedBy,
        createdAt: new Date().toISOString(),
      };

      saveProducts(newProducts);
      saveInventoryHistory([historyEntry, ...inventoryHistory]);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const statusLabels: Record<OrderStatus, string> = {
      ORDER_PLACED: 'Order Placed',
      ORDER_CONFIRMED: 'Order Confirmed',
      BEING_PREPARED: 'Being Prepared',
      READY_FOR_DELIVERY: 'Ready for Delivery',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    };

    const newOrders = orders.map((ord) => {
      if (ord.id !== orderId) return ord;

      const newTimestamp = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ', Today';

      // Mark the matching status as completed and update note
      let matched = false;
      const updatedHistory = ord.statusHistory.map((item) => {
        if (item.status === status) {
          matched = true;
          return {
            ...item,
            completed: true,
            timestamp: newTimestamp,
            note: note || item.note,
          };
        }
        return item;
      });

      if (!matched) {
        updatedHistory.push({
          status,
          label: statusLabels[status],
          timestamp: newTimestamp,
          note,
          completed: true,
        });
      }

      return {
        ...ord,
        orderStatus: status,
        statusHistory: updatedHistory,
        updatedAt: new Date().toISOString(),
      };
    });

    saveOrders(newOrders);

    // Async sync with live backend
    const statusMap: Record<OrderStatus, string> = {
      ORDER_PLACED: 'PLACED',
      ORDER_CONFIRMED: 'CONFIRMED',
      BEING_PREPARED: 'PREPARING',
      READY_FOR_DELIVERY: 'READY_FOR_PICKUP',
      OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      DELIVERED: 'DELIVERED',
      CANCELLED: 'CANCELLED',
      REFUNDED: 'REFUNDED',
    };
    const backendStatus = statusMap[status];
    if (backendStatus) {
      fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus, note }),
      }).catch(() => null);
    }
  };

  const assignDeliveryStaff = (orderId: string, staffId: string, staffName: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            deliveryStaffId: staffId,
            deliveryStaffName: staffName,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    saveOrders(updated);
  };

  const createOrder = (newOrder: Order) => {
    // 1. Deduct stock for each variant purchased
    let currentProds = [...products];
    const newHistoryEntries: InventoryHistory[] = [];

    newOrder.items.forEach((item) => {
      currentProds = currentProds.map((prod) => {
        if (prod.id !== item.productId) return prod;
        const updatedVariants = prod.variants.map((v) => {
          if (v.id === item.variantId) {
            const prev = v.stock;
            const next = Math.max(0, prev - item.quantity);

            newHistoryEntries.push({
              id: `inv-${Date.now()}-${item.variantId}`,
              variantId: item.variantId,
              productId: prod.id,
              productName: prod.name,
              variantTitle: v.title,
              sku: v.sku,
              changeType: 'ORDER_RESERVED',
              quantityChange: -item.quantity,
              previousStock: prev,
              newStock: next,
              reason: `Customer Order #${newOrder.orderNumber}`,
              updatedBy: 'System Auto-Order',
              createdAt: new Date().toISOString(),
            });

            return {
              ...v,
              stock: next,
              reservedStock: v.reservedStock + item.quantity,
            };
          }
          return v;
        });
        return { ...prod, variants: updatedVariants };
      });
    });

    saveProducts(currentProds);
    if (newHistoryEntries.length > 0) {
      saveInventoryHistory([...newHistoryEntries, ...inventoryHistory]);
    }

    // 2. Add to orders
    saveOrders([newOrder, ...orders]);
  };

  const addPromotion = (promo: Omit<Promotion, 'id' | 'usageCount'>) => {
    const newPromo: Promotion = {
      ...promo,
      id: `promo-${Date.now()}`,
      usageCount: 0,
    };
    savePromotions([newPromo, ...promotions]);
  };

  const togglePromotionStatus = (id: string) => {
    const updated = promotions.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
    savePromotions(updated);
  };

  const creditCustomerWallet = (
    customerId: string,
    amount: number,
    reason: string,
    notes?: string,
    adminBy?: string
  ) => {
    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id !== customerId) return cust;
        const newBalance = cust.walletBalance + amount;
        const newTx: WalletTransaction = {
          id: `wtx-${Date.now()}`,
          customerId: cust.id,
          type: 'CREDIT',
          amount,
          reason,
          notes,
          adminBy: adminBy || 'Vikram Mehta (Super Admin)',
          createdAt: new Date().toISOString(),
          balanceAfter: newBalance,
        };
        return {
          ...cust,
          walletBalance: newBalance,
          walletHistory: [newTx, ...(cust.walletHistory || [])],
        };
      });
      try {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const debitCustomerWallet = (
    customerId: string,
    amount: number,
    reason: string,
    notes?: string,
    adminBy?: string
  ) => {
    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id !== customerId) return cust;
        const newBalance = Math.max(0, cust.walletBalance - amount);
        const newTx: WalletTransaction = {
          id: `wtx-${Date.now()}`,
          customerId: cust.id,
          type: 'DEBIT',
          amount,
          reason,
          notes,
          adminBy: adminBy || 'Vikram Mehta (Super Admin)',
          createdAt: new Date().toISOString(),
          balanceAfter: newBalance,
        };
        return {
          ...cust,
          walletBalance: newBalance,
          walletHistory: [newTx, ...(cust.walletHistory || [])],
        };
      });
      try {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateCustomerStatus = (customerId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setCustomers((prev) => {
      const updated = prev.map((cust) =>
        cust.id === customerId ? { ...cust, status } : cust
      );
      try {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const getCustomerById = (id: string) => customers.find((c) => c.id === id);

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        inventoryHistory,
        promotions,
        deliverySlots,
        storeSettings,
        customers,
        updateProduct,
        addProduct,
        adjustStock,
        updateOrderStatus,
        assignDeliveryStaff,
        createOrder,
        updateStoreSettings,
        addPromotion,
        togglePromotionStatus,
        creditCustomerWallet,
        debitCustomerWallet,
        updateCustomerStatus,
        getCustomerById,
        getProductById,
        getProductBySlug,
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
