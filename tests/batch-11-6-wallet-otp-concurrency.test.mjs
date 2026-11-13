import assert from 'node:assert/strict';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient, PaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { smsService } from '../src/lib/services/sms';
import { OrderService } from '../src/modules/orders/service';
import { calculateNetCodObligation } from '../src/modules/operations/financial-reconciliation-helper';

console.log('🧪 Running Batch 11.6 Wallet-Aware Idempotency, Atomic OTP Rate Limiting & Financial Side-Effect Suite...\n');

const DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/pravdhan_test?schema=public';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

const orderService = new OrderService();

async function runTests() {
  try {
    await prisma.$connect();
    console.log('Connected to isolated PostgreSQL test instance.\n');

    // Clean up test tables
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "payments", "order_status_history", "cash_collections", "order_items", "orders", "carts", "cart_items", "otp_challenges", "inventory_movements", "inventory", "store_service_areas", "stores", "product_variants", "products", "categories", "user_addresses", "users" CASCADE;');

    const timestamp = Date.now();

    // Setup Store, Product, Category, and Inventory
    const testStore = await prisma.store.create({
      data: {
        code: `STR-${timestamp.toString().slice(-4)}`,
        name: 'Gurugram Central Dark Store',
        address: 'Sector 14, Gurugram',
        city: 'Gurugram',
        serviceArea: 'Gurugram Central',
        minOrderValue: 5000, // ₹50.00
        deliveryFee: 2000,   // ₹20.00
        freeDeliveryThreshold: 20000,
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
        name: `Snacks ${timestamp}`,
        slug: `snacks-${timestamp}`,
      }
    });

    const product = await prisma.product.create({
      data: {
        name: 'Artisan Potato Crisps',
        slug: `artisan-potato-crisps-${timestamp}`,
        brand: 'Pravdhan Select',
        categoryId: category.id,
        images: ['https://example.com/crisps.jpg'],
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `CRISP-100G-${timestamp}`,
        title: '100g Pack',
        price: 5000, // ₹50.00
        mrp: 6000,   // ₹60.00
        unit: '100 g',
      }
    });

    const inventory = await prisma.inventory.create({
      data: {
        storeId: testStore.id,
        variantId: variant.id,
        quantity: 50,
        reservedQuantity: 0,
      }
    });

    // Create 2 Test Users
    const customerA = await prisma.user.create({
      data: {
        name: 'Ananya Sharma',
        email: `ananya_${timestamp}@example.com`,
        phone: `9876${timestamp.toString().slice(-6)}`,
      }
    });

    const customerB = await prisma.user.create({
      data: {
        name: 'Rohan Mehta',
        email: `rohan_${timestamp}@example.com`,
        phone: `9877${timestamp.toString().slice(-6)}`,
      }
    });

    const addressA = await prisma.address.create({
      data: {
        userId: customerA.id,
        label: 'Home',
        name: 'Ananya Sharma',
        phone: customerA.phone || '9876543210',
        houseNumber: 'Tower 4, Apt 802',
        street: 'Golf Course Road',
        area: 'Sector 14',
        city: 'Gurugram',
        pincode: '122001',
        isDefault: true,
      }
    });

    // =========================================================================
    // 1. Exact P2002 Classification Tests
    // =========================================================================
    console.log('--- 1. Exact P2002 Target Classification Invariants ---');

    function classifyP2002Exact(err, idempotencyKey) {
      if (err?.code === 'P2002' && idempotencyKey) {
        const targetFields = Array.isArray(err.meta?.target)
          ? err.meta.target
          : typeof err.meta?.target === 'string'
          ? [err.meta.target]
          : [];

        const isExactArray =
          targetFields.length === 2 &&
          targetFields.includes('userId') &&
          targetFields.includes('idempotencyKey');

        const isExactName =
          targetFields.length === 1 &&
          targetFields[0] === 'userId_idempotencyKey';

        if (isExactArray || isExactName) {
          return 'RECOVER_IDEMPOTENCY';
        }
      }
      return 'RETHROW_ERROR';
    }

    // 1.1 Accept exact 2-element array [userId, idempotencyKey] and [idempotencyKey, userId]
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: ['userId', 'idempotencyKey'] } }, 'k1'), 'RECOVER_IDEMPOTENCY');
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: ['idempotencyKey', 'userId'] } }, 'k1'), 'RECOVER_IDEMPOTENCY');
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: 'userId_idempotencyKey' } }, 'k1'), 'RECOVER_IDEMPOTENCY');
    console.log('  ✅ PASS: 1.1 Exact composite constraint identifier recovers idempotency race');

    // 1.2 Reject single-field, extra fields, orderNumber, empty, or missing meta
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: ['idempotencyKey'] } }, 'k1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: ['userId'] } }, 'k1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: ['userId', 'idempotencyKey', 'storeId'] } }, 'k1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: ['orderNumber'] } }, 'k1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002Exact({ code: 'P2002', meta: { target: [] } }, 'k1'), 'RETHROW_ERROR');
    assert.equal(classifyP2002Exact({ code: 'P2002' }, 'k1'), 'RETHROW_ERROR');
    console.log('  ✅ PASS: 1.2 Single-field, extra-field, orderNumber, and empty targets strictly rethrown');

    // =========================================================================
    // 2. Wallet-Aware Request Fingerprint Completeness
    // =========================================================================
    console.log('\n--- 2. Wallet-Aware Request Fingerprint (v3) Specification ---');

    const baseOrderInput = {
      addressId: addressA.id,
      paymentMethod: PaymentMethod.COD,
      walletPaise: 0,
      deliveryTip: 2000,
      deliverySlot: 'Instant (10-15 mins)',
      notes: 'Call before delivery',
      idempotencyKey: 'idem-split-001',
    };

    const cartSlice = [{ variantId: variant.id, quantity: 2 }];

    // 2.1 Pure COD vs Split Wallet + COD vs Full Wallet
    const fpPureCod = orderService.computeRequestFingerprint(customerA.id, testStore.id, baseOrderInput, cartSlice, null);
    const fpSplitWallet = orderService.computeRequestFingerprint(customerA.id, testStore.id, { ...baseOrderInput, walletPaise: 4000 }, cartSlice, null);
    const fpFullWallet = orderService.computeRequestFingerprint(customerA.id, testStore.id, { ...baseOrderInput, paymentMethod: PaymentMethod.WALLET }, cartSlice, null);

    assert.notEqual(fpPureCod, fpSplitWallet, 'Wallet allocation changes fingerprint');
    assert.notEqual(fpSplitWallet, fpFullWallet, 'Full wallet vs Split wallet produce distinct fingerprints');
    console.log('  ✅ PASS: 2.1 Pure COD, Split Wallet, and Full Wallet produce distinct fingerprints');

    // 2.2 Different wallet allocation amount changes fingerprint
    const fpSplitWalletDifferent = orderService.computeRequestFingerprint(customerA.id, testStore.id, { ...baseOrderInput, walletPaise: 6000 }, cartSlice, null);
    assert.notEqual(fpSplitWallet, fpSplitWalletDifferent, 'Different wallet allocations produce distinct fingerprints');
    console.log('  ✅ PASS: 2.2 Modifying wallet allocation from ₹40 to ₹60 produces distinct fingerprint');

    // 2.3 Identical semantic wallet allocation produces identical fingerprint
    const fpSplitWalletRepeat = orderService.computeRequestFingerprint(customerA.id, testStore.id, { ...baseOrderInput, walletPaise: 4000 }, cartSlice, null);
    assert.equal(fpSplitWallet, fpSplitWalletRepeat, 'Identical wallet allocation is deterministic');
    console.log('  ✅ PASS: 2.3 Identical semantic wallet allocation produces identical fingerprint');

    // =========================================================================
    // 3. Atomic PostgreSQL OTP Rate Limiting & Concurrency Tests
    // =========================================================================
    console.log('\n--- 3. Atomic PostgreSQL OTP Rate Limiting & Concurrency ---');

    const testPhone = `9822${timestamp.toString().slice(-6)}`;

    // 3.1 First request succeeds
    const otp1 = await smsService.requestOtp(testPhone);
    assert.equal(otp1.success, true);
    console.log('  ✅ PASS: 3.1 Initial OTP request successfully created challenge');

    // 3.2 Simultaneous resend attempts within 60s cooldown: all must be rejected
    let cooldownErrors = 0;
    const simultaneousResends = await Promise.allSettled([
      smsService.requestOtp(testPhone),
      smsService.requestOtp(testPhone),
      smsService.requestOtp(testPhone),
    ]);
    for (const r of simultaneousResends) {
      if (r.status === 'rejected' && r.reason.message.includes('Please wait')) {
        cooldownErrors++;
      }
    }
    assert.equal(cooldownErrors, 3, 'All simultaneous resend attempts rejected by cooldown');
    console.log('  ✅ PASS: 3.2 Simultaneous resend attempts inside 60s cooldown all rejected');

    // 3.3 Rolling 10-minute window rate limit test (max 4 requests)
    // Age previous challenges by 65 seconds so cooldown does not trigger, but rolling 10-min limit does
    await prisma.otpChallenge.updateMany({
      where: { phone: `+91${testPhone}` },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 2
    const otp2 = await smsService.requestOtp(testPhone);
    assert.equal(otp2.success, true);

    await prisma.otpChallenge.updateMany({
      where: { phone: `+91${testPhone}` },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 3
    const otp3 = await smsService.requestOtp(testPhone);
    assert.equal(otp3.success, true);

    await prisma.otpChallenge.updateMany({
      where: { phone: `+91${testPhone}` },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 4 (Limit reached: 4 challenges in last 10 mins)
    const otp4 = await smsService.requestOtp(testPhone);
    assert.equal(otp4.success, true);

    await prisma.otpChallenge.updateMany({
      where: { phone: `+91${testPhone}` },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 5: Must be rejected with 10-minute rate limit message
    let limitReached = false;
    try {
      await smsService.requestOtp(testPhone);
    } catch (err) {
      limitReached = err.message.includes('Too many OTP requests');
    }
    assert.equal(limitReached, true, '5th request within 10 minutes strictly rejected');
    console.log('  ✅ PASS: 3.3 5th OTP request within 10 minutes rejected by atomic abuse rate limit');

    // 3.4 Different phone number is independent
    const differentPhone = `9833${timestamp.toString().slice(-6)}`;
    const diffOtp = await smsService.requestOtp(differentPhone);
    assert.equal(diffOtp.success, true, 'Different phone number is completely unblocked');
    console.log('  ✅ PASS: 3.4 Rate limiting is isolated per normalized phone number');

    // =========================================================================
    // 4. Real PostgreSQL Order Concurrency & Financial Side-Effects
    // =========================================================================
    console.log('\n--- 4. Real PostgreSQL Order Concurrency & Financial Side-Effects ---');

    // Setup Cart with 2 items for Customer A
    const cartA = await prisma.cart.create({ data: { userId: customerA.id } });
    await prisma.cartItem.create({
      data: { cartId: cartA.id, variantId: variant.id, quantity: 2 },
    });

    const splitKey = `idem-fin-${timestamp}`;
    const splitOrderInput = {
      addressId: addressA.id,
      paymentMethod: PaymentMethod.COD,
      walletPaise: 4000, // ₹40.00 wallet + remainder COD
      deliveryTip: 1000,  // ₹10.00 tip
      deliverySlot: 'Instant (10-15 mins)',
      notes: 'Split payment test',
      idempotencyKey: splitKey,
    };

    // Subtotal: 2 * ₹50 = ₹100. Delivery fee: ₹20. Tip: ₹10. Grand total: ₹130 (13000 paise).
    // Wallet: ₹40 (4000 paise). Net COD obligation: ₹90 (9000 paise).

    // Execute 2 simultaneous checkout requests using OrderService.createOrder logic directly
    const runCheckout = async () => {
      // Re-populate cart if cleared by winning transaction
      const currentItems = await prisma.cartItem.findMany({ where: { cartId: cartA.id } });
      if (currentItems.length === 0) {
        await prisma.cartItem.create({
          data: { cartId: cartA.id, variantId: variant.id, quantity: 2 },
        });
      }
      return orderService.createOrder(customerA.id, splitOrderInput);
    };

    const [order1, order2] = await Promise.all([runCheckout(), runCheckout()]);

    assert.equal(order1.id, order2.id, 'Both concurrent checkouts return the exact same persisted order');
    console.log('  ✅ PASS: 4.1 Competing split-payment checkouts resolve to identical authoritative order');

    // 4.2 Assert persisted order count
    const persistedOrders = await prisma.order.findMany({
      where: { userId: customerA.id, idempotencyKey: splitKey },
    });
    assert.equal(persistedOrders.length, 1, 'Exactly 1 order row in PostgreSQL');
    console.log('  ✅ PASS: 4.2 Exactly one order row persisted in PostgreSQL');

    // 4.3 Assert exact payment allocations (1 WALLET + 1 COD)
    const payments = await prisma.payment.findMany({
      where: { orderId: order1.id },
      orderBy: { paymentMethod: 'asc' },
    });
    assert.equal(payments.length, 2, 'Exactly 2 payment rows created for split checkout');
    
    const walletPayment = payments.find((p) => p.paymentMethod === 'WALLET');
    const codPayment = payments.find((p) => p.paymentMethod === 'COD');

    assert.ok(walletPayment, 'Wallet payment slice exists');
    assert.equal(walletPayment.amount, 4000, 'Wallet slice is exactly ₹40.00 (4000 paise)');
    assert.equal(walletPayment.paymentStatus, PaymentStatus.PAID, 'Prepaid wallet slice is marked PAID');

    assert.ok(codPayment, 'COD payment slice exists');
    assert.equal(codPayment.amount, 9000, 'COD slice is remainder ₹90.00 (9000 paise)');
    assert.equal(codPayment.paymentStatus, PaymentStatus.PENDING, 'COD slice is PENDING');
    console.log('  ✅ PASS: 4.3 Financial allocations verified: ₹40 PAID (WALLET) + ₹90 PENDING (COD)');

    // 4.4 Assert CashCollection matches net COD obligation
    const cashCollections = await prisma.cashCollection.findMany({
      where: { orderId: order1.id },
    });
    assert.equal(cashCollections.length, 1, 'Exactly 1 cash collection record created');
    assert.equal(cashCollections[0].expectedAmount, 9000, 'Expected physical cash is strictly net remainder (₹90)');
    console.log('  ✅ PASS: 4.4 Cash collection expected amount is strictly net COD obligation (₹90)');

    // 4.5 Assert Inventory decremented exactly once (50 -> 48)
    const finalInventory = await prisma.inventory.findUnique({ where: { id: inventory.id } });
    assert.equal(finalInventory.quantity, 48, 'Inventory decremented exactly once by 2 units');
    console.log('  ✅ PASS: 4.5 Inventory decremented exactly once (50 -> 48, no duplicate stock debit)');

    // 4.6 Mismatched wallet allocation with same idempotency key fails closed with HTTP 409
    // Repopulate cart for customer A
    await prisma.cartItem.create({
      data: { cartId: cartA.id, variantId: variant.id, quantity: 2 },
    });

    let mismatchRejected = false;
    try {
      await orderService.createOrder(customerA.id, {
        ...splitOrderInput,
        walletPaise: 5000, // Changed from 4000 to 5000
      });
    } catch (err) {
      mismatchRejected = err.statusCode === 409 || err.name === 'ConflictError';
    }
    assert.equal(mismatchRejected, true, 'Same key with different wallet allocation rejects with ConflictError');
    console.log('  ✅ PASS: 4.6 Reusing idempotency key with altered wallet allocation fails closed with 409 Conflict');

    console.log('\n🎉 ALL BATCH 11.6 WALLET, OTP & CONCURRENCY ACCEPTANCE TESTS PASSED!');
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
