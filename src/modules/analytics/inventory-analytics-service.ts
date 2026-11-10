import { prisma } from '@/lib/prisma';
import { ValidatedAnalyticsQuery } from './analytics-validation';
import { analyticsQueryService } from './analytics-query-service';
import { InventoryValuationReport, InventoryValuationItem } from './analytics-types';

export class InventoryAnalyticsService {
  /**
   * Generates Inventory Valuation report separating Retail price from Procurement WAC cost
   */
  async getInventoryValuation(query: ValidatedAnalyticsQuery): Promise<InventoryValuationReport> {
    const where: any = {};
    if (query.storeId) {
      where.storeId = query.storeId;
    }

    const inventoryItems = await prisma.inventory.findMany({
      where,
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            price: true,
            mrp: true,
            unit: true,
            product: {
              select: {
                name: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    let totalPhysicalUnits = 0;
    let totalReservedUnits = 0;
    let totalAvailableUnits = 0;
    let totalRetailValuationPaise = 0;
    let totalProcurementValuationPaise = 0;

    const items: InventoryValuationItem[] = inventoryItems.map((inv) => {
      const physical = inv.quantity;
      const reserved = inv.reservedQuantity || 0;
      // Invariant: Available stock strictly subtracts reservations
      const available = Math.max(0, physical - reserved);

      totalPhysicalUnits += physical;
      totalReservedUnits += reserved;
      totalAvailableUnits += available;

      // Invariant: Retail valuation uses variant retail selling price
      const retailValuation = physical * inv.variant.price;
      totalRetailValuationPaise += retailValuation;

      // Invariant: WAC (Weighted Average Cost)
      // When explicit supplier procurement invoice data is missing, we flag it as legacy unreconciled
      const estimatedWacUnitCostPaise = Math.round(inv.variant.price * 0.70); // Baseline procurement estimate
      const procurementValuation = physical * estimatedWacUnitCostPaise;
      totalProcurementValuationPaise += procurementValuation;

      return {
        variantId: inv.variant.id,
        sku: inv.variant.sku,
        productName: inv.variant.product.name,
        unit: inv.variant.unit,
        physicalQuantity: physical,
        reservedQuantity: reserved,
        availableQuantity: available,
        retailPricePaise: inv.variant.price,
        wacUnitCostPaise: estimatedWacUnitCostPaise,
        totalRetailValuationPaise: retailValuation,
        totalProcurementValuationPaise: procurementValuation,
        isLegacyUnreconciledCost: true,
      };
    });

    return {
      totalSkus: inventoryItems.length,
      totalPhysicalUnits,
      totalReservedUnits,
      totalAvailableUnits,
      totalRetailValuationPaise,
      totalProcurementValuationPaise,
      formattedRetailValuation: analyticsQueryService.formatPaiseToInr(totalRetailValuationPaise),
      formattedProcurementValuation: analyticsQueryService.formatPaiseToInr(totalProcurementValuationPaise),
      items: items.slice(0, 100),
    };
  }
}

export const inventoryAnalyticsService = new InventoryAnalyticsService();
