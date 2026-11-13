import { PaymentMethod, PaymentStatus, RefundStatus } from '@prisma/client';
import { ValidationError } from '@/lib/errors';

export interface RefundAllocationRecord {
  id?: string;
  paymentId: string;
  amount: number; // in integer paise
  status: RefundStatus | string;
}

export interface PaymentAllocationRecord {
  id?: string;
  orderId?: string;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus | string;
  amount: number; // in integer paise
  refunds?: RefundAllocationRecord[];
}

export interface CalculationResult {
  payableOrderAmountPaise: number;
  grossNonCodAllocationsPaise: number;
  totalRefundedPaise: number;
  validNonCodAllocationsPaise: number; // Net applied non-COD payment
  expectedCodPaise: number;
  isFullyPrepaid: boolean;
  appliedPayments: PaymentAllocationRecord[];
}

/**
 * Calculates the net active non-COD payment allocations and outstanding COD obligation
 * in strict integer paise.
 * 
 * Invariants (Batch 10 COND-9.9-01):
 * 1. Qualifying non-COD payments: paymentMethod !== 'COD' AND paymentStatus === 'PAID'.
 * 2. Net applied payment per record = gross amount - successfully PROCESSED refunds.
 *    (Pending or failed refunds do not reduce the applied payment).
 * 3. If a payment is fully refunded (status === 'REFUNDED' or netApplied <= 0), it contributes 0.
 * 4. Expected COD = max(0, payableOrderAmount - sum(netAppliedNonCod)).
 * 5. Over-allocation (sum(netAppliedNonCod) > payableOrderAmount):
 *    - In order creation mode: throws ValidationError.
 *    - In backfill mode: returns isOverAllocated: true.
 * 6. Zero-cash (expectedCodPaise === 0): Flagged as isFullyPrepaid = true.
 */
export function calculateNetCodObligation(
  payableOrderAmountPaise: number,
  payments: PaymentAllocationRecord[],
  options: { throwOnOverAllocation?: boolean } = { throwOnOverAllocation: true }
): CalculationResult & { isOverAllocated: boolean } {
  if (payableOrderAmountPaise < 0) {
    throw new ValidationError('Order payable amount cannot be negative');
  }

  const seenPaymentIds = new Set<string>();
  const appliedPayments: PaymentAllocationRecord[] = [];
  let grossNonCodAllocationsPaise = 0;
  let totalRefundedPaise = 0;
  let validNonCodAllocationsPaise = 0;

  for (const payment of payments) {
    if (payment.amount < 0) {
      throw new ValidationError('Payment allocation amount cannot be negative');
    }

    // Deduplication guard
    if (payment.id) {
      if (seenPaymentIds.has(payment.id)) {
        continue;
      }
      seenPaymentIds.add(payment.id);
    }

    const isNonCod = payment.paymentMethod !== PaymentMethod.COD && payment.paymentMethod !== 'COD';
    const isPaid = payment.paymentStatus === PaymentStatus.PAID || payment.paymentStatus === 'PAID';

    if (isNonCod && isPaid) {
      // Calculate processed refunds against this payment
      const processedRefundsPaise = (payment.refunds || [])
        .filter((r) => r.status === RefundStatus.PROCESSED || r.status === 'PROCESSED')
        .reduce((sum, r) => sum + r.amount, 0);

      const netAppliedPaymentPaise = Math.max(0, payment.amount - processedRefundsPaise);

      if (netAppliedPaymentPaise > 0) {
        grossNonCodAllocationsPaise += payment.amount;
        totalRefundedPaise += processedRefundsPaise;
        validNonCodAllocationsPaise += netAppliedPaymentPaise;
        appliedPayments.push(payment);
      }
    }
  }

  // Check for over-allocation
  const isOverAllocated = validNonCodAllocationsPaise > payableOrderAmountPaise;
  if (isOverAllocated && options.throwOnOverAllocation) {
    throw new ValidationError(
      `Financial integrity violation: Net applied non-COD payment allocations (₹${Math.round(
        validNonCodAllocationsPaise / 100
      )}) exceed order payable amount (₹${Math.round(payableOrderAmountPaise / 100)})`
    );
  }

  const expectedCodPaise = Math.max(0, payableOrderAmountPaise - validNonCodAllocationsPaise);
  const isFullyPrepaid = validNonCodAllocationsPaise >= payableOrderAmountPaise;

  return {
    payableOrderAmountPaise,
    grossNonCodAllocationsPaise,
    totalRefundedPaise,
    validNonCodAllocationsPaise,
    expectedCodPaise,
    isFullyPrepaid,
    isOverAllocated,
    appliedPayments,
  };
}
