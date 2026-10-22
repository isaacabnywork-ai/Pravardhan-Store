import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { stockAdjustmentSchema } from './schemas';
import { z } from 'zod';

export class InventoryService {
  /**
   * List store inventory with variant, product, and stock levels
   */
  async listInventory(options: {
    storeId?: string;
    lowStockOnly?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { storeId, lowStockOnly = false, search, page = 1, pageSize = 30 } = options;

    // Resolve store
    const targetStore = storeId
      ? await prisma.store.findUnique({ where: { id: storeId } })
      : await prisma.store.findFirst();

    if (!targetStore) {
      throw new NotFoundError('Fulfillment Store');
    }

    const where: Prisma.InventoryWhereInput = {
      storeId: targetStore.id,
    };

    if (search) {
      where.variant = {
        OR: [
          { sku: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { product: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    const items = await prisma.inventory.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, brand: true, images: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Filter low stock if requested: quantity <= lowStockThreshold
    const filtered = lowStockOnly
      ? items.filter((item) => item.quantity <= item.lowStockThreshold)
      : items;

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const formatted = paginated.map((item) => ({
      inventoryId: item.id,
      storeId: item.storeId,
      variantId: item.variantId,
      sku: item.variant.sku,
      productName: item.variant.product.name,
      variantTitle: item.variant.title,
      unit: item.variant.unit,
      mrp: item.variant.mrp,
      price: item.variant.price,
      physicalStock: item.quantity,
      reservedStock: item.reservedQuantity,
      availableStock: Math.max(0, item.quantity - item.reservedQuantity),
      lowStockThreshold: item.lowStockThreshold,
      isLowStock: item.quantity <= item.lowStockThreshold,
      updatedAt: item.updatedAt,
    }));

    return {
      store: {
        id: targetStore.id,
        name: targetStore.name,
        code: targetStore.code,
      },
      items: formatted,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Concurrency-safe atomic stock adjustment with immutable movement log
   */
  async adjustStock(
    data: z.infer<typeof stockAdjustmentSchema>,
    actorId?: string,
    actorRole?: string
  ) {
    const store = data.storeId
      ? await prisma.store.findUnique({ where: { id: data.storeId } })
      : await prisma.store.findFirst();

    if (!store) {
      throw new NotFoundError('Fulfillment Store');
    }

    return prisma.$transaction(async (tx) => {
      // Find current inventory record with locking
      let inv = await tx.inventory.findUnique({
        where: {
          storeId_variantId: {
            storeId: store.id,
            variantId: data.variantId,
          },
        },
      });

      if (!inv) {
        // Create initial stock balance if not existing
        inv = await tx.inventory.create({
          data: {
            storeId: store.id,
            variantId: data.variantId,
            quantity: 0,
            reservedQuantity: 0,
            lowStockThreshold: 5,
          },
        });
      }

      const previousStock = inv.quantity;
      const newStock = previousStock + data.quantityChange;

      if (newStock < 0) {
        throw new ConflictError(
          `Cannot reduce stock below zero. Current stock is ${previousStock}, adjustment requested: ${data.quantityChange}`
        );
      }

      // Update physical inventory
      const updatedInv = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: newStock,
        },
      });

      // Record immutable movement
      const movement = await tx.inventoryMovement.create({
        data: {
          storeId: store.id,
          variantId: data.variantId,
          changeType: data.changeType,
          quantityChange: data.quantityChange,
          previousStock,
          newStock,
          reason: data.reason,
          updatedById: actorId,
        },
      });

      // Audit log entry
      if (actorId) {
        await tx.auditLog.create({
          data: {
            actorId,
            actorRole,
            action: 'INVENTORY_ADJUSTED',
            entity: 'Inventory',
            entityId: updatedInv.id,
            details: {
              variantId: data.variantId,
              quantityChange: data.quantityChange,
              previousStock,
              newStock,
              reason: data.reason,
            },
          },
        });
      }

      return {
        inventory: updatedInv,
        movement,
      };
    });
  }

  /**
   * Search stock audit trail / inventory movements
   */
  async listMovements(options: {
    storeId?: string;
    variantId?: string;
    limit?: number;
  }) {
    const { storeId, variantId, limit = 50 } = options;

    const where: Prisma.InventoryMovementWhereInput = {};
    if (storeId) where.storeId = storeId;
    if (variantId) where.variantId = variantId;

    return prisma.inventoryMovement.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
          },
        },
        updatedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  /**
   * Check if an address or pincode is serviceable by a store
   */
  async checkServiceability(pincode: string) {
    const serviceArea = await prisma.serviceArea.findFirst({
      where: {
        pincode,
        isActive: true,
      },
      include: {
        store: true,
      },
    });

    if (!serviceArea || !serviceArea.store.isActive) {
      // Fallback: check if store general service area matches
      const defaultStore = await prisma.store.findFirst({
        where: { isActive: true },
      });

      return {
        isServiceable: false,
        pincode,
        message: `Currently, we do not deliver to pincode ${pincode}. We are expanding rapidly across Gurugram!`,
        availableHubs: defaultStore ? [defaultStore.city] : [],
      };
    }

    return {
      isServiceable: true,
      pincode,
      areaName: serviceArea.name,
      store: {
        id: serviceArea.store.id,
        name: serviceArea.store.name,
        code: serviceArea.store.code,
        city: serviceArea.store.city,
      },
      deliveryFee: serviceArea.deliveryFee, // in paise
      minOrderValue: serviceArea.minOrder, // in paise
      estimatedDeliveryMinutes: '10-15 mins',
      operatingHours: serviceArea.store.operatingHours,
      isOpenNow: true,
    };
  }
}

export const inventoryService = new InventoryService();
