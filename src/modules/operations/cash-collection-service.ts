import { prisma } from '@/lib/prisma';
import { CashCollectionStatus, SettlementStatus } from '@prisma/client';
import { ValidationError, NotFoundError } from '@/lib/errors';

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
   * Records or updates physical cash collected by a delivery rider at customer doorstep
   * Invariants:
   * 1. Delivered status never automatically implies cash was collected.
   * 2. Expected COD and actual collected cash must remain distinct.
   * 3. Discrepancies (short / excess) must be recorded explicitly.
   */
  async recordCollection(params: RecordCashCollectionParams) {
    const { orderId, riderId, storeId, expectedAmountPaise, collectedAmountPaise, notes } = params;

    if (collectedAmountPaise < 0) {
      throw new ValidationError('Collected amount cannot be negative');
    }

    let status: CashCollectionStatus = CashCollectionStatus.COLLECTED;
    if (collectedAmountPaise === 0 && expectedAmountPaise > 0) {
      status = CashCollectionStatus.FAILED;
    } else if (collectedAmountPaise < expectedAmountPaise) {
      status = CashCollectionStatus.SHORT_COLLECTED;
    } else if (collectedAmountPaise > expectedAmountPaise) {
      status = CashCollectionStatus.EXCESS_COLLECTED;
    }

    const existing = await prisma.cashCollection.findFirst({
      where: { orderId },
    });

    if (existing) {
      return prisma.cashCollection.update({
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

    return prisma.cashCollection.create({
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
  }

  /**
   * Settles physical cash collected by rider upon handover to store cash manager
   */
  async settleCollection(collectionId: string, staffId: string, notes?: string) {
    const collection = await prisma.cashCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundError('Cash collection record');
    }

    const isDiscrepancy =
      collection.collectionStatus === CashCollectionStatus.SHORT_COLLECTED ||
      collection.collectionStatus === CashCollectionStatus.EXCESS_COLLECTED ||
      collection.collectionStatus === CashCollectionStatus.FAILED;

    return prisma.cashCollection.update({
      where: { id: collectionId },
      data: {
        settlementStatus: isDiscrepancy ? SettlementStatus.DISCREPANCY : SettlementStatus.SETTLED,
        settledAt: new Date(),
        handoverToStaffId: staffId,
        notes: notes ? `${collection.notes ? collection.notes + ' | ' : ''}${notes}` : collection.notes,
      },
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
