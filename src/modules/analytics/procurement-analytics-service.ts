import { ValidatedAnalyticsQuery } from './analytics-validation';

export interface ProcurementAnalyticsReport {
  status: 'NOT_CONFIGURED';
  message: string;
  totalPurchaseOrders: number;
  totalReceivedValuePaise: number;
  outstandingPayablesPaise: number;
}

export class ProcurementAnalyticsService {
  /**
   * Procurement & Supplier analytics service
   * Invariant: Missing supplier or procurement module reports NOT_CONFIGURED without inventing data
   */
  async getProcurementReport(_query: ValidatedAnalyticsQuery): Promise<ProcurementAnalyticsReport> {
    return {
      status: 'NOT_CONFIGURED',
      message: 'Procurement and Supplier Invoice records have not been linked or configured in this deployment.',
      totalPurchaseOrders: 0,
      totalReceivedValuePaise: 0,
      outstandingPayablesPaise: 0,
    };
  }
}

export const procurementAnalyticsService = new ProcurementAnalyticsService();
