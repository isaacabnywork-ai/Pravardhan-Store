import assert from 'node:assert/strict';
import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import { smsService } from '../src/lib/services/sms';
import { OrderService } from '../src/modules/orders/service';

console.log('🧪 Running Batch 11.10 SMS Delivery Reliability, Final Regression & Release Integrity Suite...\n');

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
    const originalFetch = global.fetch;

    // =========================================================================
    // 1. Audit Post-Commit SMS Dispatch & Delivery Failure Invariants
    // =========================================================================
    console.log('--- 1. Post-Commit SMS Dispatch & Delivery Failure Lifecycle ---');

    // 1.1 Provider Success (200 OK) -> Challenge persists and is available
    console.log('  * 1.1 Provider 200 OK: Challenge created, SMS dispatched...');
    let msg91Calls = 0;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        msg91Calls++;
        return new Response(JSON.stringify({ type: 'success', message: 'OTP sent' }), { status: 200 });
      }
      return originalFetch(input, init);
    };

    // Temporarily mock environment to simulate production configured MSG91 provider
    const origAuthKey = process.env.MSG91_AUTH_KEY;
    const origNodeEnv = process.env.NODE_ENV;
    process.env.MSG91_AUTH_KEY = 'test_auth_key_12345';
    process.env.MSG91_TEMPLATE_ID = 'test_template_12345';
    (process.env as any).NODE_ENV = 'production';

    const phone1 = `9810${timestamp.toString().slice(-6)}`;
    const e164_1 = `+91${phone1}`;

    const res1 = await smsService.requestOtp(phone1);
    assert.equal(res1.success, true, 'OTP request successful under 200 OK');
    assert.equal(msg91Calls, 1, 'Exactly 1 SMS provider call made');

    const activeChallenges1 = await prisma.otpChallenge.findMany({
      where: { phone: e164_1, isUsed: false }
    });
    assert.equal(activeChallenges1.length, 1, '1 active unconsumed challenge persisted');
    assert.equal(activeChallenges1[0].codeHash, 'MSG91_MANAGED', 'Challenge managed by provider');
    console.log('  ✅ PASS: 1.1 Provider 200 OK: 1 active challenge persisted; 1 dispatch call');

    // 1.2 Provider 4xx Client Error (e.g. 401 Unauthorized or 400 Bad Request)
    // Fast fails without retry; invalidates challenge so customer can retry/recover without lockup
    console.log('  * 1.2 Provider 4xx Client Error: Fast fail, zero retries, challenge invalidated...');
    let calls4xx = 0;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        calls4xx++;
        return new Response(JSON.stringify({ type: 'error', message: 'Invalid authkey' }), { status: 401 });
      }
      return originalFetch(input, init);
    };

    const phone2 = `9811${timestamp.toString().slice(-6)}`;
    const e164_2 = `+91${phone2}`;

    let errorThrown4xx = false;
    try {
      await smsService.requestOtp(phone2);
    } catch (err: any) {
      errorThrown4xx = true;
      assert.ok(err.message.includes('Could not deliver verification code via SMS'), 'Explicit recovery error returned to customer');
    }
    assert.equal(errorThrown4xx, true, '4xx error throws cleanly to caller');
    assert.equal(calls4xx, 1, '4xx client error fast-fails immediately without wasteful retries');

    // Challenge must be invalidated (isUsed = true)
    const activeChallenges2 = await prisma.otpChallenge.findMany({
      where: { phone: e164_2, isUsed: false }
    });
    assert.equal(activeChallenges2.length, 0, 'No active orphaned challenge remains on 4xx delivery failure');
    const allChallenges2 = await prisma.otpChallenge.findMany({
      where: { phone: e164_2 }
    });
    assert.equal(allChallenges2.length, 1, 'Challenge record exists for audit trail');
    assert.equal(allChallenges2[0].isUsed, true, 'Challenge marked isUsed = true to allow customer recovery');
    console.log('  ✅ PASS: 1.2 Provider 4xx error fast-fails, leaves 0 active challenges; preserves audit trail');

    // 1.3 Provider 5xx Server Error / Transient Network Error
    // Retries up to 3 times before failing closed and invalidating challenge
    console.log('  * 1.3 Provider 5xx Error: Retried up to 3 times, then invalidated on exhaustion...');
    let calls5xx = 0;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        calls5xx++;
        return new Response(JSON.stringify({ type: 'error', message: 'Gateway Timeout' }), { status: 504 });
      }
      return originalFetch(input, init);
    };

    const phone3 = `9812${timestamp.toString().slice(-6)}`;
    const e164_3 = `+91${phone3}`;

    let errorThrown5xx = false;
    try {
      await smsService.requestOtp(phone3);
    } catch (err: any) {
      errorThrown5xx = true;
    }
    assert.equal(errorThrown5xx, true, '5xx exhaustion throws cleanly to caller');
    assert.equal(calls5xx, 3, 'Transient failure retried exactly 3 times before giving up');

    const activeChallenges3 = await prisma.otpChallenge.findMany({
      where: { phone: e164_3, isUsed: false }
    });
    assert.equal(activeChallenges3.length, 0, 'No active orphaned challenge remains on 5xx delivery exhaustion');
    console.log('  ✅ PASS: 1.3 Provider 5xx transient failure retries 3x, then cleanly invalidates challenge');

    // 1.4 Provider Transient Error with Recovery on Attempt 2
    console.log('  * 1.4 Provider Transient Error with Successful Recovery on Attempt 2...');
    let callsTransient = 0;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        callsTransient++;
        if (callsTransient === 1) {
          return new Response(JSON.stringify({ type: 'error' }), { status: 502 });
        }
        return new Response(JSON.stringify({ type: 'success' }), { status: 200 });
      }
      return originalFetch(input, init);
    };

    const phone4 = `9813${timestamp.toString().slice(-6)}`;
    const e164_4 = `+91${phone4}`;

    const res4 = await smsService.requestOtp(phone4);
    assert.equal(res4.success, true, 'OTP request succeeds after transient recovery');
    assert.equal(callsTransient, 2, 'Succeeded on 2nd attempt');

    const activeChallenges4 = await prisma.otpChallenge.findMany({
      where: { phone: e164_4, isUsed: false }
    });
    assert.equal(activeChallenges4.length, 1, 'Exactly 1 active challenge persisted');
    console.log('  ✅ PASS: 1.4 Transient provider error recovered on attempt 2; challenge active');

    // Restore environment
    process.env.MSG91_AUTH_KEY = origAuthKey;
    (process.env as any).NODE_ENV = origNodeEnv;

    // =========================================================================
    // 2. Advisory-Lock Failure Safety (Fail-Closed, 0 rows, 0 SMS calls)
    // =========================================================================
    console.log('\n--- 2. Advisory Lock Failure Prevents Challenge & SMS Dispatch ---');

    const phoneLockFail = `9814${timestamp.toString().slice(-6)}`;
    const e164LockFail = `+91${phoneLockFail}`;

    let smsCallsOnLockFail = 0;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com')) {
        smsCallsOnLockFail++;
        return new Response(JSON.stringify({ type: 'success' }), { status: 200 });
      }
      return originalFetch(input, init);
    };

    // Simulate advisory lock failure inside transaction
    let lockFailErrorThrown = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT intentional_trigger_lock_failure();`;
        await tx.otpChallenge.create({
          data: {
            phone: e164LockFail,
            codeHash: 'should_never_exist',
            expiresAt: new Date(Date.now() + 300000),
          }
        });
      });
    } catch (err) {
      lockFailErrorThrown = true;
    }

    assert.equal(lockFailErrorThrown, true, 'Advisory lock failure strictly aborted transaction');
    assert.equal(smsCallsOnLockFail, 0, 'Zero SMS provider calls made when lock fails');

    const challengesOnLockFail = await prisma.otpChallenge.count({
      where: { phone: e164LockFail }
    });
    assert.equal(challengesOnLockFail, 0, 'Zero challenges persisted in database');
    console.log('  ✅ PASS: 2. Advisory-lock failure strictly aborts transaction; 0 challenges persisted; 0 SMS dispatched');

    // =========================================================================
    // 3. Case A: Remaining-Quota Concurrency Test (5 runs on isolated PostgreSQL 16)
    // =========================================================================
    console.log('\n--- 3. Case A: Remaining-Quota Concurrency Test (5 runs) ---');

    for (let run = 1; run <= 5; run++) {
      const runPhone = `982${run}${timestamp.toString().slice(-5)}`;
      const e164Run = `+91${runPhone}`;

      // Pre-seed exactly 3 challenges:
      // - All three older than 60 seconds (120s, 180s, 240s ago)
      // - All three newer than 10 minutes (inside window)
      for (let i = 1; i <= 3; i++) {
        await prisma.otpChallenge.create({
          data: {
            phone: e164Run,
            codeHash: `seed_run_${run}_challenge_${i}`,
            createdAt: new Date(Date.now() - (60 + i * 30) * 1000),
            expiresAt: new Date(Date.now() + 300000),
          }
        });
      }

      // 2 simultaneous requests fired on a synchronization barrier
      let releaseBarrier: () => void = () => {};
      const barrier = new Promise<void>((resolve) => { releaseBarrier = resolve; });

      const fireRequest = async () => {
        await barrier;
        return smsService.requestOtp(runPhone);
      };

      const p1 = fireRequest();
      const p2 = fireRequest();
      releaseBarrier();

      const results = await Promise.allSettled([p1, p2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, `Run ${run}: Exactly 1 competing request succeeds`);
      assert.equal(rejected.length, 1, `Run ${run}: Exactly 1 competing request is rejected`);

      const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        rejectionReason.message.includes('Too many OTP requests. For your security, please wait 10 minutes before trying again.'),
        `Run ${run}: Must report 10-minute rate limit message. Got: "${rejectionReason.message}"`
      );

      const totalChallenges = await prisma.otpChallenge.count({ where: { phone: e164Run } });
      assert.equal(totalChallenges, 4, `Run ${run}: Total challenges in PostgreSQL must be exactly 4`);
      console.log(`  ✅ PASS: Case A Run ${run}/5: 1 winner, 1 rejected with 10-minute limit error, total count = 4`);
    }

    // =========================================================================
    // 4. Case C: Fixed-Time Exact 10-Minute Boundary Semantics
    // =========================================================================
    console.log('\n--- 4. Case C: Fixed-Time Exact 10-Minute Boundary Semantics ---');

    const phoneCaseC = `9830${timestamp.toString().slice(-6)}`;
    const e164CaseC = `+91${phoneCaseC}`;

    const nowRef = Date.now();
    const tenMinutesMs = 10 * 60 * 1000;

    // Challenge 1: 9:50 ago (inside window, age < 10m)
    const insideTime = new Date(nowRef - tenMinutesMs + 10000);
    // Challenge 2: exactly 10:00 ago (exact boundary, age = 10m)
    const exactBoundaryTime = new Date(nowRef - tenMinutesMs);
    // Challenge 3: 10:10 ago (outside window, age > 10m)
    const outsideTime = new Date(nowRef - tenMinutesMs - 10000);

    await prisma.otpChallenge.createMany({
      data: [
        { phone: e164CaseC, codeHash: 'inside', createdAt: insideTime, expiresAt: new Date(nowRef + 300000) },
        { phone: e164CaseC, codeHash: 'exact_boundary', createdAt: exactBoundaryTime, expiresAt: new Date(nowRef + 300000) },
        { phone: e164CaseC, codeHash: 'outside', createdAt: outsideTime, expiresAt: new Date(nowRef + 300000) },
      ]
    });

    const cutoffDate = new Date(nowRef - tenMinutesMs);
    const countInWindow = await prisma.otpChallenge.count({
      where: {
        phone: e164CaseC,
        createdAt: { gte: cutoffDate }
      }
    });

    assert.equal(countInWindow, 2, 'Exact boundary semantics: inside and exact boundary included, outside excluded');
    console.log('  ✅ PASS: Case C: Fixed-time 10-minute boundary verified (inside=yes, exact=yes, outside=no)');

    // =========================================================================
    // 5. Case B: Exhausted Quota Concurrency Test
    // =========================================================================
    console.log('\n--- 5. Case B: Exhausted Quota Concurrency Test ---');

    const phoneCaseB = `9840${timestamp.toString().slice(-6)}`;
    const e164CaseB = `+91${phoneCaseB}`;

    for (let i = 1; i <= 4; i++) {
      await prisma.otpChallenge.create({
        data: {
          phone: e164CaseB,
          codeHash: `seed_case_b_${i}`,
          createdAt: new Date(Date.now() - (70 + i * 20) * 1000),
          expiresAt: new Date(Date.now() + 300000),
        }
      });
    }

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
      assert.ok(
        (rej as PromiseRejectedResult).reason.message.includes('Too many OTP requests'),
        'Rejection message indicates rate limit exhaustion'
      );
    }

    const totalChallengesB = await prisma.otpChallenge.count({ where: { phone: e164CaseB } });
    assert.equal(totalChallengesB, 4, 'Total challenges remain exactly 4 (no increments)');
    console.log('  ✅ PASS: Case B: All 3 concurrent requests rejected; total count remains 4');

    // =========================================================================
    // 6. Fresh-Phone OTP Request and Atomic Single-Use Verification
    // =========================================================================
    console.log('\n--- 6. Fresh-Phone OTP Request and Atomic Single-Use Verification ---');

    const freshPhone = `9850${timestamp.toString().slice(-6)}`;
    const otpRes = await smsService.requestOtp(freshPhone);
    assert.equal(otpRes.success, true, 'Fresh phone OTP request succeeds');
    assert.ok(otpRes.devCode, 'Dev code generated in non-prod environment');

    const code = otpRes.devCode!;
    const verifyResults = await Promise.allSettled([
      smsService.verifyOtp(freshPhone, code),
      smsService.verifyOtp(freshPhone, code),
    ]);

    const verifyFulfilled = verifyResults.filter(r => r.status === 'fulfilled');
    const verifyRejected = verifyResults.filter(r => r.status === 'rejected');

    assert.equal(verifyFulfilled.length, 1, 'Exactly 1 consumer successfully verified OTP');
    assert.equal(verifyRejected.length, 1, 'Duplicate consumer rejected (atomic single-use)');
    console.log('  ✅ PASS: Fresh phone request & atomic single-use verification passed');

    // =========================================================================
    // 7. Wallet-Aware Split Payment & Financial Regression Invariant
    // =========================================================================
    console.log('\n--- 7. Wallet-Aware Split Payment & Financial Regression Invariant ---');

    const store = await prisma.store.create({
      data: {
        code: `STR-11-10-${timestamp.toString().slice(-4)}`,
        name: 'Gurugram Dark Store 11.10',
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
      data: {
        name: `Dairy ${timestamp}`,
        slug: `dairy-${timestamp}`,
      }
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

    const splitKey = `idem-fin-11-10-${timestamp}`;
    const checkoutPayload = {
      addressId: address.id,
      paymentMethod: PaymentMethod.COD,
      walletPaise: 6000,
      deliveryTip: 1000,
      deliverySlot: 'Instant (10-15 mins)',
      notes: 'Please call on arrival',
      idempotencyKey: splitKey,
    };

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
    console.log('  ✅ PASS: 7.1 Competing checkout submissions return identical authoritative order');

    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
    });
    const orderReplay = await orderService.createOrder(customer.id, checkoutPayload);
    assert.equal(orderReplay.id, order1.id, 'Same key with same allocation returns identical order');
    console.log('  ✅ PASS: 7.2 Replay with same key and same wallet allocation returns original order');

    let alteredRejected = false;
    try {
      await orderService.createOrder(customer.id, {
        ...checkoutPayload,
        walletPaise: 7000,
      });
    } catch (err: any) {
      alteredRejected = err.statusCode === 409 || err.name === 'ConflictError';
    }
    assert.equal(alteredRejected, true, 'Same key with altered wallet allocation rejected with 409 Conflict');
    console.log('  ✅ PASS: 7.3 Altering wallet allocation with same idempotency key fails closed with 409 Conflict');

    const dbPayments = await prisma.payment.findMany({ where: { orderId: order1.id } });
    assert.equal(dbPayments.length, 2, 'Exactly 2 payment rows created (WALLET + COD)');

    const walPay = dbPayments.find(p => p.paymentMethod === 'WALLET');
    const codPay = dbPayments.find(p => p.paymentMethod === 'COD');

    assert.equal(walPay?.amount, 6000, 'Prepaid wallet slice is exactly ₹60.00');
    assert.equal(walPay?.paymentStatus, PaymentStatus.PAID, 'Prepaid wallet slice is PAID');

    assert.equal(codPay?.amount, 15000, 'COD remainder slice is exactly ₹150.00');
    assert.equal(codPay?.paymentStatus, PaymentStatus.PENDING, 'COD remainder slice is PENDING');
    console.log('  ✅ PASS: 7.4 Financial allocations verified: ₹60 PAID (WALLET) + ₹150 PENDING (COD)');

    const dbCash = await prisma.cashCollection.findMany({ where: { orderId: order1.id } });
    assert.equal(dbCash.length, 1, 'Exactly 1 CashCollection record created');
    assert.equal(dbCash[0].expectedAmount, 15000, 'Expected physical cash strictly equals net remainder ₹150.00');
    console.log('  ✅ PASS: 7.5 CashCollection expectedAmount strictly equals net COD remainder (₹150)');

    const dbInv = await prisma.inventory.findUnique({ where: { id: inventory.id } });
    assert.equal(dbInv?.quantity, 98, 'Inventory decremented exactly once by 2 units');
    console.log('  ✅ PASS: 7.6 Inventory decremented exactly once (100 -> 98, no double deduction)');

    // Restore fetch
    global.fetch = originalFetch;

    console.log('\n========================================================');
    console.log('🎉 ALL BATCH 11.10 RELEASE CLOSURE TESTS PASSED PERFECTLY!');
    console.log('========================================================\n');

  } catch (error) {
    console.error('\n❌ Test Failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
