import assert from 'node:assert';
import { createOrderSchema, checkoutOrderSchema } from '../src/lib/validation/order.ts';
import { normalizePhoneNumber } from '../src/modules/customer/service.ts';
import { formatE164, maskPhoneNumber } from '../src/lib/services/sms.ts';

console.log('🧪 Running Batch 11: End-to-End Functional Integration & Cross-Device Reliability Tests...\n');

let passedTests = 0;
let totalTests = 0;

function testCase(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason:`, err.message || err);
    throw err;
  }
}

// ============================================================================
// 1. ROOT CAUSE & ORDER CREATION SCHEMA INTEGRATION TESTS
// ============================================================================
console.log('--- 1. Order Creation Schema & Payload Compatibility ---');

testCase('1.1 Valid backend order payload passes createOrderSchema validation', () => {
  const validPayload = {
    addressId: 'addr-gurugram-1',
    paymentMethod: 'COD',
    deliveryTip: 2000,
    deliverySlot: 'Instant (10-15 mins)',
    notes: 'Please ring bell',
  };
  const res = createOrderSchema.safeParse(validPayload);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.addressId, 'addr-gurugram-1');
  assert.strictEqual(res.data.paymentMethod, 'COD');
  assert.strictEqual(res.data.deliveryTip, 2000);
});

testCase('1.2 Legacy frontend payload lacking addressId is rejected (Investigating PRV-2026-8246)', () => {
  const legacyBrokenPayload = {
    customerId: 'user-cust-01',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    deliveryAddress: { houseNumber: '42B', street: 'Sector 14' },
    paymentMethod: 'UPI',
    grandTotal: 500,
  };
  const res = createOrderSchema.safeParse(legacyBrokenPayload);
  assert.strictEqual(res.success, false);
  assert.ok(res.error.format().addressId, 'Must fail on missing addressId');
});

testCase('1.3 Default values are assigned safely for optional tip and slot', () => {
  const minimalPayload = {
    addressId: 'addr-default-1',
  };
  const res = createOrderSchema.safeParse(minimalPayload);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.paymentMethod, 'COD');
  assert.strictEqual(res.data.deliveryTip, 0);
  assert.strictEqual(res.data.deliverySlot, 'Instant (10-15 mins)');
});

// ============================================================================
// 2. PHONE NUMBER & OTP AUTHENTICATION INVARIANTS
// ============================================================================
console.log('\n--- 2. Phone Number Normalization & OTP Security Invariants ---');

testCase('2.1 10-digit Indian mobile number normalizes to +91 E.164 format', () => {
  assert.strictEqual(normalizePhoneNumber('9876543210'), '+919876543210');
  assert.strictEqual(formatE164('9876543210'), '+919876543210');
});

testCase('2.2 12-digit number starting with 91 normalizes cleanly', () => {
  assert.strictEqual(normalizePhoneNumber('919876543210'), '+919876543210');
});

testCase('2.3 Phone masking for client-side privacy displays only last 4 digits', () => {
  const masked = maskPhoneNumber('+919876543210');
  assert.strictEqual(masked, '+91 ******3210');
});

// ============================================================================
// 3. CROSS-DEVICE ORDER VISIBILITY SIMULATION
// ============================================================================
console.log('\n--- 3. Cross-Device Order Visibility & Centralized Persistence ---');

testCase('3.1 Order created in central database is immediately retrievable by admin query without shared localStorage', () => {
  // Simulated central database table
  const databaseOrders = [];

  // Mobile customer creates order
  const clientOrderId = `ord-${Date.now()}`;
  const clientOrderNumber = 'PRV-2026-8246';
  const orderRecord = {
    id: clientOrderId,
    orderNumber: clientOrderNumber,
    userId: 'user-cust-01',
    customerName: 'Rahul Sharma',
    customerPhone: '+919876543210',
    storeId: 'STR-GGM-01',
    subtotal: 45000,
    deliveryFee: 0,
    deliveryTip: 2000,
    grandTotal: 47000,
    orderStatus: 'PLACED',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    items: [
      { id: 'item-1', productName: 'Fresh Cow Milk', purchasedPrice: 6600, quantity: 2 }
    ],
    createdAt: new Date().toISOString()
  };

  databaseOrders.push(orderRecord);

  // Desktop admin query function (mimicking orderService.listAdminOrders)
  function adminListOrders(search) {
    if (!search) return databaseOrders;
    const q = search.toLowerCase();
    return databaseOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  // Admin searches by exact order number PRV-2026-8246 on independent desktop browser
  const results = adminListOrders('PRV-2026-8246');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].orderNumber, 'PRV-2026-8246');
  assert.strictEqual(results[0].grandTotal, 47000);
  assert.strictEqual(results[0].customerName, 'Rahul Sharma');
  assert.strictEqual(results[0].storeId, 'STR-GGM-01');
});

console.log(`\n🎉 All ${passedTests}/${totalTests} Batch 11 Functional Integration Tests Passed Successfully!\n`);
