import assert from 'node:assert';
import { calculateNetCodObligation } from '../src/modules/operations/financial-reconciliation-helper.ts';

console.log('--- Running Batch 10 Auditable Refund Ledger & Financial Integrity Tests ---');

// ============================================================================
// Test 1: Full Refund Behavior
// ============================================================================
console.log('Test 1: Full Refund excludes payment from COD deduction...');
{
  const payableAmount = 150000; // ₹1,500
  // ₹1,000 payment with ₹1,000 processed refund
  const payments = [
    {
      id: 'p_full_ref',
      paymentMethod: 'WALLET',
      paymentStatus: 'PAID',
      amount: 100000,
      refunds: [
        { id: 'r_1', paymentId: 'p_full_ref', amount: 100000, status: 'PROCESSED' },
      ],
    },
  ];

  const res = calculateNetCodObligation(payableAmount, payments);
  // Net applied should be 0; expected COD should be full ₹1,500
  assert.strictEqual(res.grossNonCodAllocationsPaise, 0);
  assert.strictEqual(res.validNonCodAllocationsPaise, 0);
  assert.strictEqual(res.expectedCodPaise, 150000);
  assert.strictEqual(res.isFullyPrepaid, false);
  console.log('✓ Test 1 passed: Fully refunded payment contributes 0 to non-COD deduction.');
}

// ============================================================================
// Test 2: Partial Refund Behavior (The COND-9.9-01 Primary Requirement)
// ============================================================================
console.log('Test 2: Partial Refund (₹1,500 total, ₹1,000 paid, ₹200 refunded -> ₹800 net applied, ₹700 expected COD)...');
{
  const payableAmount = 150000; // ₹1,500
  const payments = [
    {
      id: 'p_part_ref',
      paymentMethod: 'CARD', // Razorpay online
      paymentStatus: 'PAID',
      amount: 100000, // ₹1,000
      refunds: [
        { id: 'r_part_1', paymentId: 'p_part_ref', amount: 20000, status: 'PROCESSED' }, // ₹200
      ],
    },
  ];

  const res = calculateNetCodObligation(payableAmount, payments);
  assert.strictEqual(res.grossNonCodAllocationsPaise, 100000);
  assert.strictEqual(res.totalRefundedPaise, 20000);
  assert.strictEqual(res.validNonCodAllocationsPaise, 80000); // Exactly ₹800 net applied
  assert.strictEqual(res.expectedCodPaise, 70000); // Exactly ₹700 expected COD (70,000 paise)
  assert.strictEqual(res.isFullyPrepaid, false);
  console.log('✓ Test 2 passed: Partial refund strictly deducts remaining applied payment (₹800) leaving ₹700 expected COD.');
}

// ============================================================================
// Test 3: Multiple Partial Refunds on Single Payment
// ============================================================================
console.log('Test 3: Multiple partial refunds on a single payment...');
{
  const payableAmount = 200000; // ₹2,000
  const payments = [
    {
      id: 'p_multi_ref',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      amount: 150000, // ₹1,500
      refunds: [
        { id: 'r_m1', paymentId: 'p_multi_ref', amount: 30000, status: 'PROCESSED' }, // ₹300
        { id: 'r_m2', paymentId: 'p_multi_ref', amount: 20000, status: 'PROCESSED' }, // ₹200
        { id: 'r_m3', paymentId: 'p_multi_ref', amount: 10000, status: 'FAILED' },    // FAILED refund must NOT deduct
      ],
    },
  ];

  const res = calculateNetCodObligation(payableAmount, payments);
  // Total refunded = 30000 + 20000 = 50000 (₹500). FAILED is ignored.
  // Net applied = 150000 - 50000 = 100000 (₹1,000).
  // Expected COD = 200000 - 100000 = 100000 (₹1,000).
  assert.strictEqual(res.totalRefundedPaise, 50000);
  assert.strictEqual(res.validNonCodAllocationsPaise, 100000);
  assert.strictEqual(res.expectedCodPaise, 100000);
  console.log('✓ Test 3 passed: Multiple partial refunds accumulate correctly and ignore failed refunds.');
}

// ============================================================================
// Test 4: Pending and Failed Refunds Do Not Reduce Applied Balance
// ============================================================================
console.log('Test 4: Pending and Failed refunds do not prematurely reduce net applied payment...');
{
  const payableAmount = 100000;
  const payments = [
    {
      id: 'p_pend',
      paymentMethod: 'WALLET',
      paymentStatus: 'PAID',
      amount: 60000,
      refunds: [
        { id: 'r_pend', paymentId: 'p_pend', amount: 20000, status: 'PENDING' },
        { id: 'r_fail', paymentId: 'p_pend', amount: 10000, status: 'FAILED' },
      ],
    },
  ];

  const res = calculateNetCodObligation(payableAmount, payments);
  // PENDING and FAILED refunds do not deduct from applied payment
  assert.strictEqual(res.validNonCodAllocationsPaise, 60000);
  assert.strictEqual(res.expectedCodPaise, 40000);
  console.log('✓ Test 4 passed: Unconfirmed (PENDING/FAILED) refunds do not alter applied allocation.');
}

// ============================================================================
// Test 5: Over-Allocation with Partial Refunds
// ============================================================================
console.log('Test 5: Over-allocation detection accounts for partial refunds...');
{
  const payableAmount = 100000; // ₹1,000
  // Originally over-allocated: ₹1,500 paid. But ₹600 refunded -> ₹900 net applied (valid!)
  const paymentsValidAfterRefund = [
    {
      id: 'p_over_fixed',
      paymentMethod: 'WALLET',
      paymentStatus: 'PAID',
      amount: 150000,
      refunds: [
        { id: 'r_fix', paymentId: 'p_over_fixed', amount: 60000, status: 'PROCESSED' },
      ],
    },
  ];

  const resValid = calculateNetCodObligation(payableAmount, paymentsValidAfterRefund);
  assert.strictEqual(resValid.validNonCodAllocationsPaise, 90000);
  assert.strictEqual(resValid.expectedCodPaise, 10000);

  // Still over-allocated: ₹1,500 paid, ₹200 refunded -> ₹1,300 net applied > ₹1,000 payable
  const paymentsStillOver = [
    {
      id: 'p_still_over',
      paymentMethod: 'WALLET',
      paymentStatus: 'PAID',
      amount: 150000,
      refunds: [
        { id: 'r_small', paymentId: 'p_still_over', amount: 20000, status: 'PROCESSED' },
      ],
    },
  ];

  assert.throws(
    () => calculateNetCodObligation(payableAmount, paymentsStillOver, { throwOnOverAllocation: true }),
    /Financial integrity violation/
  );
  console.log('✓ Test 5 passed: Over-allocation detection dynamically evaluates net applied allocations.');
}

console.log('--- ALL BATCH 10 REFUND LEDGER & FINANCIAL INTEGRITY TESTS PASSED (5/5) ---');
