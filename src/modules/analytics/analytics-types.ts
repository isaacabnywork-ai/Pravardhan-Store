export type Role =
  | 'CUSTOMER'
  | 'PRODUCT_MANAGER'
  | 'STORE_MANAGER'
  | 'ORDER_MANAGER'
  | 'DELIVERY_STAFF'
  | 'SUPER_ADMIN'
  | 'FINANCE'
  | 'INVENTORY_MANAGER'
  | 'WAREHOUSE_STAFF';

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
  days?: number;
}

export interface ScopedFilter extends DateRangeFilter {
  storeId?: string;
}

export interface PaginationFilter {
  page: number;
  pageSize: number;
}

export type Granularity = 'hour' | 'day' | 'week' | 'month';

// --- Sales & Financial Types ---
export interface SalesReportSummary {
  periodDays: number;
  startDate: string;
  endDate: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  // All monetary fields internally represented in integer paise
  grossMerchandiseValuePaise: number; // GMV: completed + confirmed + out-for-delivery merchandise
  netSalesPaise: number;              // Net Sales = GMV - discounts - refunds
  completedRevenuePaise: number;      // Actual collected & completed revenue (paise)
  totalDiscountsPaise: number;        // Coupon + item discounts
  deliveryChargesCollectedPaise: number;
  deliveryTipsCollectedPaise: number;
  handlingFeesCollectedPaise: number;
  averageOrderValuePaise: number;
  // User-facing formatted currency strings
  formattedGmv: string;
  formattedNetSales: string;
  formattedCompletedRevenue: string;
  formattedTotalDiscounts: string;
  formattedAov: string;
}

export interface PaymentReconciliationReport {
  period: { startDate: string; endDate: string };
  razorpay: {
    capturedCount: number;
    capturedAmountPaise: number;
    refundedCount: number;
    refundedAmountPaise: number;
    netCollectedPaise: number;
  };
  cod: {
    deliveredCollectedCount: number;
    deliveredCollectedPaise: number;
    pendingDeliveryCount: number;
    pendingDeliveryPaise: number; // Invariant: Pending COD is NOT collected cash
    unverifiedLegacyCount?: number;
    unverifiedLegacyPaise?: number; // Invariant: Delivered COD without persisted CashCollection is unverified
  };
  wallet: {
    fundedTransactionsCount: number;
    fundedAmountPaise: number;
    refundsReversedPaise: number;
    unearnedLiabilitiesPaise: number; // Invariant: Wallet balances are liabilities, not merchandise sales
  };
  loyalty: {
    pointsRedeemedTotal: number;
    monetaryValuePaise: 0; // Invariant: Loyalty points are non-monetary
  };
  reconciliation: {
    totalExpectedPaise: number;
    totalCollectedPaise: number;
    totalRefundedPaise: number;
    netReconciledPaise: number;
    unreconciledDifferencePaise: number;
    isFullyReconciled: boolean;
  };
}

// --- Inventory & WAC Types ---
export interface InventoryValuationItem {
  variantId: string;
  sku: string;
  productName: string;
  unit: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // available = physical - reserved
  retailPricePaise: number;
  wacUnitCostPaise: number;  // Weighted Average Cost per unit in paise
  totalRetailValuationPaise: number;
  totalProcurementValuationPaise: number; // Based on WAC
  isLegacyUnreconciledCost: boolean;
}

export interface InventoryValuationReport {
  totalSkus: number;
  totalPhysicalUnits: number;
  totalReservedUnits: number;
  totalAvailableUnits: number;
  totalRetailValuationPaise: number;
  totalProcurementValuationPaise: number;
  formattedRetailValuation: string;
  formattedProcurementValuation: string;
  items: InventoryValuationItem[];
}

// --- Delivery & Logistics Types ---
export interface RiderEfficiencyStat {
  riderId: string;
  riderName: string;
  phone: string;
  isActive: boolean;
  totalAssignments: number;
  deliveredCount: number;
  failedCount: number;
  activeCount: number;
  cancelledCount: number;
  onTimeDeliveries: number;
  onTimeRatePercent: number | null; // Based on explicit 30 min SLA or null if not configured
  averageDeliveryDurationMinutes: number | null;
  riderEarningsPaise: number | 'NOT_CONFIGURED';
}

// --- Customer & CRM Types ---
export interface CustomerCrmReport {
  periodDays: number;
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  repeatPurchaseRatePercent: number;
  averageCustomerLifetimeValuePaise: number;
  formattedAverageClv: string;
  cohorts: Array<{
    cohortMonth: string;
    newUsers: number;
    activeInPeriod: number;
    retentionRatePercent: number;
  }>;
}

// --- Executive Dashboard Types ---
export interface ExecutiveDashboardMetrics {
  timestamp: string;
  storeId?: string;
  todaySales: {
    gmvPaise: number;
    netSalesPaise: number;
    completedRevenuePaise: number;
    ordersCount: number;
  };
  inventoryHealth: {
    totalSkus: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyCount: number;
  };
  fulfillment: {
    activeDeliveries: number;
    completedToday: number;
    averageTurnaroundMinutes: number | null;
  };
}
