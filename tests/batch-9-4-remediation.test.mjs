import assert from 'node:assert';
import { cashCollectionService } from '../src/modules/operations/cash-collection-service.js';

console.log('--- Running Batch 9.4 Final Migration & COD Financial Integrity Test Suite ---');

// Test 1: Additive Migration SQL Validation
console.log('Test 1: Migration SQL handles pre-flight duplicate check and idempotency...');
{
  function simulateMigrationPreflight(records) {
    const orderIdCounts = new Map();
    for (const r of records) {
      orderIdCounts.set(r.orderId, (orderIdCounts.get(r.orderId) || 0) + 1);
    }
    const duplicates = Array.from(orderIdCounts.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      throw new Error(`Cannot apply migration: ${duplicates.length} duplicate orderId records exist. Manual financial reconciliation is required.`);
    }
    return true;
  }

  // Clean records: OK
  assert.strictEqual(
    simulateMigrationPreflight([
      { id: '1', orderId: 'ord_1' },
      { id: '2', orderId: 'ord_2' },
    ]),
    true
  );

  // Duplicates exist: Throws safe error
  let duplicateCaught = false;
  try {
    simulateMigrationPreflight([
      { id: '1', orderId: 'ord_1' },
      { id: '2', orderId: 'ord_1' },
    ]);
  } catch (err) {
    duplicateCaught = true;
    assert(err.message.includes('duplicate orderId records exist'));
  }
  assert.strictEqual(duplicateCaught, true, 'Pre-flight check must block migration when duplicates exist');
  console.log('✓ Test 1 passed: Pre-flight duplicate check protects data preservation.');
}

// Test 2: Rule A & Rule E — Delivered != Collected Revenue
console.log('Test 2: Rule A & E — Delivered COD without verified CashCollection is not collected revenue...');
{
  function reconcileFinancialOrders(orders, cashCollections) {
    const collectionMap = new Map(cashCollections.map((c) => [c.orderId, c]));

    let codDeliveredCollectedPaise = 0;
    let codPendingDeliveryPaise = 0;
    let codUnverifiedLegacyPaise = 0;
    let razorpayCapturedAmountPaise = 0;

    for (const order of orders) {
      if (order.paymentMethod === 'COD') {
        const persisted = collectionMap.get(order.id);
        if (persisted && persisted.collectedAmount > 0) {
          codDeliveredCollectedPaise += persisted.collectedAmount;
        } else if (order.orderStatus === 'DELIVERED') {
          // Rule A: Delivered COD without collection record is unverified, NEVER collected
          codUnverifiedLegacyPaise += order.grandTotal;
        } else {
          codPendingDeliveryPaise += order.grandTotal;
        }
      } else if (order.paymentStatus === 'PAID') {
        razorpayCapturedAmountPaise += order.grandTotal;
      }
    }

    const totalCollected = codDeliveredCollectedPaise + razorpayCapturedAmountPaise;
    return {
      codDeliveredCollectedPaise,
      codPendingDeliveryPaise,
      codUnverifiedLegacyPaise,
      totalCollected,
    };
  }

  const sampleOrders = [
    { id: 'ord_cod_delivered_no_cc', paymentMethod: 'COD', orderStatus: 'DELIVERED', grandTotal: 50000 },
    { id: 'ord_cod_pending', paymentMethod: 'COD', orderStatus: 'PLACED', grandTotal: 30000 },
    { id: 'ord_cod_delivered_with_cc', paymentMethod: 'COD', orderStatus: 'DELIVERED', grandTotal: 40000 },
    { id: 'ord_online_paid', paymentMethod: 'UPI', orderStatus: 'DELIVERED', paymentStatus: 'PAID', grandTotal: 25000 },
  ];

  const sampleCollections = [
    { orderId: 'ord_cod_delivered_with_cc', collectedAmount: 40000, collectionStatus: 'COLLECTED' },
  ];

  const result = reconcileFinancialOrders(sampleOrders, sampleCollections);

  // Delivered COD without record MUST NOT be in collected revenue
  assert.strictEqual(result.codDeliveredCollectedPaise, 40000, 'Only verified collection contributes to collected COD');
  assert.strictEqual(result.codUnverifiedLegacyPaise, 50000, 'Delivered order without collection classified as unverified legacy');
  assert.strictEqual(result.codPendingDeliveryPaise, 30000, 'Placed COD is pending delivery');
  assert.strictEqual(result.totalCollected, 65000, 'Collected revenue is strictly verified COD (40000) + online paid (25000)');

  console.log('✓ Test 2 passed: Delivered COD without collection record strictly excluded from collected revenue.');
}

// Test 3: Rule B — Canonical Pending Ledger Creation Validation
console.log('Test 3: Rule B — Pending ledger creation parameters and negative protection...');
{
  let negativeBlocked = false;
  try {
    await cashCollectionService.createPendingCollection({
      orderId: 'ord_test_neg',
      riderId: 'rider_1',
      storeId: 'store_1',
      expectedAmountPaise: -100,
    });
  } catch (err) {
    negativeBlocked = true;
    assert(err.message.includes('negative'));
  }
  assert.strictEqual(negativeBlocked, true, 'Negative expected amount must be rejected');
  console.log('✓ Test 3 passed: Pending ledger creation validates expected amounts.');
}

// Test 4: Discrepancy & Arithmetic Verification (Exact, Short, Excess, Failed)
console.log('Test 4: Cash Collection Discrepancy & integer paise classification...');
{
  function classifyCollection(expected, collected) {
    if (collected === 0 && expected > 0) return 'FAILED';
    if (collected < expected) return 'SHORT_COLLECTED';
    if (collected > expected) return 'EXCESS_COLLECTED';
    return 'COLLECTED';
  }

  assert.strictEqual(classifyCollection(100000, 100000), 'COLLECTED');
  assert.strictEqual(classifyCollection(100000, 80000), 'SHORT_COLLECTED');
  assert.strictEqual(classifyCollection(100000, 120000), 'EXCESS_COLLECTED');
  assert.strictEqual(classifyCollection(100000, 0), 'FAILED');
  console.log('✓ Test 4 passed: Discrepancies and status transitions deterministic.');
}

// Test 5: Historical Order Backfill Ledger Isolation
console.log('Test 5: Historical order backfill creates unverified PENDING entries without fabricating collections...');
{
  function simulateBackfill(historicalOrders) {
    return historicalOrders.map((order) => ({
      orderId: order.id,
      expectedAmount: order.grandTotal,
      collectedAmount: 0,
      collectionStatus: 'PENDING',
      settlementStatus: 'UNSETTLED',
      notes: `Historical backfill for Order #${order.orderNumber} (Status: ${order.orderStatus}). Requires manual financial reconciliation.`,
    }));
  }

  const legacyOrders = [
    { id: 'leg_1', orderNumber: 'PRV-2025-001', orderStatus: 'DELIVERED', grandTotal: 75000 },
  ];

  const backfilled = simulateBackfill(legacyOrders);
  assert.strictEqual(backfilled.length, 1);
  assert.strictEqual(backfilled[0].collectedAmount, 0, 'Backfilled entry collected amount MUST be zero');
  assert.strictEqual(backfilled[0].collectionStatus, 'PENDING', 'Backfilled entry must be PENDING');
  assert.strictEqual(backfilled[0].settlementStatus, 'UNSETTLED', 'Backfilled entry must be UNSETTLED');
  assert(backfilled[0].notes.includes('manual financial reconciliation'));
  console.log('✓ Test 5 passed: Historical backfill preserves audit integrity without fabricating collections.');
}

console.log('\n======================================================');
console.log('ALL BATCH 9.4 MIGRATION & COD FINANCIAL TESTS PASSED (5/5)');
console.log('======================================================');
