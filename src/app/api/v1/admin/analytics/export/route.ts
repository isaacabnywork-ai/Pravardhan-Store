import { NextRequest } from 'next/server';
import { reportExportService } from '@/modules/analytics/report-export-service';
import { salesAnalyticsService } from '@/modules/analytics/sales-analytics-service';
import { analyticsQuerySchema } from '@/modules/analytics/analytics-validation';
import { requireRole, validateStoreScope } from '@/modules/auth/permissions';
import { apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['SUPER_ADMIN', 'STORE_MANAGER']);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = analyticsQuerySchema.parse(searchParams);

    if (query.storeId) {
      validateStoreScope(session, query.storeId);
    }

    const report = await salesAnalyticsService.getSalesReport(query);
    const exportData = [
      {
        Metric: 'Gross Merchandise Value (GMV)',
        Value: report.formattedGmv,
        Paise: report.grossMerchandiseValuePaise,
      },
      {
        Metric: 'Net Sales',
        Value: report.formattedNetSales,
        Paise: report.netSalesPaise,
      },
      {
        Metric: 'Completed Revenue',
        Value: report.formattedCompletedRevenue,
        Paise: report.completedRevenuePaise,
      },
      {
        Metric: 'Total Discounts',
        Value: report.formattedTotalDiscounts,
        Paise: report.totalDiscountsPaise,
      },
      {
        Metric: 'Average Order Value (AOV)',
        Value: report.formattedAov,
        Paise: report.averageOrderValuePaise,
      },
      {
        Metric: 'Total Completed Orders',
        Value: report.completedOrders,
        Paise: '',
      },
    ];

    const csvContent = reportExportService.generateCsv(exportData);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pravdhan-sales-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
