'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Product, Order, OrderStatus } from '@/types';
import { StoreService } from '@/services/storeService';
import { STORE_SETTINGS } from '@/data/mockData';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchOrder, setSearchOrder] = useState('');

  const [storeSettings, setStoreSettings] = useState(STORE_SETTINGS);

  useEffect(() => {
    async function loadData() {
      const prods = await StoreService.getProducts();
      setProducts(prods);

      let ords = StoreService.getOrders();
      if (ords.length === 0) {
        const sample = StoreService.createOrder({
          customerId: 'cust-1',
          customerName: 'Abhinav Sharma',
          customerPhone: '9876543210',
          items: [
            {
              id: 'oi-1',
              productId: 'prod-atta-1',
              variantId: 'var-atta-5kg',
              productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta',
              variantName: '5 kg',
              weight: '5 kg',
              price: 279,
              mrp: 310,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
              subtotal: 279,
            },
            {
              id: 'oi-2',
              productId: 'prod-fruit-guava',
              variantId: 'var-guava-400g',
              productName: 'Thai Sweet White Guava (Amrud)',
              variantName: '400 g (2 pcs)',
              weight: '400 g',
              price: 115,
              mrp: 142,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
              subtotal: 115,
            },
          ],
          address: StoreService.getAddresses()[0],
          deliverySlot: {
            id: 'slot-today-1',
            day: 'Today',
            date: 'Today, 26 Sep',
            startTime: '4:00 PM',
            endTime: '6:00 PM',
            label: 'Today (4 PM – 6 PM)',
            isAvailable: true,
            fee: 35,
          },
          subtotal: 394,
          discount: 58,
          couponDiscount: 0,
          deliveryFee: 35,
          tax: 0,
          total: 429,
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          orderStatus: 'Packing',
          estimatedDelivery: 'Today (4 PM – 6 PM)',
        });
        ords = [sample];
      }
      setOrders([...ords]);
    }
    loadData();
  }, []);

  const handleStockChange = (productId: string, variantId: string, newStock: number) => {
    StoreService.updateStock(productId, variantId, Math.max(0, newStock));
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.map((v) =>
              v.id === variantId ? { ...v, stock: Math.max(0, newStock) } : v
            ),
          };
        }
        return p;
      })
    );
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    StoreService.updateOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
  const lowStockCount = products.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= (v.lowStockThreshold || 5))).length;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(searchOrder.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchOrder.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Admin Navigation Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to Customer Store"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Store Partner Admin
              </span>
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                Pravdhan Store Operations
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-bold px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm active:scale-95"
            >
              View Storefront
            </Link>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Catalog & Stock ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Orders & Delivery ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Store Settings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Paid orders
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Dispatch
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1 tracking-tight">
              {pendingOrders}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Active orders
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Low Stock Items
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1 tracking-tight">
              {lowStockCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Needs restock
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active SKUs
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {products.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              In catalog
            </span>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recent Orders List */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Recent Incoming Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Manage All &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        #{ord.orderNumber} • {ord.customerName}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Slot: {ord.deliverySlot?.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">₹{ord.total}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Fast Inventory Alert */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock Alerts
              </h3>
              <div className="divide-y divide-slate-100">
                {products
                  .filter((p) => p.variants.some((v) => v.stock <= (v.lowStockThreshold || 5)))
                  .slice(0, 6)
                  .map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                          <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                            {p.name}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {p.variants[0]?.weight}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-600 block">
                          {p.variants[0]?.stock} left
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab('products');
                            setSearchProduct(p.name);
                          }}
                          className="text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          Adjust
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products & Inventory Management */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Product Inventory & Stock Adjuster
                </h3>
                <p className="text-xs text-slate-500">
                  Update inventory counts in real time
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Variant</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Quick Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const variant = p.variants[0];
                    const isLow = variant?.stock <= (variant?.lowStockThreshold || 5);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                              <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                            </div>
                            <span className="font-bold text-slate-900 truncate max-w-xs">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">{p.categoryName}</td>
                        <td className="p-3 text-slate-800 font-medium">{variant?.weight}</td>
                        <td className="p-3 font-bold text-slate-900">₹{variant?.price}</td>
                        <td className="p-3">
                          <span
                            className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                              isLow ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                          >
                            {variant?.stock} units
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleStockChange(p.id, variant.id, variant.stock - 1)
                              }
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors"
                            >
                              -1
                            </button>
                            <button
                              onClick={() =>
                                handleStockChange(p.id, variant.id, variant.stock + 5)
                              }
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors border border-emerald-100"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Order Management */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Order Dispatch Workflow
                </h3>
                <p className="text-xs text-slate-500">
                  Update order status milestones in real time
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order ID or name..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3.5 hover:border-emerald-200 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-xs text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-xs text-slate-600">
                        • {ord.customerName} ({ord.customerPhone})
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        {ord.paymentMethod}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Slot: <b className="text-slate-800">{ord.deliverySlot?.label}</b> • {ord.address?.area}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-black text-slate-900 mr-2">
                      ₹{ord.total}
                    </span>

                    <select
                      value={ord.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as OrderStatus)
                      }
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packing">Packing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <Link
                      href={`/orders/${ord.id}`}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors shadow-xs"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-xl shadow-xs">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1">
              Store & Delivery Settings
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure delivery fees, minimum cart value, and thresholds
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Store rules updated!');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-800 block mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, storeName: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.minOrderValue}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, minOrderValue: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Standard Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.deliveryCharge}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, deliveryCharge: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.freeDeliveryThreshold}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, freeDeliveryThreshold: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98]"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
