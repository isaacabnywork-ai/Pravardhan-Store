import { prisma } from '@/lib/prisma';
import { CashCollectionStatus, SettlementStatus } from '@prisma/client';
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors';

export interface RecordCashCollectionParams {
  orderId: string;
  riderId: string;
  storeId: string;
  expectedAmountPaise: number;
  collectedAmountPaise: number;
  notes?: string;
}

export class CashCollectionService {
  /**
   * Concurrency-safe cash collection logging with atomic transaction scope
   * Invariants:
   * 1. Delivered status never automatically implies cash was collected.
   * 2. Expected COD and actual collected cash must remain distinct.
   * 3. Discrepancies (short / excess) must be recorded explicitly.
   * 4. Once settled, a record cannot be modified.
   * 5. Atomic single-attempt collection prevents race conditions.
   */
  async recordCollection(params: RecordCashCollectionParams) {
    const { orderId, riderId, storeId, expectedAmountPaise, collectedAmountPaise, notes } = params;

    if (collectedAmountPaise < 0 || expectedAmountPaise < 0) {
      throw new ValidationError('Monetary values cannot be negative');
    }

    let status: CashCollectionStatus = CashCollectionStatus.COLLECTED;
    if (collectedAmountPaise === 0 && expectedAmountPaise > 0) {
      status = CashCollectionStatus.FAILED;
    } else if (collectedAmountPaise < expectedAmountPaise) {
      status = CashCollectionStatus.SHORT_COLLECTED;
    } else if (collectedAmountPaise > expectedAmountPaise) {
      status = CashCollectionStatus.EXCESS_COLLECTED;
    }

    return prisma.$transaction(async (tx) => {
      // 1. Check existing record inside atomic transaction
      const existing = await tx.cashCollection.findUnique({
        where: { orderId },
      });

      if (existing) {
        if (existing.settlementStatus === SettlementStatus.SETTLED) {
          throw new ConflictError('Cannot alter cash collection: Order collection is already settled');
        }

        return tx.cashCollection.update({
          where: { id: existing.id },
          data: {
            riderId,
            collectedAmount: collectedAmountPaise,
            collectionStatus: status,
            collectedAt: new Date(),
            notes: notes || existing.notes,
          },
        });
      }

      // 2. Validate order exists and belongs to store
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { id: true, storeId: true, paymentMethod: true },
      });

      if (!order) {
        throw new NotFoundError('Order');
      }

      if (order.storeId !== storeId) {
        throw new ValidationError('Store ID does not match order location');
      }

      return tx.cashCollection.create({
        data: {
          orderId,
          riderId,
          storeId,
          expectedAmount: expectedAmountPaise,
          collectedAmount: collectedAmountPaise,
          collectionStatus: status,
          settlementStatus: SettlementStatus.UNSETTLED,
          collectedAt: new Date(),
          notes,
        },
      });
    });
  }

  /**
   * Settles physical cash collected by rider upon handover to store cash manager
   * Enforces that settled records cannot be settled twice.
   */
  async settleCollection(collectionId: string, staffId: string, notes?: string) {
    return prisma.$transaction(async (tx) => {
      const collection = await tx.cashCollection.findUnique({
        where: { id: collectionId },
      });

      if (!collection) {
        throw new NotFoundError('Cash collection record');
      }

      if (collection.settlementStatus === SettlementStatus.SETTLED) {
        throw new ConflictError('This collection has already been settled and closed.');
      }

      const isDiscrepancy =
        collection.collectionStatus === CashCollectionStatus.SHORT_COLLECTED ||
        collection.collectionStatus === CashCollectionStatus.EXCESS_COLLECTED ||
        collection.collectionStatus === CashCollectionStatus.FAILED;

      return tx.cashCollection.update({
        where: { id: collectionId },
        data: {
          settlementStatus: isDiscrepancy ? SettlementStatus.DISCREPANCY : SettlementStatus.SETTLED,
          settledAt: new Date(),
          handoverToStaffId: staffId,
          notes: notes ? `${collection.notes ? collection.notes + ' | ' : ''}${notes}` : collection.notes,
        },
      });
    });
  }

  /**
   * Retrieves COD reconciliation metrics for store or rider
   */
  async getReconciliation(storeId?: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const collections = await prisma.cashCollection.findMany({
      where,
      include: {
        order: {
          select: { orderNumber: true, orderStatus: true, grandTotal: true },
        },
        rider: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalExpectedPaise = 0;
    let totalCollectedPaise = 0;
    let totalSettledPaise = 0;
    let totalUnsettledPaise = 0;
    let totalShortPaise = 0;
    let totalExcessPaise = 0;

    for (const c of collections) {
      totalExpectedPaise += c.expectedAmount;
      totalCollectedPaise += c.collectedAmount;

      if (c.settlementStatus === SettlementStatus.SETTLED) {
        totalSettledPaise += c.collectedAmount;
      } else {
        totalUnsettledPaise += c.collectedAmount;
      }

      if (c.collectionStatus === CashCollectionStatus.SHORT_COLLECTED) {
        totalShortPaise += (c.expectedAmount - c.collectedAmount);
      } else if (c.collectionStatus === CashCollectionStatus.EXCESS_COLLECTED) {
        totalExcessPaise += (c.collectedAmount - c.expectedAmount);
      }
    }

    return {
      totalRecords: collections.length,
      totalExpectedPaise,
      totalCollectedPaise,
      totalSettledPaise,
      totalUnsettledPaise,
      totalShortPaise,
      totalExcessPaise,
      collections: collections.slice(0, 50),
    };
  }
}

export const cashCollectionService = new CashCollectionService();
