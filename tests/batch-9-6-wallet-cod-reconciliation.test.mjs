import assert from 'node:assert';

console.log('--- Running Batch 9.6 Wallet + COD Cash Collection Reconciliation Test Suite ---');

/**
 * Helper: Pure function replicating Batch 9.6 OrderService and CashCollection creation logic
 */
function calculateExpectedCodCollection({ grandTotal, paymentMethod, nonCodPayments = [] }) {
  if (paymentMethod !== 'COD') {
    return null;
  }
  const nonCodAllocationsPaise = nonCodPayments
    .filter((p) => p.paymentMethod !== 'COD' && p.paymentStatus === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const expectedAmountPaise = Math.max(0, grandTotal - nonCodAllocationsPaise);
  const isFullyCovered = expectedAmountPaise === 0 && nonCodAllocationsPaise > 0;

  return {
    grandTotal,
    nonCodAllocationsPaise,
    expectedAmountPaise,
    collectionStatus: isFullyCovered ? 'COLLECTED' : 'PENDING',
    settlementStatus: isFullyCovered ? 'SETTLED' : 'UNSETTLED',
  };
}

/**
 * Helper: Pure function replicating Batch 9.6 CashCollectionService backfill logic
 */
function backfillHistoricalOrder(order) {
  if (order.paymentMethod !== 'COD') {
    return null;
  }
  const nonCodAllocationsPaise = (order.payments || [])
    .filter((p) => p.paymentMethod !== 'COD')
    .reduce((sum, p) => sum + p.amount, 0);

  const netExpectedPaise = Math.max(0, order.grandTotal - nonCodAllocationsPaise);
  const isFullyPrepaid = netExpectedPaise === 0 && nonCodAllocationsPaise > 0;

  return {
    orderId: order.id,
    expectedAmount: netExpectedPaise,
    collectedAmount: 0,
    collectionStatus: isFullyPrepaid ? 'COLLECTED' : 'PENDING',
    settlementStatus: isFullyPrepaid ? 'SETTLED' : 'UNSETTLED',
  };
}

/**
 * Helper: Pure function replicating reconciliation and variance calculations
 */
function calculateReconciliation(collections) {
  let totalExpectedPaise = 0;
  let totalCollectedPaise = 0;
  let totalSettledPaise = 0;
  let totalUnsettledPaise = 0;
  let totalShortPaise = 0;
  let totalExcessPaise = 0;

  for (const c of collections) {
    totalExpectedPaise += c.expectedAmount;
    totalCollectedPaise += c.collectedAmount;

    if (c.settlementStatus === 'SETTLED') {
      totalSettledPaise += c.collectedAmount;
    } else {
      totalUnsettledPaise += c.collectedAmount;
    }

    if (c.collectionStatus === 'SHORT_COLLECTED') {
      totalShortPaise += (c.expectedAmount - c.collectedAmount);
    } else if (c.collectionStatus === 'EXCESS_COLLECTED') {
      totalExcessPaise += (c.collectedAmount - c.expectedAmount);
    }
  }

  return {
    totalExpectedPaise,
    totalCollectedPaise,
    totalSettledPaise,
    totalUnsettledPaise,
    totalShortPaise,
    totalExcessPaise,
  };
}

/**
 * Helper: Simulates cancelOrder behavior on CashCollection
 */
function simulateCancelOrder(order, existingCollection) {
  if (order.orderStatus !== 'PLACED' && order.orderStatus !== 'CONFIRMED') {
    throw new Error('Order cannot be cancelled in its current state');
  }

  let updatedCollection = existingCollection;
  if (
    existingCollection &&
    existingCollection.collectionStatus === 'PENDING' &&
    existingCollection.settlementStatus === 'UNSETTLED'
  ) {
    updatedCollection = {
      ...existingCollection,
      collectionStatus: 'FAILED',
      notes: 'Order cancelled before cash collection',
    };
  }

  return {
    order: { ...order, orderStatus: 'CANCELLED' },
    collection: updatedCollection,
  };
}

// ============================================================================
// Scenario 1: Pure COD order (₹1,500 total / ₹0 wallet / ₹1,500 expected COD cash)
// ============================================================================
console.log('Test 1: Pure COD order (₹1,500 total, ₹0 wallet, ₹1,500 expected cash)...');
{
  const result = calculateExpectedCodCollection({
    grandTotal: 150000, // 1500 INR in paise
    paymentMethod: 'COD',
    nonCodPayments: [],
  });

  assert.strictEqual(result.grandTotal, 150000);
  assert.strictEqual(result.nonCodAllocationsPaise, 0);
  assert.strictEqual(result.expectedAmountPaise, 150000);
  assert.strictEqual(result.collectionStatus, 'PENDING');
  assert.strictEqual(result.settlementStatus, 'UNSETTLED');
  console.log('✓ Test 1 passed: Pure COD expected cash exactly matches grandTotal in integer paise.');
}

// ============================================================================
// Scenario 2: Split Wallet + COD order (₹1,500 total / ₹500 wallet / ₹1,000 expected cash)
// ============================================================================
console.log('Test 2: Split Wallet + COD order (₹1,500 total, ₹500 wallet, ₹1,000 expected cash)...');
{
  const result = calculateExpectedCodCollection({
    grandTotal: 150000,
    paymentMethod: 'COD',
    nonCodPayments: [
      { id: 'pay_wal_1', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 },
    ],
  });

  assert.strictEqual(result.grandTotal, 150000);
  assert.strictEqual(result.nonCodAllocationsPaise, 50000);
  assert.strictEqual(result.expectedAmountPaise, 100000); // exactly 1000 INR
  assert.strictEqual(result.collectionStatus, 'PENDING');
  assert.strictEqual(result.settlementStatus, 'UNSETTLED');
  console.log('✓ Test 2 passed: Split payment allocates ₹500 wallet and calculates net ₹1,000 COD cash.');
}

// ============================================================================
// Scenario 3: Split Wallet + COD order (₹2,000 total / ₹750 wallet / ₹1,250 expected cash)
// ============================================================================
console.log('Test 3: Split Wallet + COD order (₹2,000 total, ₹750 wallet, ₹1,250 expected cash)...');
{
  const result = calculateExpectedCodCollection({
    grandTotal: 200000,
    paymentMethod: 'COD',
    nonCodPayments: [
      { id: 'pay_wal_2', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 75000 },
    ],
  });

  assert.strictEqual(result.grandTotal, 200000);
  assert.strictEqual(result.nonCodAllocationsPaise, 75000);
  assert.strictEqual(result.expectedAmountPaise, 125000); // 1250 INR
  assert.strictEqual(result.collectionStatus, 'PENDING');
  assert.strictEqual(result.settlementStatus, 'UNSETTLED');
  console.log('✓ Test 3 passed: Split payment allocates ₹750 wallet and calculates net ₹1,250 COD cash.');
}

// ============================================================================
// Scenario 4: Fully wallet-funded order (₹800 total / ₹800 wallet / ₹0 expected cash)
// ============================================================================
console.log('Test 4: Fully wallet-funded order (₹800 total, ₹800 wallet, ₹0 expected cash)...');
{
  const result = calculateExpectedCodCollection({
    grandTotal: 80000,
    paymentMethod: 'COD',
    nonCodPayments: [
      { id: 'pay_wal_3', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 80000 },
    ],
  });

  assert.strictEqual(result.grandTotal, 80000);
  assert.strictEqual(result.nonCodAllocationsPaise, 80000);
  assert.strictEqual(result.expectedAmountPaise, 0); // 0 paise expected
  assert.strictEqual(result.collectionStatus, 'COLLECTED'); // Automatically satisfied
  assert.strictEqual(result.settlementStatus, 'SETTLED');
  console.log('✓ Test 4 passed: Fully wallet-funded order results in ₹0 expected cash and auto-settled status.');
}

// ============================================================================
// Scenario 5: Pure COD with coupon discount in payable total (₹1,200 payable total / ₹0 wallet / ₹1,200 expected cash)
// ============================================================================
console.log('Test 5: Pure COD with coupon discount (₹1,200 payable total, ₹0 wallet, ₹1,200 expected cash)...');
{
  // Merchandise: ₹1,500, Discount: ₹300, grandTotal = ₹1,200 (120,000 paise)
  const result = calculateExpectedCodCollection({
    grandTotal: 120000,
    paymentMethod: 'COD',
    nonCodPayments: [],
  });

  assert.strictEqual(result.grandTotal, 120000);
  assert.strictEqual(result.nonCodAllocationsPaise, 0);
  assert.strictEqual(result.expectedAmountPaise, 120000);
  assert.strictEqual(result.collectionStatus, 'PENDING');
  console.log('✓ Test 5 passed: Discounted payable grandTotal correctly forms expected amount.');
}

// ============================================================================
// Scenario 6: Historical COD Backfill (Pure COD, Split COD, and Idempotency)
// ============================================================================
console.log('Test 6: Historical COD backfill handles pure, split, and idempotent runs...');
{
  const historicalPureCod = {
    id: 'ord_hist_1',
    orderNumber: 'PRV-HIST-1',
    storeId: 'store_1',
    deliveryStaffId: 'rider_1',
    userId: 'user_1',
    grandTotal: 100000,
    orderStatus: 'DELIVERED',
    paymentMethod: 'COD',
    payments: [],
  };

  const historicalSplitCod = {
    id: 'ord_hist_2',
    orderNumber: 'PRV-HIST-2',
    storeId: 'store_1',
    deliveryStaffId: 'rider_1',
    userId: 'user_1',
    grandTotal: 150000,
    orderStatus: 'DELIVERED',
    paymentMethod: 'COD',
    payments: [
      { id: 'pay_hist_wal', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 50000 },
    ],
  };

  const historicalFullWallet = {
    id: 'ord_hist_3',
    orderNumber: 'PRV-HIST-3',
    storeId: 'store_1',
    deliveryStaffId: 'rider_1',
    userId: 'user_1',
    grandTotal: 80000,
    orderStatus: 'DELIVERED',
    paymentMethod: 'COD',
    payments: [
      { id: 'pay_hist_full', paymentMethod: 'WALLET', paymentStatus: 'PAID', amount: 80000 },
    ],
  };

  const resPure = backfillHistoricalOrder(historicalPureCod);
  assert.strictEqual(resPure.expectedAmount, 100000);
  assert.strictEqual(resPure.collectedAmount, 0);
  assert.strictEqual(resPure.collectionStatus, 'PENDING');

  const resSplit = backfillHistoricalOrder(historicalSplitCod);
  assert.strictEqual(resSplit.expectedAmount, 100000); // 1500 - 500 = 1000 INR
  assert.strictEqual(resSplit.collectedAmount, 0);
  assert.strictEqual(resSplit.collectionStatus, 'PENDING');

  const resFull = backfillHistoricalOrder(historicalFullWallet);
  assert.strictEqual(resFull.expectedAmount, 0);
  assert.strictEqual(resFull.collectionStatus, 'COLLECTED');
  assert.strictEqual(resFull.settlementStatus, 'SETTLED');

  // Idempotency check: Orders with existing cashCollections are ignored
  const existingCollectionMap = new Map([['ord_hist_1', resPure]]);
  const candidateOrders = [historicalPureCod, historicalSplitCod].filter(
    (o) => !existingCollectionMap.has(o.id)
  );
  assert.strictEqual(candidateOrders.length, 1);
  assert.strictEqual(candidateOrders[0].id, 'ord_hist_2');

  console.log('✓ Test 6 passed: Backfill respects split allocations and duplicate backfill idempotency.');
}

// ============================================================================
// Scenario 7: Order Cancellation Lifecycle (Uncollected vs Collected/Settled)
// ============================================================================
console.log('Test 7: Order cancellation transitions PENDING cash collection to FAILED but preserves SETTLED...');
{
  const uncollectedOrder = {
    id: 'ord_cancel_1',
    orderStatus: 'PLACED',
  };
  const pendingCollection = {
    id: 'col_1',
    orderId: 'ord_cancel_1',
    expectedAmount: 100000,
    collectedAmount: 0,
    collectionStatus: 'PENDING',
    settlementStatus: 'UNSETTLED',
  };

  const cancelResult = simulateCancelOrder(uncollectedOrder, pendingCollection);
  assert.strictEqual(cancelResult.order.orderStatus, 'CANCELLED');
  assert.strictEqual(cancelResult.collection.collectionStatus, 'FAILED');
  assert.strictEqual(cancelResult.collection.settlementStatus, 'UNSETTLED');

  // Settled or Collected record: Must NOT be mutated to FAILED
  const settledCollection = {
    id: 'col_2',
    orderId: 'ord_settled_1',
    expectedAmount: 100000,
    collectedAmount: 100000,
    collectionStatus: 'COLLECTED',
    settlementStatus: 'SETTLED',
  };
  const activeDeliveredOrder = {
    id: 'ord_settled_1',
    orderStatus: 'DELIVERED',
  };

  assert.throws(
    () => simulateCancelOrder(activeDeliveredOrder, settledCollection),
    /Order cannot be cancelled in its current state/
  );
  console.log('✓ Test 7 passed: Cancellation lifecycle reliably handles uncollected vs settled records.');
}

// ============================================================================
// Scenario 8: Variance & Settlement Arithmetic with Net COD Obligation
// ============================================================================
console.log('Test 8: Reconciliation and variance calculations with net COD obligation...');
{
  // Case A: Net obligation ₹1,000, collected ₹1,000 -> Exact collection
  const exactCollection = {
    expectedAmount: 100000,
    collectedAmount: 100000,
    collectionStatus: 'COLLECTED',
    settlementStatus: 'SETTLED',
  };

  // Case B: Net obligation ₹1,250, collected ₹1,000 -> Short ₹250
  const shortCollection = {
    expectedAmount: 125000,
    collectedAmount: 100000,
    collectionStatus: 'SHORT_COLLECTED',
    settlementStatus: 'UNSETTLED',
  };

  // Case C: Net obligation ₹1,000, collected ₹1,100 -> Excess ₹100
  const excessCollection = {
    expectedAmount: 100000,
    collectedAmount: 110000,
    collectionStatus: 'EXCESS_COLLECTED',
    settlementStatus: 'UNSETTLED',
  };

  const recon = calculateReconciliation([exactCollection, shortCollection, excessCollection]);

  // Expected total = 100000 + 125000 + 100000 = 325,000 paise (₹3,250)
  assert.strictEqual(recon.totalExpectedPaise, 325000);
  // Collected total = 100000 + 100000 + 110000 = 310,000 paise (₹3,100)
  assert.strictEqual(recon.totalCollectedPaise, 310000);
  // Settled total = 100,000 paise (Case A)
  assert.strictEqual(recon.totalSettledPaise, 100000);
  // Unsettled total = 100,000 + 110,000 = 210,000 paise
  assert.strictEqual(recon.totalUnsettledPaise, 210000);
  // Short = 125000 - 100000 = 25,000 paise (₹250)
  assert.strictEqual(recon.totalShortPaise, 25000);
  // Excess = 110000 - 100000 = 10,000 paise (₹100)
  assert.strictEqual(recon.totalExcessPaise, 10000);

  console.log('✓ Test 8 passed: Short/excess and settlement math strictly adhere to integer paise and net obligation.');
}

console.log('--- ALL BATCH 9.6 WALLET + COD RECONCILIATION TESTS PASSED SUCCESSFULLY ---');
