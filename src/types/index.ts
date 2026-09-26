export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  itemCount?: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  image?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  discount: number;
  weight: string;
  unit: string;
  stock: number;
  lowStockThreshold: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  slug: string;
  sku: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  description: string;
  shortDescription?: string;
  image: string;
  images: string[];
  variants: ProductVariant[];
  badge?: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  featured?: boolean;
  bestseller?: boolean;
  tags?: string[];
  unit: string;
  price: number;
  mrp: number;
  discount: number;
  weight: string;
  details?: {
    countryOfOrigin?: string;
    shelfLife?: string;
    storageInstructions?: string;
    manufacturer?: string;
    nutritionFacts?: Record<string, string>;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  label: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  day: 'Today' | 'Tomorrow' | string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  isAvailable: boolean;
  fee: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  weight: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  subtotal: number;
}

export type OrderStatus = 'Order Placed' | 'Confirmed' | 'Packing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  address: Address;
  deliverySlot: DeliverySlot;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  bgColor?: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  minOrderValue: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  serviceablePincodes: string[];
  sameDayDeliveryEnabled: boolean;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
}
