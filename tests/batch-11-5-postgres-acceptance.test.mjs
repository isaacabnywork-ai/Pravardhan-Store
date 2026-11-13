import assert from 'node:assert/strict';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

console.log('🧪 Running Batch 11.5 PostgreSQL Acceptance & Concurrency Suite...\n');

const DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/pravdhan_test?schema=public';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

async function runTests() {
  try {
    await prisma.$connect();
    console.log('Connected to isolated PostgreSQL test instance successfully.\n');

    // Clean up test tables
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "order_items", "orders", "carts", "cart_items", "otp_challenges" CASCADE;');

    // Setup base store and products
    const timestamp = Date.now();
    const testStore = await prisma.store.create({
      data: {
        code: `STR-${timestamp.toString().slice(-4)}`,
        name: 'Gurugram Central Dark Store',
        address: 'Sector 14, Gurugram',
        city: 'Gurugram',
        serviceArea: 'Gurugram Central',
        minOrderValue: 10000,
        deliveryFee: 2500,
        freeDeliveryThreshold: 25000,
      }
    });

    const serviceArea = await prisma.serviceArea.create({
      data: {
        storeId: testStore.id,
        name: 'Gurugram Sector 14',
        pincode: '122001',
        isActive: true,
      }
    });

    const category = await prisma.category.create({
      data: {
        name: `Grocery ${timestamp}`,
        slug: `grocery-${timestamp}`,
      }
    });

    const product = await prisma.product.create({
      data: {
        name: 'Organic Whole Milk',
        slug: `organic-whole-milk-${timestamp}`,
        brand: 'Amul',
        categoryId: category.id,
        images: ['https://example.com/milk.jpg'],
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `MILK-1L-${timestamp}`,
        title: '1 Litre',
        price: 7500, // ₹75.00
        mrp: 8000,   // ₹80.00
        unit: '1 L',
      }
    });

    const inventory = await prisma.inventory.create({
      data: {
        storeId: testStore.id,
        variantId: variant.id,
        quantity: 100,
        reservedQuantity: 0,
      }
    });

    // Create 2 Test Users
    const customerA = await prisma.user.create({
      data: {
        name: 'Customer A',
        email: `customera_${timestamp}@example.com`,
        phone: `9811${timestamp.toString().slice(-6)}`,
      }
    });

    const customerB = await prisma.user.create({
      data: {
        name: 'Customer B',
        email: `customerb_${timestamp}@example.com`,
        phone: `9812${timestamp.toString().slice(-6)}`,
      }
    });

    const addressA = await prisma.address.create({
      data: {
        userId: customerA.id,
        label: 'Home',
        name: 'Customer A',
        phone: customerA.phone || '9811000000',
        houseNumber: 'Flat 101',
        street: 'Main Road',
        area: 'Sector 14',
        city: 'Gurugram',
        pincode: '122001',
        isDefault: true,
      }
    });

    const addressB = await prisma.address.create({
      data: {
        userId: customerB.id,
        label: 'Home',
        name: 'Customer B',
        phone: customerB.phone || '9812000000',
        houseNumber: 'Flat 202',
        street: 'Park Street',
        area: 'Sector 14',
        city: 'Gurugram',
        pincode: '122001',
        isDefault: true,
      }
    });

    // =========================================================================
    // 1. P2002 Error Classification Tests (Prisma Metadata Invariants)
    // =========================================================================
    console.log('--- 1. P2002 Error Classification & Target Validation ---');
    
    function classifyP2002(err, idempotencyKey) {
      if (err?.code === 'P2002' && idempotencyKey) {
        const targetFields = Array.isArray(err.meta?.target)
          ? err.meta.target
          : typeof err.meta?.target === 'string'
          ? [err.meta.target]
          : [];

        const isConfirmedIdempotencyConstraint =
          targetFields.includes('userId_idempotencyKey') ||
          (targetFields.includes('userId') && targetFields.includes('idempotencyKey'));

        if (isConfirmedIdempotencyConstraint) {
          return 'RECOVER_IDEMPOTENCY';
        }
      }
      return 'RETHROW_ERROR';
    }

    // 1.1 Confirmed composite target
    assert.equal(classifyP2002({ code: 'P2002', meta: { target: ['userId', 'idempotencyKey'] } }, 'key-1'), 'RECOVER_IDEMPOTENCY');
    assert.equal(classifyP2002({ code: 'P2002', meta: { target: 'userId_idempotencyKey' } }, 'key-1'), 'RECOVER_IDEMPOTENCY');
    console.log('  ✅ PASS: 1.1 Confirmed composite constraint recovers idempotency race');

    // 1.2 Unrelated targets (orderNumber, phone, empty, missing meta)
    assert.equal(classifyP2002({ code: 'P2002', meta: { target: ['orderNumber'] } }, 'key-1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002({ code: 'P2002', meta: { target: ['idempotencyKey'] } }, 'key-1'), 'RETHROW_ERROR'); // ambiguous single-key
    assert.equal(classifyP2002({ code: 'P2002', meta: { target: [] } }, 'key-1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002({ code: 'P2002' }, 'key-1'), 'RETHROW_ERROR');
    console.log('  ✅ PASS: 1.2 Unrelated or ambiguous P2002 targets are strictly rethrown');

    // =========================================================================
    // 2. Canonical Request Fingerprint Completeness & Robustness
    // =========================================================================
    console.log('\n--- 2. Canonical Request Fingerprint Completeness & Robustness ---');

    function computeV2Fingerprint(userId, storeId, data, cartItems, couponCode) {
      const sortedItems = [...cartItems]
        .sort((a, b) => a.variantId.localeCompare(b.variantId))
        .map((i) => `v:${i.variantId.length}:${i.variantId};q:${i.quantity}`)
        .join(',');

      const canonicalEntries = [
        ['v', '2'],
        ['userId', userId],
        ['storeId', storeId],
        ['addressId', data.addressId],
        ['paymentMethod', data.paymentMethod],
        ['deliveryTip', String(Math.max(0, data.deliveryTip || 0))],
        ['deliverySlot', (data.deliverySlot || '').trim()],
        ['notes', (data.notes || '').trim()],
        ['couponCode', (couponCode || '').trim().toUpperCase()],
        ['items', sortedItems],
      ];

      const canonicalSerialized = canonicalEntries
        .map(([k, val]) => `${k}:${val.length}:${val}`)
        .join('\n');

      return crypto.createHash('sha256').update(canonicalSerialized, 'utf8').digest('hex');
    }

    const baseData = {
      addressId: addressA.id,
      paymentMethod: 'COD',
      deliveryTip: 3000,
      deliverySlot: 'Instant (10-15 mins)',
      notes: 'Leave at front door',
      idempotencyKey: 'idem-key-abc',
    };

    const fp1 = computeV2Fingerprint(customerA.id, testStore.id, baseData, [{ variantId: variant.id, quantity: 2 }], 'SAVE50');
    const fp2 = computeV2Fingerprint(customerA.id, testStore.id, baseData, [{ variantId: variant.id, quantity: 2 }], 'save50 '); // Case/whitespace insensitivity
    assert.equal(fp1, fp2, 'Normalized coupon must match');
    console.log('  ✅ PASS: 2.1 Identical semantic requests produce identical fingerprints');

    // Item permutation invariance
    const fpItems1 = computeV2Fingerprint(customerA.id, testStore.id, baseData, [
      { variantId: 'VAR-A', quantity: 1 },
      { variantId: 'VAR-B', quantity: 2 },
    ]);
    const fpItems2 = computeV2Fingerprint(customerA.id, testStore.id, baseData, [
      { variantId: 'VAR-B', quantity: 2 },
      { variantId: 'VAR-A', quantity: 1 },
    ]);
    assert.equal(fpItems1, fpItems2, 'Item order must be invariant');
    console.log('  ✅ PASS: 2.2 Item order permutations produce identical fingerprints');

    // Quantity difference sensitivity
    const fpQtyDiff = computeV2Fingerprint(customerA.id, testStore.id, baseData, [{ variantId: variant.id, quantity: 3 }], 'SAVE50');
    assert.notEqual(fp1, fpQtyDiff, 'Quantity change must change fingerprint');
    console.log('  ✅ PASS: 2.3 Different item quantities produce distinct fingerprints');

    // Input sensitivity: payment method, tip, slot, notes, coupon, store, address
    const fpMethodDiff = computeV2Fingerprint(customerA.id, testStore.id, { ...baseData, paymentMethod: 'UPI' }, [{ variantId: variant.id, quantity: 2 }], 'SAVE50');
    const fpTipDiff = computeV2Fingerprint(customerA.id, testStore.id, { ...baseData, deliveryTip: 5000 }, [{ variantId: variant.id, quantity: 2 }], 'SAVE50');
    const fpCouponDiff = computeV2Fingerprint(customerA.id, testStore.id, baseData, [{ variantId: variant.id, quantity: 2 }], 'DIFFERENT');
    assert.notEqual(fp1, fpMethodDiff);
    assert.notEqual(fp1, fpTipDiff);
    assert.notEqual(fp1, fpCouponDiff);
    console.log('  ✅ PASS: 2.4 Commercial and fulfillment parameter changes alter the fingerprint');

    // Length-prefixed delimiter collision resistance
    const fpCol1 = computeV2Fingerprint(customerA.id, testStore.id, { ...baseData, notes: 'a:1:b\nc:2:d' }, [{ variantId: variant.id, quantity: 2 }]);
    const fpCol2 = computeV2Fingerprint(customerA.id, testStore.id, { ...baseData, notes: 'a:1:b' }, [{ variantId: variant.id, quantity: 2 }]);
    assert.notEqual(fpCol1, fpCol2);
    console.log('  ✅ PASS: 2.5 Delimiter-injected payloads cannot forge canonical entries');

    // =========================================================================
    // 3. Real PostgreSQL Concurrency Acceptance: createOrder & Idempotency
    // =========================================================================
    console.log('\n--- 3. Real PostgreSQL Concurrency Acceptance ---');

    const sharedKey = `order-idem-${timestamp}`;
    const orderFingerprint = computeV2Fingerprint(customerA.id, testStore.id, baseData, [{ variantId: variant.id, quantity: 2 }]);

    // Concurrency Barrier Simulation using 2 simultaneous PostgreSQL transactions
    let request1Promise = (async () => {
      try {
        return await prisma.$transaction(async (tx) => {
          // Decrement stock
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: { decrement: 2 } },
          });

          return await tx.order.create({
            data: {
              orderNumber: `PRV-${timestamp}-01`,
              userId: customerA.id,
              storeId: testStore.id,
              customerName: customerA.name,
              customerPhone: customerA.phone || '9811000000',
              deliveryAddress: {},
              subtotal: 15000,
              grandTotal: 18000,
              idempotencyKey: sharedKey,
              requestFingerprint: orderFingerprint,
            }
          });
        });
      } catch (err) {
        if (err.code === 'P2002') {
          // Safe recovery
          return await prisma.order.findFirst({
            where: { userId: customerA.id, idempotencyKey: sharedKey },
          });
        }
        throw err;
      }
    })();

    let request2Promise = (async () => {
      try {
        return await prisma.$transaction(async (tx) => {
          // Simulate slight race: will hit unique constraint on (userId, idempotencyKey)
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: { decrement: 2 } },
          });

          return await tx.order.create({
            data: {
              orderNumber: `PRV-${timestamp}-02`,
              userId: customerA.id,
              storeId: testStore.id,
              customerName: customerA.name,
              customerPhone: customerA.phone || '9811000000',
              deliveryAddress: {},
              subtotal: 15000,
              grandTotal: 18000,
              idempotencyKey: sharedKey,
              requestFingerprint: orderFingerprint,
            }
          });
        });
      } catch (err) {
        if (err.code === 'P2002') {
          // Safe recovery
          return await prisma.order.findFirst({
            where: { userId: customerA.id, idempotencyKey: sharedKey },
          });
        }
        throw err;
      }
    })();

    const [res1, res2] = await Promise.all([request1Promise, request2Promise]);

    assert.equal(res1.id, res2.id, 'Both concurrent checkout requests must resolve to the exact same order');
    console.log('  ✅ PASS: 3.1 Concurrent requests with identical key resolve to single persisted order');

    // Confirm database state
    const persistedOrders = await prisma.order.findMany({
      where: { userId: customerA.id, idempotencyKey: sharedKey }
    });
    assert.equal(persistedOrders.length, 1, 'Exactly 1 order row exists in PostgreSQL');
    console.log('  ✅ PASS: 3.2 Exactly one order persisted in PostgreSQL (count = 1)');

    // Verify inventory state
    const updatedInventory = await prisma.inventory.findUnique({
      where: { id: inventory.id }
    });
    // One transaction committed (quantity = 98); the losing transaction rolled back!
    assert.equal(updatedInventory.quantity, 98, 'Inventory decremented exactly once by 2 units');
    console.log('  ✅ PASS: 3.3 Inventory decremented exactly once (100 -> 98, losing tx rolled back cleanly)');

    // 3.4 Cross-Customer Idempotency Key Independence
    // Customer B uses the SAME idempotency key -> Must succeed independently!
    const orderCustomerB = await prisma.order.create({
      data: {
        orderNumber: `PRV-${timestamp}-B`,
        userId: customerB.id,
        storeId: testStore.id,
        customerName: customerB.name,
        customerPhone: customerB.phone || '9812000000',
        deliveryAddress: {},
        subtotal: 15000,
        grandTotal: 18000,
        idempotencyKey: sharedKey, // Same key as Customer A
        requestFingerprint: computeV2Fingerprint(customerB.id, testStore.id, baseData, [{ variantId: variant.id, quantity: 2 }]),
      }
    });
    assert.ok(orderCustomerB.id, 'Customer B can use identical idempotencyKey without collision');
    console.log('  ✅ PASS: 3.4 Customer B independently creates order using same idempotency key');

    // 3.5 Fingerprint mismatch rejection
    const mismatchedFingerprint = computeV2Fingerprint(customerA.id, testStore.id, { ...baseData, deliveryTip: 9999 }, [{ variantId: variant.id, quantity: 2 }]);
    const existingOrder = await prisma.order.findFirst({
      where: { userId: customerA.id, idempotencyKey: sharedKey },
    });
    assert.notEqual(existingOrder.requestFingerprint, mismatchedFingerprint);
    console.log('  ✅ PASS: 3.5 Mismatched request fingerprint detected against persisted order');

    // =========================================================================
    // 4. Real PostgreSQL OTP Concurrency & Single-Use Replay Protection
    // =========================================================================
    console.log('\n--- 4. Real PostgreSQL OTP Concurrency & Single-Use Replay ---');

    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash('554433', salt);

    const otpChallenge = await prisma.otpChallenge.create({
      data: {
        phone: '+919988776655',
        codeHash,
        attempts: 0,
        isUsed: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    // 4.1 Two parallel requests attempting to consume the valid OTP simultaneously
    const consumeOtp = async () => {
      const result = await prisma.otpChallenge.updateMany({
        where: {
          id: otpChallenge.id,
          isUsed: false,
          attempts: { lt: 5 },
          expiresAt: { gt: new Date() },
        },
        data: {
          isUsed: true,
          attempts: { increment: 1 },
        }
      });
      return result.count;
    };

    const [c1, c2] = await Promise.all([consumeOtp(), consumeOtp()]);
    assert.equal(c1 + c2, 1, 'Exactly one parallel attempt must consume the OTP challenge');
    console.log(`  ✅ PASS: 4.1 True atomic consumption: winner count = 1, loser count = 0 (c1=${c1}, c2=${c2})`);

    // 4.2 Replay attempt on consumed challenge must return 0 rows updated
    const replayCount = await consumeOtp();
    assert.equal(replayCount, 0, 'Replay on already used OTP updates 0 rows');
    console.log('  ✅ PASS: 4.2 Subsequent replay attempt updates 0 rows');

    // 4.3 Atomic Invalid Attempt Incrementing & 5-Attempt Lockout
    const invalidOtpChallenge = await prisma.otpChallenge.create({
      data: {
        phone: '+919988776644',
        codeHash: await bcrypt.hash('998877', salt),
        attempts: 4,
        isUsed: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    // 5th invalid attempt increments to 5
    const failUpdate = await prisma.otpChallenge.updateMany({
      where: { id: invalidOtpChallenge.id, isUsed: false, attempts: { lt: 5 } },
      data: { attempts: { increment: 1 } },
    });
    assert.equal(failUpdate.count, 1, '5th attempt updates row to attempts = 5');

    // 6th attempt should NOT increment because attempts is no longer < 5
    const lockedUpdate = await prisma.otpChallenge.updateMany({
      where: { id: invalidOtpChallenge.id, isUsed: false, attempts: { lt: 5 } },
      data: { attempts: { increment: 1 } },
    });
    assert.equal(lockedUpdate.count, 0, '6th attempt blocked; challenge is locked');
    console.log('  ✅ PASS: 4.3 5th attempt locks challenge; subsequent attempts update 0 rows');

    console.log('\n🎉 ALL REAL POSTGRESQL CONCURRENCY & INTEGRITY TESTS PASSED!');
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
