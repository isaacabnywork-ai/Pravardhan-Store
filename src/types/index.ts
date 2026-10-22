export type Role =
  | 'CUSTOMER'
  | 'PRODUCT_MANAGER'
  | 'STORE_MANAGER'
  | 'ORDER_MANAGER'
  | 'DELIVERY_STAFF'
  | 'SUPER_ADMIN';

export interface Address {
  id: string;
  userId: string;
  label: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  addresses: Address[];
  createdAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  description: string;
  subcategories: Subcategory[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  unit: string; // e.g. "1 KG", "500g", "Pack of 2"
  mrp: number;
  price: number;
  stock: number; // available to sell
  reservedStock: number;
  image?: string;
}

export type ProductStatus = 'PUBLISHED' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  features?: string[];
  images: string[];
  variants: ProductVariant[];
  isFeatured?: boolean;
  isPopular?: boolean;
  isOrganic?: boolean;
  rating: number;
  reviewCount: number;
  status: ProductStatus;
}

export type InventoryChangeType =
  | 'STOCK_RECEIVED'
  | 'STOCK_ADJUSTMENT'
  | 'ORDER_RESERVED'
  | 'ORDER_CANCELLED'
  | 'ORDER_COMPLETED'
  | 'MANUAL_CORRECTION';

export interface InventoryHistory {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantTitle: string;
  sku: string;
  changeType: InventoryChangeType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  updatedBy: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  brand: string;
  unit: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface DeliverySlot {
  id: string;
  dateType: 'TODAY' | 'TOMORROW' | 'DAY_AFTER';
  dateLabel: string;
  dateString: string;
  timeSlot: string;
  isAvailable: boolean;
  capacity: number;
  bookedCount: number;
}

export type PaymentMethod = 'UPI' | 'CARD' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'BEING_PREPARED'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
  completed: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  brand: string;
  unit: string;
  purchasedPrice: number; // Historical price preserved
  purchasedMrp: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  deliverySlot: DeliverySlot;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount: number;
  deliveryCharge: number;
  deliveryTip?: number;
  handlingFee?: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validTill: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  serviceArea: string;
  city: string;
  minimumOrderValue: number;
  defaultDeliveryCharge: number;
  freeDeliveryThreshold: number;
  operatingHours: string;
  supportPhone: string;
  supportEmail: string;
  currency: string;
}
