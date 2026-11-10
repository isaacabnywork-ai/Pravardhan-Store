import assert from 'node:assert';
import { calculateNetCodObligation } from '../src/modules/operations/financial-reconciliation-helper.ts';

console.log('--- Running Batch 9.8 Financial Integrity Remediation Test Suite ---');

// ============================================================================
// Scenario 1: COND-9.7-01 Strict Payment Status Filtering
// ============================================================================
console.log('Test 1: Payment Status Filtering (PAID vs PENDING vs FAILED vs REFUNDED)...');
{
  const grandTotal = 150000; // ₹1,500 in paise

  // Case A: Successfully PAID Wallet allocation -> Deducts exactly once
  const paidWallet = [
    { id: 'p_1', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 },
  ];
  const resPaidWallet = calculateNetCodObligation(grandTotal, paidWallet);
  assert.strictEqual(resPaidWallet.validNonCodAllocationsPaise, 50000);
  assert.strictEqual(resPaidWallet.expectedCodPaise, 100000);
  assert.strictEqual(resPaidWallet.isFullyPrepaid, false);

  // Case B: PENDING non-COD payment -> Must NOT deduct
  const pendingPayment = [
    { id: 'p_2', paymentMethod: 'UPI', paymentStatus: 'PENDING', amount: 50000 },
  ];
  const resPending = calculateNetCodObligation(grandTotal, pendingPayment);
  assert.strictEqual(resPending.validNonCodAllocationsPaise, 0);
  assert.strictEqual(resPending.expectedCodPaise, 150000);

  // Case C: FAILED non-COD payment -> Must NOT deduct
  const failedPayment = [
    { id: 'p_3', paymentMethod: 'CARD', paymentStatus: 'FAILED', amount: 50000 },
  ];
  const resFailed = calculateNetCodObligation(grandTotal, failedPayment);
  assert.strictEqual(resFailed.validNonCodAllocationsPaise, 0);
  assert.strictEqual(resFailed.expectedCodPaise, 150000);

  // Case D: REFUNDED non-COD payment -> Must NOT deduct from outstanding COD
  const refundedPayment = [
    { id: 'p_4', paymentMethod: 'WALLET', paymentStatus: 'REFUNDED', amount: 50000 },
  ];
  const resRefunded = calculateNetCodObligation(grandTotal, refundedPayment);
  assert.strictEqual(resRefunded.validNonCodAllocationsPaise, 0);
  assert.strictEqual(resRefunded.expectedCodPaise, 150000);

  // Case E: Duplicate payment records in input -> Deduplication guard prevents double-deduction
  const duplicatePayments = [
    { id: 'p_dup', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 },
    { id: 'p_dup', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 },
  ];
  const resDup = calculateNetCodObligation(grandTotal, duplicatePayments);
  assert.strictEqual(resDup.validNonCodAllocationsPaise, 50000);
  assert.strictEqual(resDup.expectedCodPaise, 100000);

  console.log('✓ Test 1 passed: Only successfully PAID, active non-COD allocations reduce COD obligation.');
}

// ============================================================================
// Scenario 2: COND-9.7-02 Zero-Cash Record Semantics
// ============================================================================
console.log('Test 2: Zero-Cash Record Semantics (isFullyPrepaid and No CashCollection instantiated)...');
{
  const grandTotal = 80000; // ₹800

  // Fully wallet-funded order (₹800 wallet on ₹800 order)
  const fullWalletPayments = [
    { id: 'p_full_1', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 80000 },
  ];

  const result = calculateNetCodObligation(grandTotal, fullWalletPayments);
  assert.strictEqual(result.validNonCodAllocationsPaise, 80000);
  assert.strictEqual(result.expectedCodPaise, 0);
  assert.strictEqual(result.isFullyPrepaid, true);

  // In OrderService & CashCollectionService:
  // if (isFullyPrepaid || expectedCodPaise === 0), CashCollection is NOT created.
  function simulateOrderCreation(orderTotal, payments) {
    const calc = calculateNetCodObligation(orderTotal, payments, { throwOnOverAllocation: true });
    let createdCollection = null;
    if (!calc.isFullyPrepaid && calc.expectedCodPaise > 0) {
      createdCollection = {
        expectedAmount: calc.expectedCodPaise,
        collectedAmount: 0,
        collectionStatus: 'PENDING',
        settlementStatus: 'UNSETTLED',
      };
    }
    return { calc, createdCollection };
  }

  const fullyFundedOrder = simulateOrderCreation(grandTotal, fullWalletPayments);
  assert.strictEqual(fullyFundedOrder.createdCollection, null, 'No CashCollection record must be created for zero-cash orders');

  const partialCodOrder = simulateOrderCreation(150000, [
    { id: 'p_part', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 },
  ]);
  assert.notStrictEqual(partialCodOrder.createdCollection, null);
  assert.strictEqual(partialCodOrder.createdCollection.expectedAmount, 100000);

  console.log('✓ Test 2 passed: Fully prepaid zero-cash orders instantiate zero physical collection records.');
}

// ============================================================================
// Scenario 3: COND-9.7-03 Over-Allocation Protection
// ============================================================================
console.log('Test 3: Over-allocation handling (Order creation rejection & Backfill isolation)...');
{
  const grandTotal = 100000; // ₹1,000

  // Payments exceed order total: ₹1,200 non-COD on ₹1,000 order
  const overPayments = [
    { id: 'p_over_1', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 120000 },
  ];

  // In Order Creation mode: Must throw ValidationError
  let threwValidationError = false;
  try {
    calculateNetCodObligation(grandTotal, overPayments, { throwOnOverAllocation: true });
  } catch (err) {
    threwValidationError = true;
    assert(err.message.includes('Financial integrity violation'));
    assert(err.message.includes('exceed order payable amount'));
  }
  assert.strictEqual(threwValidationError, true, 'Order creation must reject over-allocation');

  // In Backfill mode: Must NOT throw; must isolate record with isOverAllocated: true
  const backfillCalc = calculateNetCodObligation(grandTotal, overPayments, {
    throwOnOverAllocation: false,
  });
  assert.strictEqual(backfillCalc.isOverAllocated, true);
  assert.strictEqual(backfillCalc.validNonCodAllocationsPaise, 120000);

  console.log('✓ Test 3 passed: Over-allocation is rejected on checkout and isolated in backfill.');
}

// ============================================================================
// Scenario 4: Historical Backfill Processing & Isolation
// ============================================================================
console.log('Test 4: Historical Backfill simulates skipping fully prepaid and isolating over-allocated...');
{
  const historicalOrders = [
    // 1. Pure COD: Should create collection (expected: 150000)
    {
      id: 'ord_1',
      orderNumber: 'PRV-001',
      grandTotal: 150000,
      payments: [],
    },
    // 2. Split COD (₹500 PAID wallet, ₹1000 COD): Should create collection (expected: 100000)
    {
      id: 'ord_2',
      orderNumber: 'PRV-002',
      grandTotal: 150000,
      payments: [{ id: 'p_wal', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 }],
    },
    // 3. Fully prepaid (₹800 PAID wallet): Should SKIP (zero-cash)
    {
      id: 'ord_3',
      orderNumber: 'PRV-003',
      grandTotal: 80000,
      payments: [{ id: 'p_full', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 80000 }],
    },
    // 4. Over-allocated (₹1200 PAID wallet on ₹1000 order): Should ISOLATE
    {
      id: 'ord_4',
      orderNumber: 'PRV-004',
      grandTotal: 100000,
      payments: [{ id: 'p_over', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 120000 }],
    },
    // 5. Failed wallet payment: Should create collection with full grandTotal (expected: 150000)
    {
      id: 'ord_5',
      orderNumber: 'PRV-005',
      grandTotal: 150000,
      payments: [{ id: 'p_fail', paymentMethod: 'WALLET', paymentStatus: 'FAILED', amount: 50000 }],
    },
  ];

  function simulateBackfill(orders) {
    let createdCount = 0;
    let skippedFullyPrepaidCount = 0;
    const isolatedOverAllocatedOrders = [];
    const createdLedger = [];

    for (const order of orders) {
      const calculation = calculateNetCodObligation(order.grandTotal, order.payments, {
        throwOnOverAllocation: false,
      });

      if (calculation.isOverAllocated) {
        isolatedOverAllocatedOrders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          grandTotal: order.grandTotal,
          nonCodAllocations: calculation.validNonCodAllocationsPaise,
        });
        continue;
      }

      if (calculation.isFullyPrepaid || calculation.expectedCodPaise === 0) {
        skippedFullyPrepaidCount++;
        continue;
      }

      createdLedger.push({
        orderId: order.id,
        expectedAmount: calculation.expectedCodPaise,
        collectedAmount: 0,
        collectionStatus: 'PENDING',
      });
      createdCount++;
    }

    return {
      totalFound: orders.length,
      createdCount,
      skippedFullyPrepaidCount,
      isolatedOverAllocatedCount: isolatedOverAllocatedOrders.length,
      isolatedOverAllocatedOrders,
      createdLedger,
    };
  }

  const backfillResult = simulateBackfill(historicalOrders);
  assert.strictEqual(backfillResult.totalFound, 5);
  assert.strictEqual(backfillResult.createdCount, 3); // ord_1, ord_2, ord_5
  assert.strictEqual(backfillResult.skippedFullyPrepaidCount, 1); // ord_3
  assert.strictEqual(backfillResult.isolatedOverAllocatedCount, 1); // ord_4
  assert.strictEqual(backfillResult.isolatedOverAllocatedOrders[0].orderId, 'ord_4');

  // Verify created ledger lines
  assert.strictEqual(backfillResult.createdLedger[0].orderId, 'ord_1');
  assert.strictEqual(backfillResult.createdLedger[0].expectedAmount, 150000);

  assert.strictEqual(backfillResult.createdLedger[1].orderId, 'ord_2');
  assert.strictEqual(backfillResult.createdLedger[1].expectedAmount, 100000);

  assert.strictEqual(backfillResult.createdLedger[2].orderId, 'ord_5');
  assert.strictEqual(backfillResult.createdLedger[2].expectedAmount, 150000); // FAILED payment not deducted

  console.log('✓ Test 4 passed: Backfill faithfully applies status filters, skips zero-cash, and isolates over-allocations.');
}

console.log('--- ALL BATCH 9.8 FINANCIAL INTEGRITY TESTS PASSED (4/4) ---');
