import { Prisma } from '@prisma/client';
import { ValidatedAnalyticsQuery, resolveDateRange } from './analytics-validation';

export class AnalyticsQueryService {
  /**
   * Builds Prisma where clause for Orders scoped by date range and storeId
   */
  buildOrderWhere(query: ValidatedAnalyticsQuery): Prisma.OrderWhereInput {
    const { start, end } = resolveDateRange(query);
    const where: Prisma.OrderWhereInput = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (query.storeId) {
      where.storeId = query.storeId;
    }

    return where;
  }

  /**
   * Formats integer paise into a standard INR string (e.g. ₹124.50)
   */
  formatPaiseToInr(paise: number): string {
    const sign = paise < 0 ? '-' : '';
    const abs = Math.abs(paise);
    const rupees = Math.floor(abs / 100);
    const cents = String(abs % 100).padStart(2, '0');
    return `${sign}₹${rupees.toLocaleString('en-IN')}.${cents}`;
  }

  /**
   * Deterministic safe division returning rounded percentage integer (or null)
   */
  safePercentage(numerator: number, denominator: number): number | null {
    if (!denominator || denominator <= 0) return null;
    return Math.round((numerator / denominator) * 100);
  }
}

export const analyticsQueryService = new AnalyticsQueryService();
