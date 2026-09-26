import {
  Category,
  Product,
  Banner,
  DeliverySlot,
  Address,
  Coupon,
  CartItem,
  Order,
  StoreSettings
} from '@/types';
import {
  CATEGORIES,
  PRODUCTS,
  BANNERS,
  DELIVERY_SLOTS,
  INITIAL_ADDRESSES,
  COUPONS,
  STORE_SETTINGS
} from '@/data/mockData';

export class StoreService {
  // Static state for client-side persistence in mock mode
  private static addresses: Address[] = [...INITIAL_ADDRESSES];
  private static orders: Order[] = [];
  private static products: Product[] = [...PRODUCTS];

  static async getCategories(): Promise<Category[]> {
    return CATEGORIES;
  }

  static async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return CATEGORIES.find((c) => c.slug === slug);
  }

  static async getBanners(): Promise<Banner[]> {
    return BANNERS;
  }

  static async getProducts(options?: {
    categorySlug?: string;
    subcategoryId?: string;
    featured?: boolean;
    bestseller?: boolean;
    search?: string;
  }): Promise<Product[]> {
    let list = [...this.products];

    if (options?.categorySlug) {
      const cat = CATEGORIES.find(c => c.slug === options.categorySlug);
      if (cat) {
        list = list.filter(p => p.categoryId === cat.id);
      }
    }

    if (options?.subcategoryId) {
      list = list.filter(p => p.subcategoryId === options.subcategoryId);
    }

    if (options?.featured) {
      list = list.filter(p => p.featured);
    }

    if (options?.bestseller) {
      list = list.filter(p => p.bestseller);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static async getProductBySlug(slug: string): Promise<Product | undefined> {
    return this.products.find(p => p.slug === slug);
  }

  static async getRelatedProducts(productId: string, categoryId: string): Promise<Product[]> {
    return this.products.filter(p => p.categoryId === categoryId && p.id !== productId).slice(0, 6);
  }

  static async getDeliverySlots(): Promise<DeliverySlot[]> {
    return DELIVERY_SLOTS;
  }

  static async getStoreSettings(): Promise<StoreSettings> {
    return STORE_SETTINGS;
  }

  static async getCoupons(): Promise<Coupon[]> {
    return COUPONS;
  }

  static validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupon = COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Min order value for ${coupon.code} is ₹${coupon.minOrderValue}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    } else {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied: Saved ₹${discount}!`,
      coupon,
    };
  }

  static calculateBill(items: CartItem[], appliedCoupon?: Coupon | null) {
    const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
    const mrpTotal = items.reduce((sum, item) => sum + item.variant.mrp * item.quantity, 0);
    const productDiscount = mrpTotal - subtotal;

    let couponDiscount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'fixed') {
        couponDiscount = appliedCoupon.discountValue;
      } else {
        couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
          couponDiscount = appliedCoupon.maxDiscount;
        }
      }
    }

    // Delivery fee logic
    const freeDelivery = subtotal >= STORE_SETTINGS.freeDeliveryThreshold;
    const deliveryFee = subtotal === 0 ? 0 : freeDelivery ? 0 : STORE_SETTINGS.deliveryCharge;
    const amountNeededForFreeDelivery = Math.max(0, STORE_SETTINGS.freeDeliveryThreshold - subtotal);

    // Small handling/tax charges (GST included in MRP as per Indian law, nominal handling if any)
    const tax = 0; // inclusive in MRP

    const total = Math.max(0, subtotal - couponDiscount + deliveryFee + tax);

    return {
      subtotal,
      mrpTotal,
      productDiscount,
      couponDiscount,
      deliveryFee,
      freeDelivery,
      amountNeededForFreeDelivery,
      tax,
      total,
    };
  }

  static getAddresses(): Address[] {
    return this.addresses;
  }

  static addAddress(address: Omit<Address, 'id'>): Address {
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    if (newAddr.isDefault) {
      this.addresses.forEach(a => a.isDefault = false);
    }
    this.addresses.unshift(newAddr);
    return newAddr;
  }

  static setDefaultAddress(id: string): void {
    this.addresses.forEach(a => {
      a.isDefault = a.id === id;
    });
  }

  static getOrders(): Order[] {
    return this.orders;
  }

  static getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id || o.orderNumber === id);
  }

  static createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const orderNumber = `AK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    // Deduct mock stock
    orderData.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant && variant.stock >= item.quantity) {
          variant.stock -= item.quantity;
        }
      }
    });

    this.orders.unshift(newOrder);
    return newOrder;
  }

  static updateOrderStatus(orderId: string, status: Order['orderStatus']): Order | undefined {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.orderStatus = status;
    }
    return order;
  }

  // Admin inventory updates
  static updateStock(productId: string, variantId: string, newStock: number): void {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const variant = prod.variants.find(v => v.id === variantId);
      if (variant) {
        variant.stock = newStock;
      }
    }
  }

  static updatePrice(productId: string, variantId: string, price: number, mrp: number): void {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const variant = prod.variants.find(v => v.id === variantId);
      if (variant) {
        variant.price = price;
        variant.mrp = mrp;
        variant.discount = Math.round(((mrp - price) / mrp) * 100);
      }
      if (variant && prod.variants[0]?.id === variantId) {
        prod.price = price;
        prod.mrp = mrp;
        prod.discount = variant.discount;
      }
    }
  }
}
