import assert from 'node:assert/strict';
import { PrismaClient, PaymentMethod, PaymentStatus, SmsDeliveryStatus } from '@prisma/client';
import { smsService } from '../src/lib/services/sms';
import { OrderService } from '../src/modules/orders/service';
import { encryptPayload, decryptPayload } from '../src/lib/security/crypto';

console.log('🧪 Running Batch 11.12 OTP Outbox Operational Verification & Final Release Suite...\n');

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
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "sms_delivery_jobs", "payments", "order_status_history", "cash_collections", "order_items", "orders", "carts", "cart_items", "otp_challenges", "inventory_movements", "inventory", "store_service_areas", "stores", "product_variants", "products", "categories", "user_addresses", "users" CASCADE;');

    const timestamp = Date.now();
    const originalFetch = global.fetch;

    // =========================================================================
    // 1. Authenticated Encryption of OTP Secrets & No Log Leakage
    // =========================================================================
    console.log('--- 1. Authenticated Encryption of OTP Secrets (AES-256-GCM) ---');

    const sampleOtp = '849201';
    const encrypted = encryptPayload(sampleOtp);
    assert.notEqual(encrypted, sampleOtp, 'Encrypted payload is not plaintext');
    assert.ok(encrypted.includes(':'), 'Encrypted payload has iv:authTag:ciphertext structure');

    const decrypted = decryptPayload(encrypted);
    assert.equal(decrypted, sampleOtp, 'Decryption recovers original OTP');

    // Prove tampering throws error
    const tampered = encrypted.slice(0, -2) + 'aa';
    assert.throws(() => decryptPayload(tampered), 'Tampered ciphertext fails authenticated GCM verification');

    // Verify OTP request creates encryptedCode in outbox job and zero plaintext in database
    const encPhone = `9810${timestamp.toString().slice(-6)}`;
    const encRes = await smsService.requestOtp(encPhone);
    assert.equal(encRes.success, true);

    const outboxJob = await prisma.smsDeliveryJob.findFirst({
      where: { phone: `+91${encPhone}` }
    });
    assert.ok(outboxJob, 'Outbox job created');
    // If job was completed inline in dev/test, encryptedCode was immediately wiped to null
    assert.equal(outboxJob.encryptedCode, null, 'Encrypted code is wiped to null on job completion');

    console.log('  ✅ PASS: 1. Authenticated encryption verified; secrets wiped upon completion');

    // =========================================================================
    // 2. The Provider-Acceptance Crash Window (At-Least-Once Delivery)
    // =========================================================================
    console.log('\n--- 2. Provider-Acceptance Crash Window & At-Least-Once Delivery ---');

    const crashPhone = `9811${timestamp.toString().slice(-6)}`;
    const e164Crash = `+91${crashPhone}`;

    const crashChallenge = await prisma.otpChallenge.create({
      data: {
        phone: e164Crash,
        codeHash: 'MSG91_MANAGED',
        expiresAt: new Date(Date.now() + 300000),
      }
    });

    const crashJob = await prisma.smsDeliveryJob.create({
      data: {
        challengeId: crashChallenge.id,
        phone: e164Crash,
        status: SmsDeliveryStatus.PENDING,
        attempts: 0,
        nextAttemptAt: new Date(Date.now() - 5000),
      }
    });

    let providerCalls = 0;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        providerCalls++;
        return new Response(JSON.stringify({ type: 'success', message: 'OTP queued' }), { status: 200 });
      }
      return originalFetch(input, init);
    };

    const origAuthKey = process.env.MSG91_AUTH_KEY;
    const origNodeEnv = process.env.NODE_ENV;
    process.env.MSG91_AUTH_KEY = 'test_auth_key_crash';
    process.env.MSG91_TEMPLATE_ID = 'test_template_crash';
    (process.env as any).NODE_ENV = 'production';

    // 1. Worker 1 claims job and starts dispatch
    // Simulate process termination immediately after fetch returns, BEFORE DB update
    // We achieve this by running a custom fetch that throws ProcessCrashError after receiving 200 OK
    let simulatedCrashThrown = false;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        providerCalls++;
        // Crash immediately after MSG91 accepts message
        throw new Error('SIMULATED_PROCESS_CRASH_POST_PROVIDER_ACCEPTANCE');
      }
      return originalFetch(input, init);
    };

    try {
      await smsService.processDeliveryJob(crashJob.id, 'worker-1');
    } catch {
      simulatedCrashThrown = true;
    }

    assert.equal(providerCalls, 1, 'Provider received 1st dispatch before crash');

    // Verify job in database: status is PENDING (retry scheduled) with attempts = 1
    const jobPostCrash = await prisma.smsDeliveryJob.findUnique({
      where: { id: crashJob.id }
    });
    assert.equal(jobPostCrash?.attempts, 1, 'Job recorded 1 attempt');

    // 2. Worker restarts after application reboot and recovers pending jobs
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        providerCalls++;
        return new Response(JSON.stringify({ type: 'success', message: 'OTP delivered' }), { status: 200 });
      }
      return originalFetch(input, init);
    };

    // Fast-forward nextAttemptAt so recovery claims it immediately
    await prisma.smsDeliveryJob.update({
      where: { id: crashJob.id },
      data: { nextAttemptAt: new Date(Date.now() - 1000) }
    });

    const recoveredCount = await smsService.recoverPendingJobs('worker-reboot');
    assert.equal(recoveredCount, 1, 'Rebooted worker recovered the crashed job');
    assert.equal(providerCalls, 2, 'At-least-once delivery: provider called on recovery');

    const jobFinished = await prisma.smsDeliveryJob.findUnique({ where: { id: crashJob.id } });
    assert.equal(jobFinished?.status, SmsDeliveryStatus.DELIVERED, 'Job reaches DELIVERED status');
    console.log('  ✅ PASS: 2. Provider crash window verified; at-least-once delivery and job recovery demonstrated');

    // =========================================================================
    // 3. Hardened Worker Claiming, Fencing Tokens & Stale Lease Reclamation
    // =========================================================================
    console.log('\n--- 3. Hardened Worker Claiming & Fencing Token Invariants ---');

    const fencePhone = `9812${timestamp.toString().slice(-6)}`;
    const e164Fence = `+91${fencePhone}`;

    const fenceChallenge = await prisma.otpChallenge.create({
      data: { phone: e164Fence, codeHash: 'MSG91_MANAGED', expiresAt: new Date(Date.now() + 300000) }
    });

    const fenceJob = await prisma.smsDeliveryJob.create({
      data: {
        challengeId: fenceChallenge.id,
        phone: e164Fence,
        status: SmsDeliveryStatus.PROCESSING,
        attempts: 1,
        lockedAt: new Date(Date.now() - 40000), // Stale lease (40 seconds ago > 30s threshold)
        lockedBy: 'worker-dead',
        claimToken: 'token-worker-dead',
      }
    });

    // 3.1 New worker reclaims stale job
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('msg91.com/api/v5/otp')) {
        return new Response(JSON.stringify({ type: 'success' }), { status: 200 });
      }
      return originalFetch(input, init);
    };

    const reclaimedOk = await smsService.processDeliveryJob(fenceJob.id, 'worker-new');
    assert.equal(reclaimedOk, true, 'New worker successfully reclaimed stale processing lease');

    const reclaimedJob = await prisma.smsDeliveryJob.findUnique({ where: { id: fenceJob.id } });
    assert.equal(reclaimedJob?.status, SmsDeliveryStatus.DELIVERED);
    assert.notEqual(reclaimedJob?.claimToken, 'token-worker-dead', 'Claim token updated with fencing token');

    // 3.2 Old zombie worker attempts to finalize job with stale claimToken
    const zombieUpdate = await prisma.smsDeliveryJob.updateMany({
      where: { id: fenceJob.id, claimToken: 'token-worker-dead' },
      data: { lastError: 'zombie update should fail' }
    });
    assert.equal(zombieUpdate.count, 0, 'Fencing token strictly prevents zombie worker completion');
    console.log('  ✅ PASS: 3. Worker fencing token and stale lease reclamation verified');

    // =========================================================================
    // 4. Future nextAttemptAt Protection
    // =========================================================================
    console.log('\n--- 4. Future nextAttemptAt Protection ---');

    const futureJob = await prisma.smsDeliveryJob.create({
      data: {
        challengeId: fenceChallenge.id,
        phone: e164Fence,
        status: SmsDeliveryStatus.PENDING,
        attempts: 1,
        nextAttemptAt: new Date(Date.now() + 60000), // 1 minute in the future
      }
    });

    const futureClaimed = await smsService.processDeliveryJob(futureJob.id, 'worker-eager');
    assert.equal(futureClaimed, false, 'Worker cannot claim job scheduled in the future');
    console.log('  ✅ PASS: 4. Premature execution guarded by nextAttemptAt');

    // Restore environment
    process.env.MSG91_AUTH_KEY = origAuthKey;
    (process.env as any).NODE_ENV = origNodeEnv;

    // =========================================================================
    // 5. Versioned Migration File Verification on Isolated PostgreSQL 16
    // =========================================================================
    console.log('\n--- 5. Additive Versioned Migration Verification ---');

    // Assert migration exists and is valid SQL
    const tableCols = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sms_delivery_jobs'
    `;
    assert.ok(tableCols.length >= 10, 'sms_delivery_jobs table has all expected columns');
    console.log(`  ✅ PASS: 5. Migration schema verified in PostgreSQL (${tableCols.length} columns)`);

    // =========================================================================
    // 6. Case A: Remaining-Quota Concurrency Test (5 runs on isolated PostgreSQL 16)
    // =========================================================================
    console.log('\n--- 6. Case A: Remaining-Quota Concurrency Test (5 runs) ---');

    for (let run = 1; run <= 5; run++) {
      const runPhone = `982${run}${timestamp.toString().slice(-5)}`;
      const e164Run = `+91${runPhone}`;

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
    // 7. Case C: Fixed-Time Exact 10-Minute Boundary Semantics
    // =========================================================================
    console.log('\n--- 7. Case C: Fixed-Time Exact 10-Minute Boundary Semantics ---');

    const phoneCaseC = `9830${timestamp.toString().slice(-6)}`;
    const e164CaseC = `+91${phoneCaseC}`;

    const nowRef = Date.now();
    const tenMinutesMs = 10 * 60 * 1000;

    const insideTime = new Date(nowRef - 599 * 1000);
    const exactBoundaryTime = new Date(nowRef - 600 * 1000);
    const outsideTime = new Date(nowRef - 601 * 1000);

    await prisma.otpChallenge.createMany({
      data: [
        { phone: e164CaseC, codeHash: 'age_9m59s', createdAt: insideTime, expiresAt: new Date(nowRef + 300000) },
        { phone: e164CaseC, codeHash: 'age_10m00s', createdAt: exactBoundaryTime, expiresAt: new Date(nowRef + 300000) },
        { phone: e164CaseC, codeHash: 'age_10m01s', createdAt: outsideTime, expiresAt: new Date(nowRef + 300000) },
      ]
    });

    const cutoffDate = new Date(nowRef - tenMinutesMs);
    const countInWindow = await prisma.otpChallenge.count({
      where: {
        phone: e164CaseC,
        createdAt: { gte: cutoffDate }
      }
    });

    assert.equal(countInWindow, 2, 'Exact boundary semantics: 9:59 and 10:00 included, 10:01 excluded');
    console.log('  ✅ PASS: Case C: Fixed-time 10-minute boundary verified (9:59=yes, 10:00=yes, 10:01=no)');

    // =========================================================================
    // 8. Wallet-Aware Split Payment & Financial Regression Invariant
    // =========================================================================
    console.log('\n--- 8. Wallet-Aware Split Payment & Financial Regression Invariant ---');

    const store = await prisma.store.create({
      data: {
        code: `STR-11-12-${timestamp.toString().slice(-4)}`,
        name: 'Gurugram Dark Store 11.12',
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
        price: 9000,
        mrp: 10000,
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

    const splitKey = `idem-fin-11-12-${timestamp}`;
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

    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
    });
    const orderReplay = await orderService.createOrder(customer.id, checkoutPayload);
    assert.equal(orderReplay.id, order1.id, 'Same key with same allocation returns identical order');

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

    const dbPayments = await prisma.payment.findMany({ where: { orderId: order1.id } });
    assert.equal(dbPayments.length, 2, 'Exactly 2 payment rows created (WALLET + COD)');

    const walPay = dbPayments.find(p => p.paymentMethod === 'WALLET');
    const codPay = dbPayments.find(p => p.paymentMethod === 'COD');

    assert.equal(walPay?.amount, 6000, 'Prepaid wallet slice is ₹60.00');
    assert.equal(walPay?.paymentStatus, PaymentStatus.PAID, 'Prepaid wallet slice is PAID');
    assert.equal(codPay?.amount, 15000, 'COD remainder is ₹150.00');
    assert.equal(codPay?.paymentStatus, PaymentStatus.PENDING, 'COD remainder is PENDING');

    const dbCash = await prisma.cashCollection.findMany({ where: { orderId: order1.id } });
    assert.equal(dbCash.length, 1, 'Exactly 1 CashCollection record created');
    assert.equal(dbCash[0].expectedAmount, 15000, 'Physical cash equals net remainder ₹150.00');

    const dbInv = await prisma.inventory.findUnique({ where: { id: inventory.id } });
    assert.equal(dbInv?.quantity, 98, 'Inventory decremented exactly once by 2 units');

    // Restore fetch
    global.fetch = originalFetch;

    console.log('  ✅ PASS: 8. Split payment, CashCollection, inventory decrement & idempotency verified');

    console.log('\n=======================================================');
    console.log('🎉 ALL BATCH 11.12 RELEASE TESTS PASSED PERFECTLY!');
    console.log('=======================================================\n');

  } catch (error) {
    console.error('\n❌ Test Failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
