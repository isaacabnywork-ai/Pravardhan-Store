import assert from 'node:assert/strict';
import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import { smsService } from '../src/lib/services/sms';
import { OrderService } from '../src/modules/orders/service';

console.log('🧪 Running Batch 11.7 Final OTP Advisory Lock Verification & Release Integrity Suite...\n');

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
    // 1. PostgreSQL Advisory Lock Runtime & Release Verification
    // =========================================================================
    console.log('--- 1. PostgreSQL Advisory Lock Runtime & Release Verification ---');

    const lockPhone = '+919999888877';

    // 1.1 Verify lock is 0 before transaction
    const initialLocks = (await prisma.$queryRaw`
      SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND objid = hashtext(${lockPhone});
    `) as { count: bigint }[];
    assert.equal(Number(initialLocks[0].count), 0, 'No advisory lock exists before transaction');
    console.log('  ✅ PASS: 1.1 No advisory lock held prior to transaction execution');

    // 1.2 Verify lock is held during transaction
    let observedLockDuringTx = false;
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockPhone}));`;
      const activeLocks = (await tx.$queryRaw`
        SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND objid = hashtext(${lockPhone});
      `) as { count: bigint }[];
      observedLockDuringTx = Number(activeLocks[0].count) === 1;
    });
    assert.equal(observedLockDuringTx, true, 'Advisory lock was successfully held inside transaction');
    console.log('  ✅ PASS: 1.2 Advisory lock successfully held inside active transaction');

    // 1.3 Verify lock is automatically released after commit
    const locksAfterCommit = (await prisma.$queryRaw`
      SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND objid = hashtext(${lockPhone});
    `) as { count: bigint }[];
    assert.equal(Number(locksAfterCommit[0].count), 0, 'Advisory lock released immediately upon commit');
    console.log('  ✅ PASS: 1.3 Advisory lock automatically released upon transaction commit');

    // 1.4 Verify lock is automatically released after rollback / error
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockPhone}));`;
        throw new Error('Simulated failure triggering rollback');
      });
    } catch {}

    const locksAfterRollback = (await prisma.$queryRaw`
      SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND objid = hashtext(${lockPhone});
    `) as { count: bigint }[];
    assert.equal(Number(locksAfterRollback[0].count), 0, 'Advisory lock released immediately upon rollback');
    console.log('  ✅ PASS: 1.4 Advisory lock automatically released upon transaction rollback/error');

    // =========================================================================
    // 2. Fresh-Phone Simultaneous Request Test (5 Concurrent Requests)
    // =========================================================================
    console.log('\n--- 2. Fresh-Phone Simultaneous Request Test (5 Concurrent Requests) ---');

    for (let iteration = 1; iteration <= 3; iteration++) {
      const freshPhone = `9811${(timestamp + iteration).toString().slice(-6)}`;

      // Setup synchronization barrier
      let releaseBarrier: () => void = () => {};
      const barrierPromise = new Promise<void>((resolve) => { releaseBarrier = resolve; });

      const requestTask = async () => {
        await barrierPromise;
        return smsService.requestOtp(freshPhone);
      };

      const promises = [
        requestTask(),
        requestTask(),
        requestTask(),
        requestTask(),
        requestTask(),
      ];

      // Release all 5 requests simultaneously
      releaseBarrier();

      const results = await Promise.allSettled(promises);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, `Iteration ${iteration}: Exactly 1 of 5 simultaneous requests must succeed`);
      assert.equal(rejected.length, 4, `Iteration ${iteration}: Exactly 4 of 5 simultaneous requests must be rejected`);

      for (const rej of rejected) {
        assert.ok(
          rej.reason.message.includes('Please wait'),
          `Iteration ${iteration}: Rejection must be caused by resend cooldown`
        );
      }

      // Assert database state: exactly 1 OTP challenge row created in PostgreSQL
      const persistedChallenges = await prisma.otpChallenge.findMany({
        where: { phone: `+91${freshPhone}` },
      });
      assert.equal(persistedChallenges.length, 1, `Iteration ${iteration}: Exactly 1 challenge row persisted in PostgreSQL`);
      console.log(`  ✅ PASS: 2.${iteration} Iteration ${iteration}: Exactly 1 success, 4 rejections, and 1 row persisted`);
    }

    // =========================================================================
    // 3. Rolling Ten-Minute Window Test (Abuse Rate Limit & Boundary Conditions)
    // =========================================================================
    console.log('\n--- 3. Rolling Ten-Minute Window Test & Boundary Conditions ---');

    const rollingPhone = `9822${timestamp.toString().slice(-6)}`;
    const e164Rolling = `+91${rollingPhone}`;

    // Request 1: Fresh request
    const r1 = await smsService.requestOtp(rollingPhone);
    assert.equal(r1.success, true);

    // Age challenge 1 past 60s cooldown (e.g. 70s ago)
    await prisma.otpChallenge.updateMany({
      where: { phone: e164Rolling },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 2: Succeeds
    const r2 = await smsService.requestOtp(rollingPhone);
    assert.equal(r2.success, true);

    // Age all challenges past 60s cooldown
    await prisma.otpChallenge.updateMany({
      where: { phone: e164Rolling },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 3: Succeeds
    const r3 = await smsService.requestOtp(rollingPhone);
    assert.equal(r3.success, true);

    // Age all challenges past 60s cooldown
    await prisma.otpChallenge.updateMany({
      where: { phone: e164Rolling },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request 4: Succeeds (4th request in 10 mins)
    const r4 = await smsService.requestOtp(rollingPhone);
    assert.equal(r4.success, true);

    // Age all challenges past 60s cooldown but strictly within 10 minutes (e.g. 3 minutes ago)
    await prisma.otpChallenge.updateMany({
      where: { phone: e164Rolling },
      data: { createdAt: new Date(Date.now() - 180 * 1000) },
    });

    // Request 5: Must fail because 4 challenges already exist in last 10 minutes
    let r5Rejected = false;
    try {
      await smsService.requestOtp(rollingPhone);
    } catch (err: any) {
      r5Rejected = err.message.includes('Too many OTP requests');
    }
    assert.equal(r5Rejected, true, '5th request within 10 minutes strictly rejected');
    console.log('  ✅ PASS: 3.1 5th request within rolling 10-minute window rejected with rate limit message');

    // 3.2 Verify Boundary: Age challenges past 10 minutes (e.g. 11 minutes ago = 660s)
    await prisma.otpChallenge.updateMany({
      where: { phone: e164Rolling },
      data: { createdAt: new Date(Date.now() - 660 * 1000) },
    });

    // Request 6: Must succeed now because previous challenges aged out of the rolling 10-minute window
    const r6 = await smsService.requestOtp(rollingPhone);
    assert.equal(r6.success, true, 'Request succeeds after rolling window expires');
    console.log('  ✅ PASS: 3.2 Request succeeds after previous challenges age beyond 10-minute boundary');

    // =========================================================================
    // 4. Wallet Fingerprint & Financial Side-Effect Regression
    // =========================================================================
    console.log('\n--- 4. Wallet Fingerprint & Financial Side-Effect Regression ---');

    // Setup Store, Service Area, Product, Variant, Inventory, Customer, Address
    const testStore = await prisma.store.create({
      data: {
        code: `STR-${timestamp.toString().slice(-4)}`,
        name: 'Gurugram Dark Store 11.7',
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
        storeId: testStore.id,
        name: 'Sector 14 Catchment',
        pincode: '122001',
        isActive: true,
      }
    });

    const category = await prisma.category.create({
      data: { name: `Beverages ${timestamp}`, slug: `bev-${timestamp}` }
    });

    const product = await prisma.product.create({
      data: {
        name: 'Cold Pressed Valencia Orange Juice',
        slug: `orange-juice-${timestamp}`,
        brand: 'Pravdhan Fresh',
        categoryId: category.id,
        images: ['https://example.com/juice.jpg'],
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `JUICE-500ML-${timestamp}`,
        title: '500ml Bottle',
        price: 8000, // ₹80.00
        mrp: 9000,   // ₹90.00
        unit: '500 ml',
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

    const customer = await prisma.user.create({
      data: {
        name: 'Pooja Verma',
        email: `pooja_${timestamp}@example.com`,
        phone: `9899${timestamp.toString().slice(-6)}`,
      }
    });

    const address = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Home',
        name: 'Pooja Verma',
        phone: customer.phone || '9899000000',
        houseNumber: 'Villa 12',
        street: 'Heritage City',
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

    // Subtotal: 2 * ₹80 = ₹160 (16000 paise). Delivery fee: ₹20 (2000 paise). Tip: ₹10 (1000 paise).
    // Grand Total: ₹190 (19000 paise).
    // Wallet allocation: ₹50 (5000 paise). Remainder COD: ₹140 (14000 paise).

    const splitKey = `idem-reg-${timestamp}`;
    const checkoutData = {
      addressId: address.id,
      paymentMethod: PaymentMethod.COD,
      walletPaise: 5000,
      deliveryTip: 1000,
      deliverySlot: 'Instant (10-15 mins)',
      notes: 'Please ring bell',
      idempotencyKey: splitKey,
    };

    // Competing simultaneous checkout submissions
    const runOrder = async () => {
      const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
      if (items.length === 0) {
        await prisma.cartItem.create({
          data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
        });
      }
      return orderService.createOrder(customer.id, checkoutData);
    };

    const [ord1, ord2] = await Promise.all([runOrder(), runOrder()]);
    assert.equal(ord1.id, ord2.id, 'Both concurrent requests resolve to the identical order');
    console.log('  ✅ PASS: 4.1 Competing checkout submissions return identical authoritative order');

    // Assert exact persisted financial side-effects
    const dbPayments = await prisma.payment.findMany({ where: { orderId: ord1.id } });
    assert.equal(dbPayments.length, 2, 'Exactly 2 payment slices created (WALLET + COD)');

    const walPay = dbPayments.find(p => p.paymentMethod === 'WALLET');
    const codPay = dbPayments.find(p => p.paymentMethod === 'COD');

    assert.equal(walPay?.amount, 5000, 'Prepaid wallet slice is exactly ₹50.00');
    assert.equal(walPay?.paymentStatus, PaymentStatus.PAID, 'Wallet slice is marked PAID');

    assert.equal(codPay?.amount, 14000, 'COD slice is remainder ₹140.00');
    assert.equal(codPay?.paymentStatus, PaymentStatus.PENDING, 'COD slice is marked PENDING');
    console.log('  ✅ PASS: 4.2 Financial allocations verified: ₹50 PAID (WALLET) + ₹140 PENDING (COD)');

    // Assert CashCollection
    const dbCash = await prisma.cashCollection.findMany({ where: { orderId: ord1.id } });
    assert.equal(dbCash.length, 1, 'Exactly 1 CashCollection record');
    assert.equal(dbCash[0].expectedAmount, 14000, 'CashCollection expectedAmount matches remainder COD exactly');
    console.log('  ✅ PASS: 4.3 CashCollection strictly equals net COD remainder (₹140.00)');

    // Assert Stock decrement exactly once (100 -> 98)
    const dbInv = await prisma.inventory.findUnique({ where: { id: inventory.id } });
    assert.equal(dbInv?.quantity, 98, 'Inventory decremented exactly once by 2 units');
    console.log('  ✅ PASS: 4.4 Inventory decremented exactly once (100 -> 98)');

    console.log('\n🎉 ALL BATCH 11.7 FINAL ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
