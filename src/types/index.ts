export type AppMode = 'customer' | 'admin' | 'delivery';

export type CustomerPage = 
  | 'home'
  | 'categories'
  | 'category'
  | 'product'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'order-tracking'
  | 'orders'
  | 'wishlist'
  | 'offers'
  | 'account';

export type AdminPage =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'promotions'
  | 'customers'
  | 'settings';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ProductVariant {
  id: string;
  weight: string;
  price: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  sku: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  description: string;
  images: string[];
  rating: number;
  ratingCount: number;
  isVeg: boolean;
  tags?: string[];
  variants: ProductVariant[];
  storageInfo?: string;
  shelfLife?: string;
  origin?: string;
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  featured?: boolean;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  subCategories: string[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  type: 'home' | 'work' | 'other';
  houseNo: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  badge?: 'Fast' | 'Standard' | 'Eco';
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validUntil: string;
  category?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  address: Address;
  deliverySlot: DeliverySlot;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CASH_ON_DELIVERY';
  subtotal: number;
  savings: number;
  couponDiscount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  estimatedDelivery: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicleNo: string;
  };
  timeline: {
    status: OrderStatus;
    label: string;
    time: string;
    completed: boolean;
    current: boolean;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  joinedDate: string;
}
