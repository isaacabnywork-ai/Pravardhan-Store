import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { ValidationError } from '@/lib/errors';

export interface PaymentAllocationRecord {
  id?: string;
  orderId?: string;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus | string;
  amount: number; // in integer paise
}

export interface CalculationResult {
  payableOrderAmountPaise: number;
  validNonCodAllocationsPaise: number;
  expectedCodPaise: number;
  isFullyPrepaid: boolean;
  appliedPayments: PaymentAllocationRecord[];
}

/**
 * Calculates the valid active non-COD payment allocations and net COD obligation
 * in strict integer paise.
 * 
 * Invariants (Batch 9.8):
 * 1. Only paymentMethod !== 'COD' AND paymentStatus === 'PAID' reduce COD obligation.
 * 2. PENDING, FAILED, and REFUNDED payments are excluded from deduction.
 * 3. Over-allocation (nonCodAllocations > payableTotal) is never silently clamped to 0:
 *    - In order creation mode: throws ValidationError.
 *    - In backfill mode (throwOnOverAllocation = false): returns isOverAllocated: true.
 * 4. Zero-cash (expectedCodPaise === 0): Flagged as isFullyPrepaid = true.
 */
export function calculateNetCodObligation(
  payableOrderAmountPaise: number,
  payments: PaymentAllocationRecord[],
  options: { throwOnOverAllocation?: boolean } = { throwOnOverAllocation: true }
): CalculationResult & { isOverAllocated: boolean } {
  if (payableOrderAmountPaise < 0) {
    throw new ValidationError('Order payable amount cannot be negative');
  }

  // Deduct only distinct, successfully applied active non-COD payments
  const seenPaymentIds = new Set<string>();
  const appliedPayments: PaymentAllocationRecord[] = [];
  let validNonCodAllocationsPaise = 0;

  for (const payment of payments) {
    if (payment.amount < 0) {
      throw new ValidationError('Payment allocation amount cannot be negative');
    }

    // Deduplication guard if IDs are present
    if (payment.id) {
      if (seenPaymentIds.has(payment.id)) {
        continue;
      }
      seenPaymentIds.add(payment.id);
    }

    const isNonCod = payment.paymentMethod !== PaymentMethod.COD && payment.paymentMethod !== 'COD';
    const isPaid = payment.paymentStatus === PaymentStatus.PAID || payment.paymentStatus === 'PAID';

    if (isNonCod && isPaid) {
      validNonCodAllocationsPaise += payment.amount;
      appliedPayments.push(payment);
    }
  }

  // Check for over-allocation
  const isOverAllocated = validNonCodAllocationsPaise > payableOrderAmountPaise;
  if (isOverAllocated && options.throwOnOverAllocation) {
    throw new ValidationError(
      `Financial integrity violation: Non-COD payment allocations (₹${Math.round(
        validNonCodAllocationsPaise / 100
      )}) exceed order payable amount (₹${Math.round(payableOrderAmountPaise / 100)})`
    );
  }

  const expectedCodPaise = Math.max(0, payableOrderAmountPaise - validNonCodAllocationsPaise);
  const isFullyPrepaid = validNonCodAllocationsPaise >= payableOrderAmountPaise;

  return {
    payableOrderAmountPaise,
    validNonCodAllocationsPaise,
    expectedCodPaise,
    isFullyPrepaid,
    isOverAllocated,
    appliedPayments,
  };
}
