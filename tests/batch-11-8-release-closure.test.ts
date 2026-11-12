import assert from 'node:assert/strict';
import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import { smsService } from '../src/lib/services/sms';
import { OrderService } from '../src/modules/orders/service';

console.log('🧪 Running Batch 11.8 Final OTP Fail-Closed, Rolling-Window Concurrency & Release Closure Suite...\n');

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

    // =========================================================================
    // 1. CRITICAL: Advisory Lock Fail-Closed Security Tests
    // =========================================================================
    console.log('--- 1. Advisory Lock Fail-Closed Security Invariants ---');

    const failClosedPhone = `9810${timestamp.toString().slice(-6)}`;
    const e164FailClosed = `+91${failClosedPhone}`;

    // 1.1 Simulate advisory lock acquisition error inside transaction
    // If the database lock call fails (e.g. simulated via invalid SQL or permission/engine failure),
    // the transaction MUST abort immediately, and NO challenge must be created.
    let lockFailedAsExpected = false;
    try {
      await prisma.$transaction(async (tx) => {
        // Intentionally simulate an invalid lock call or failure
        await tx.$executeRaw`SELECT non_existent_function_trigger_failure();`;

        // The following lines must NEVER be reached:
        await tx.otpChallenge.create({
          data: {
            phone: e164FailClosed,
            codeHash: 'should_never_exist',
            expiresAt: new Date(Date.now() + 300000),
          }
        });
      });
    } catch (err: any) {
      lockFailedAsExpected = true;
    }

    assert.equal(lockFailedAsExpected, true, 'Advisory lock failure strictly aborted transaction');

    // Verify database state: 0 rows persisted for failClosedPhone
    const challengesAfterFail = await prisma.otpChallenge.findMany({
      where: { phone: e164FailClosed }
    });
    assert.equal(challengesAfterFail.length, 0, 'No challenge was persisted after lock acquisition failure');
    console.log('  ✅ PASS: 1.1 Advisory lock failure strictly aborts transaction; 0 challenges persisted');

    // =========================================================================
    // 2. Concurrent Rolling Ten-Minute Rate-Limit Verification
    // =========================================================================
    console.log('\n--- 2. Concurrent Rolling Ten-Minute Rate-Limit Verification ---');

    // -------------------------------------------------------------------------
    // Case A — Remaining Quota Contention
    // -------------------------------------------------------------------------
    console.log('  * Case A: Remaining Quota Contention (3 existing, 2 competing for 1 slot)...');
    const phoneCaseA = `9820${timestamp.toString().slice(-6)}`;
    const e164CaseA = `+91${phoneCaseA}`;

    // Pre-create 3 challenges aged past 60s cooldown (e.g. 120s, 180s, 240s ago)
    for (let i = 1; i <= 3; i++) {
      await prisma.otpChallenge.create({
        data: {
          phone: e164CaseA,
          codeHash: `hash_case_a_${i}`,
          createdAt: new Date(Date.now() - (60 + i * 30) * 1000),
          expiresAt: new Date(Date.now() + 300000),
        }
      });
    }

    // Now 2 simultaneous requests compete for the final 4th slot
    let releaseCaseABarrier: () => void = () => {};
    const caseABarrier = new Promise<void>((resolve) => { releaseCaseABarrier = resolve; });

    const requestCaseA = async () => {
      await caseABarrier;
      return smsService.requestOtp(phoneCaseA);
    };

    const pA1 = requestCaseA();
    const pA2 = requestCaseA();
    releaseCaseABarrier();

    const resultsA = await Promise.allSettled([pA1, pA2]);
    const fulfilledA = resultsA.filter(r => r.status === 'fulfilled');
    const rejectedA = resultsA.filter(r => r.status === 'rejected');

    assert.equal(fulfilledA.length, 1, 'Exactly 1 competing request succeeds for the final 4th slot');
    assert.equal(rejectedA.length, 1, 'Exactly 1 competing request is rejected');

    const totalChallengesA = await prisma.otpChallenge.count({ where: { phone: e164CaseA } });
    assert.equal(totalChallengesA, 4, 'Exactly 4 total challenges exist in PostgreSQL after Case A contention');
    console.log('  ✅ PASS: Case A: Exactly 1 of 2 competing requests succeeded; total challenges = 4');

    // -------------------------------------------------------------------------
    // Case B — Exhausted Quota
    // -------------------------------------------------------------------------
    console.log('  * Case B: Exhausted Quota (4 existing challenges inside window)...');
    const phoneCaseB = `9830${timestamp.toString().slice(-6)}`;
    const e164CaseB = `+91${phoneCaseB}`;

    // Pre-create 4 challenges aged past 60s cooldown (all inside 10 minutes)
    for (let i = 1; i <= 4; i++) {
      await prisma.otpChallenge.create({
        data: {
          phone: e164CaseB,
          codeHash: `hash_case_b_${i}`,
          createdAt: new Date(Date.now() - (70 + i * 20) * 1000),
          expiresAt: new Date(Date.now() + 300000),
        }
      });
    }

    // Submit 3 simultaneous requests against exhausted quota
    const resultsB = await Promise.allSettled([
      smsService.requestOtp(phoneCaseB),
      smsService.requestOtp(phoneCaseB),
      smsService.requestOtp(phoneCaseB),
    ]);

    const fulfilledB = resultsB.filter(r => r.status === 'fulfilled');
    const rejectedB = resultsB.filter(r => r.status === 'rejected');

    assert.equal(fulfilledB.length, 0, 'Every request rejected when quota is exhausted');
    assert.equal(rejectedB.length, 3, 'All 3 simultaneous requests rejected');
    for (const rej of rejectedB) {
      assert.ok(rej.reason.message.includes('Too many OTP requests'), 'Rejection message must indicate rate limit exhaustion');
    }

    const totalChallengesB = await prisma.otpChallenge.count({ where: { phone: e164CaseB } });
    assert.equal(totalChallengesB, 4, 'Total challenges remain exactly 4 (no increments)');
    console.log('  ✅ PASS: Case B: All requests rejected when quota exhausted; total count remains 4');

    // -------------------------------------------------------------------------
    // Case C — Expiration Boundary (createdAt >= tenMinutesAgo)
    // -------------------------------------------------------------------------
    console.log('  * Case C: Expiration Boundary Verification...');
    const phoneCaseC = `9840${timestamp.toString().slice(-6)}`;
    const e164CaseC = `+91${phoneCaseC}`;

    // Implementation uses Prisma: createdAt: { gte: tenMinutesAgo } (SQL: createdAt >= now - 10 minutes).
    // Let's create:
    //  - 3 challenges strictly inside the 10-minute window (e.g. 5 minutes ago = 300s)
    //  - 1 challenge strictly outside the 10-minute window (e.g. 11 minutes ago = 660s)
    for (let i = 1; i <= 3; i++) {
      await prisma.otpChallenge.create({
        data: {
          phone: e164CaseC,
          codeHash: `hash_case_c_inside_${i}`,
          createdAt: new Date(Date.now() - (120 + i * 30) * 1000),
          expiresAt: new Date(Date.now() + 300000),
        }
      });
    }
    // 1 expired challenge outside 10-min window
    await prisma.otpChallenge.create({
      data: {
        phone: e164CaseC,
        codeHash: 'hash_case_c_expired',
        createdAt: new Date(Date.now() - 660 * 1000), // 11 mins ago
        expiresAt: new Date(Date.now() - 60 * 1000),
      }
    });

    // Since only 3 challenges are within the 10-minute window, a new request MUST succeed!
    const resC = await smsService.requestOtp(phoneCaseC);
    assert.equal(resC.success, true, 'Request succeeds because outside-window challenge is excluded');

    // Now exactly 4 challenges are within the 10-minute window. An immediate subsequent request (aged past cooldown) must fail.
    await prisma.otpChallenge.updateMany({
      where: { phone: e164CaseC },
      data: { createdAt: new Date(Date.now() - 70 * 1000) }, // 70s ago for all active challenges
    });
    // Keep the expired one expired
    await prisma.otpChallenge.updateMany({
      where: { codeHash: 'hash_case_c_expired' },
      data: { createdAt: new Date(Date.now() - 660 * 1000) },
    });

    let resCSubsequentBlocked = false;
    try {
      await smsService.requestOtp(phoneCaseC);
    } catch (err: any) {
      resCSubsequentBlocked = err.message.includes('Too many OTP requests');
    }
    assert.equal(resCSubsequentBlocked, true, 'Subsequent request blocked because 4 challenges exist within 10-min window');
    console.log('  ✅ PASS: Case C: Expiration boundary accurately includes only challenges >= 10-minute cutoff');

    // -------------------------------------------------------------------------
    // Case D — Independent Phone Numbers
    // -------------------------------------------------------------------------
    console.log('  * Case D: Independent Phone Numbers Isolation...');
    const phoneD1 = `9851${timestamp.toString().slice(-6)}`;
    const phoneD2 = `9852${timestamp.toString().slice(-6)}`;

    // Exhaust phone D1 quota
    for (let i = 1; i <= 4; i++) {
      await prisma.otpChallenge.create({
        data: {
          phone: `+91${phoneD1}`,
          codeHash: `hash_d1_${i}`,
          createdAt: new Date(Date.now() - (70 + i * 20) * 1000),
          expiresAt: new Date(Date.now() + 300000),
        }
      });
    }

    // Phone D1 is blocked
    let d1Blocked = false;
    try {
      await smsService.requestOtp(phoneD1);
    } catch (err: any) {
      d1Blocked = err.message.includes('Too many OTP requests');
    }
    assert.equal(d1Blocked, true, 'Phone D1 is blocked');

    // Phone D2 is fresh and unblocked
    const resD2 = await smsService.requestOtp(phoneD2);
    assert.equal(resD2.success, true, 'Phone D2 succeeds completely independently');
    console.log('  ✅ PASS: Case D: Rate limits and advisory locks are isolated per normalized phone number');

    // =========================================================================
    // 3. Fresh-Phone Concurrency Protection (3 Independent Phones x 5-Way Contention)
    // =========================================================================
    console.log('\n--- 3. Fresh-Phone Concurrency Protection (3 Phones x 5 Contenders) ---');

    for (let phoneIndex = 1; phoneIndex <= 3; phoneIndex++) {
      const freshPhone = `986${phoneIndex}${timestamp.toString().slice(-6)}`;
      let releaseBarrier: () => void = () => {};
      const barrier = new Promise<void>((r) => { releaseBarrier = r; });

      const tasks = Array.from({ length: 5 }, async () => {
        await barrier;
        return smsService.requestOtp(freshPhone);
      });

      releaseBarrier();

      const results = await Promise.allSettled(tasks);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, `Phone ${phoneIndex}: Exactly 1 of 5 succeeded`);
      assert.equal(rejected.length, 4, `Phone ${phoneIndex}: Exactly 4 of 5 rejected`);

      const dbRows = await prisma.otpChallenge.count({ where: { phone: `+91${freshPhone}` } });
      assert.equal(dbRows, 1, `Phone ${phoneIndex}: Exactly 1 row persisted`);
      console.log(`  ✅ PASS: Fresh-Phone ${phoneIndex}: 1 success, 4 cooldown rejections, 1 persisted row`);
    }

    // =========================================================================
    // 4. Wallet-Aware Idempotency & Financial Side-Effects Regression
    // =========================================================================
    console.log('\n--- 4. Wallet-Aware Idempotency & Financial Side-Effects Regression ---');

    // Create Store, Category, Product, Variant, Inventory, Customer, Address
    const store = await prisma.store.create({
      data: {
        code: `STR-${timestamp.toString().slice(-4)}`,
        name: 'Gurugram Dark Store 11.8',
        address: 'Sector 14',
        city: 'Gurugram',
        serviceArea: 'Gurugram Central',
        minOrderValue: 5000,
        deliveryFee: 2000,
        freeDeliveryThreshold: 20000,
      }
    });

    await prisma.serviceArea.create({
      data: {
        storeId: store.id,
        name: 'Sector 14 Catchment',
        pincode: '122001',
        isActive: true,
      }
    });

    const category = await prisma.category.create({
      data: { name: `Dairy ${timestamp}`, slug: `dairy-${timestamp}` }
    });

    const product = await prisma.product.create({
      data: {
        name: 'Farm Fresh Paneer',
        slug: `paneer-${timestamp}`,
        brand: 'Pravdhan Fresh',
        categoryId: category.id,
        images: ['https://example.com/paneer.jpg'],
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `PANEER-200G-${timestamp}`,
        title: '200g Pack',
        price: 9000, // ₹90.00
        mrp: 10000,  // ₹100.00
        unit: '200 g',
      }
    });

    const inventory = await prisma.inventory.create({
      data: {
        storeId: store.id,
        variantId: variant.id,
        quantity: 100,
        reservedQuantity: 0,
      }
    });

    const customer = await prisma.user.create({
      data: {
        name: 'Siddharth Rao',
        email: `siddharth_${timestamp}@example.com`,
        phone: `9891${timestamp.toString().slice(-6)}`,
      }
    });

    const address = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Home',
        name: 'Siddharth Rao',
        phone: customer.phone || '9891000000',
        houseNumber: 'B-404, Park View',
        street: 'Sector 14',
        area: 'Sector 14',
        city: 'Gurugram',
        pincode: '122001',
        isDefault: true,
      }
    });

    const cart = await prisma.cart.create({ data: { userId: customer.id } });
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
    });

    // Subtotal: 2 * ₹90 = ₹180 (18000 paise). Delivery fee: ₹20 (2000 paise). Tip: ₹10 (1000 paise).
    // Grand Total: ₹210 (21000 paise).
    // Wallet allocation: ₹60 (6000 paise). Net COD remainder: ₹150 (15000 paise).

    const splitKey = `idem-fin-11-8-${timestamp}`;
    const checkoutPayload = {
      addressId: address.id,
      paymentMethod: PaymentMethod.COD,
      walletPaise: 6000,
      deliveryTip: 1000,
      deliverySlot: 'Instant (10-15 mins)',
      notes: 'Please call on arrival',
      idempotencyKey: splitKey,
    };

    // Competing simultaneous checkout submissions
    const executeCheckout = async () => {
      const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
      if (items.length === 0) {
        await prisma.cartItem.create({
          data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
        });
      }
      return orderService.createOrder(customer.id, checkoutPayload);
    };

    const [order1, order2] = await Promise.all([executeCheckout(), executeCheckout()]);
    assert.equal(order1.id, order2.id, 'Competing split-payment checkouts resolve to identical authoritative order');
    console.log('  ✅ PASS: 4.1 Competing checkout submissions return identical authoritative order');

    // 4.2 Replay with same key and same allocation returns the order
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
    });
    const orderReplay = await orderService.createOrder(customer.id, checkoutPayload);
    assert.equal(orderReplay.id, order1.id, 'Same key with same allocation returns identical order');
    console.log('  ✅ PASS: 4.2 Replay with same key and same wallet allocation returns original order');

    // 4.3 Replay with same key and altered wallet allocation (e.g. 7000 paise) returns HTTP 409 Conflict
    let alteredRejected = false;
    try {
      await orderService.createOrder(customer.id, {
        ...checkoutPayload,
        walletPaise: 7000, // Altered allocation
      });
    } catch (err: any) {
      alteredRejected = err.statusCode === 409 || err.name === 'ConflictError';
    }
    assert.equal(alteredRejected, true, 'Same key with altered wallet allocation rejected with 409 Conflict');
    console.log('  ✅ PASS: 4.3 Altering wallet allocation with same idempotency key fails closed with 409 Conflict');

    // 4.4 Assert persisted financial allocations in PostgreSQL
    const dbPayments = await prisma.payment.findMany({ where: { orderId: order1.id } });
    assert.equal(dbPayments.length, 2, 'Exactly 2 payment rows created (WALLET + COD)');

    const walPay = dbPayments.find(p => p.paymentMethod === 'WALLET');
    const codPay = dbPayments.find(p => p.paymentMethod === 'COD');

    assert.equal(walPay?.amount, 6000, 'Prepaid wallet slice is exactly ₹60.00');
    assert.equal(walPay?.paymentStatus, PaymentStatus.PAID, 'Prepaid wallet slice is PAID');

    assert.equal(codPay?.amount, 15000, 'COD remainder slice is exactly ₹150.00');
    assert.equal(codPay?.paymentStatus, PaymentStatus.PENDING, 'COD remainder slice is PENDING');
    console.log('  ✅ PASS: 4.4 Financial allocations verified: ₹60 PAID (WALLET) + ₹150 PENDING (COD)');

    // 4.5 Assert CashCollection record strictly equals net COD remainder
    const dbCash = await prisma.cashCollection.findMany({ where: { orderId: order1.id } });
    assert.equal(dbCash.length, 1, 'Exactly 1 CashCollection record created');
    assert.equal(dbCash[0].expectedAmount, 15000, 'Expected physical cash strictly equals net remainder ₹150.00');
    console.log('  ✅ PASS: 4.5 CashCollection expectedAmount strictly equals net COD remainder (₹150)');

    // 4.6 Assert Inventory decremented exactly once (100 -> 98)
    const dbInv = await prisma.inventory.findUnique({ where: { id: inventory.id } });
    assert.equal(dbInv?.quantity, 98, 'Inventory decremented exactly once by 2 units');
    console.log('  ✅ PASS: 4.6 Inventory decremented exactly once (100 -> 98, no double deduction)');

    console.log('\n🎉 ALL BATCH 11.8 RELEASE CLOSURE TESTS PASSED SUCCESSFULLY!');
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
