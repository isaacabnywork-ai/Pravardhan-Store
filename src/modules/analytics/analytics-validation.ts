import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  storeId: z.string().cuid().optional().or(z.string().min(1).optional()),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  format: z.enum(['json', 'csv', 'xlsx']).optional().default('json'),
});

export type ValidatedAnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

/**
 * Parses and computes strict UTC date boundaries [startDate, endDate)
 */
export function resolveDateRange(query: ValidatedAnalyticsQuery): { start: Date; end: Date; days: number } {
  const end = query.endDate ? new Date(query.endDate) : new Date();
  // Ensure end includes entire end day if YYYY-MM-DD
  if (query.endDate && query.endDate.length === 10) {
    end.setHours(23, 59, 59, 999);
  }

  let start: Date;
  let days: number;

  if (query.startDate) {
    start = new Date(query.startDate);
    if (query.startDate.length === 10) {
      start.setHours(0, 0, 0, 0);
    }
    const diffMs = end.getTime() - start.getTime();
    days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } else {
    days = query.days || 30;
    start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end, days };
}
