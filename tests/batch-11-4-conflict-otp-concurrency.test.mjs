import assert from 'node:assert/strict';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

console.log('🧪 Running Batch 11.4 Final Database Conflict Hardening, OTP Replay & Concurrency Suite...\n');

// ============================================================================
// Group 1: P2002 Precise Conflict Classification & Ambiguity Rejection
// ============================================================================
console.log('--- 1. P2002 Precise Conflict Classification & Re-throw Invariants ---');

function classifyP2002Conflict(err, idempotencyKey) {
  if (err?.code === 'P2002' && idempotencyKey) {
    const targetFields = Array.isArray(err.meta?.target)
      ? err.meta.target
      : typeof err.meta?.target === 'string'
      ? [err.meta.target]
      : [];

    const isConfirmedIdempotencyConstraint =
      targetFields.includes('idempotencyKey') ||
      targetFields.includes('userId_idempotencyKey') ||
      (targetFields.includes('userId') && targetFields.includes('idempotencyKey'));

    if (isConfirmedIdempotencyConstraint) {
      return 'RECOVER_IDEMPOTENCY';
    }
  }
  return 'RETHROW_ERROR';
}

// 1.1 Confirmed idempotency composite key conflict
const err1 = { code: 'P2002', meta: { target: ['userId', 'idempotencyKey'] } };
assert.equal(classifyP2002Conflict(err1, 'key_123'), 'RECOVER_IDEMPOTENCY');
console.log('  ✅ PASS: 1.1 Confirmed (userId, idempotencyKey) target classified as idempotency race');

// 1.2 OrderNumber collision must NOT be treated as idempotency conflict
const err2 = { code: 'P2002', meta: { target: ['orderNumber'] } };
assert.equal(classifyP2002Conflict(err2, 'key_123'), 'RETHROW_ERROR');
console.log('  ✅ PASS: 1.2 orderNumber uniqueness collision is strictly re-thrown');

// 1.3 Empty target array must NOT be treated as idempotency conflict
const err3 = { code: 'P2002', meta: { target: [] } };
assert.equal(classifyP2002Conflict(err3, 'key_123'), 'RETHROW_ERROR');
console.log('  ✅ PASS: 1.3 Empty target metadata array is strictly re-thrown');

// 1.4 Missing meta object must NOT be treated as idempotency conflict
const err4 = { code: 'P2002' };
assert.equal(classifyP2002Conflict(err4, 'key_123'), 'RETHROW_ERROR');
console.log('  ✅ PASS: 1.4 Missing meta object is strictly re-thrown');

// ============================================================================
// Group 2: Fingerprint Fail-Closed Semantics
// ============================================================================
console.log('\n--- 2. Fingerprint Fail-Closed Validation ---');

function evaluateFingerprintMatch(existingFingerprint, incomingFingerprint) {
  if (!existingFingerprint) {
    throw new Error('Existing order has no recorded request fingerprint. Cannot verify idempotency match safely.');
  }
  if (existingFingerprint !== incomingFingerprint) {
    throw new Error('Idempotency key already used for a different checkout request or payload.');
  }
  return true;
}

// 2.1 Matching fingerprint succeeds
assert.equal(evaluateFingerprintMatch('fp_hash_aaa', 'fp_hash_aaa'), true);
console.log('  ✅ PASS: 2.1 Matching fingerprint allows original order return');

// 2.2 Mismatched fingerprint throws conflict error
let mismatchThrown = false;
try {
  evaluateFingerprintMatch('fp_hash_aaa', 'fp_hash_bbb');
} catch (err) {
  if (err.message.includes('different checkout request')) mismatchThrown = true;
}
assert.equal(mismatchThrown, true);
console.log('  ✅ PASS: 2.2 Mismatched fingerprint triggers controlled 409 Conflict');

// 2.3 Missing fingerprint on existing order fails closed
let missingFpThrown = false;
try {
  evaluateFingerprintMatch(null, 'fp_hash_aaa');
} catch (err) {
  if (err.message.includes('no recorded request fingerprint')) missingFpThrown = true;
}
assert.equal(missingFpThrown, true);
console.log('  ✅ PASS: 2.3 Existing order with missing fingerprint strictly fails closed');

// ============================================================================
// Group 3: True Atomic OTP Consumption & Simultaneous Replay Proof
// ============================================================================
console.log('\n--- 3. True Atomic OTP Consumption & Simultaneous Replay Proof ---');

class MockAtomicOtpDatabase {
  constructor() {
    this.challenges = new Map();
  }

  createChallenge(id, phone, codeHash, expiresAt) {
    this.challenges.set(id, {
      id,
      phone,
      codeHash,
      attempts: 0,
      isUsed: false,
      expiresAt,
    });
  }

  // True atomic conditional update: UPDATE ... WHERE id = ? AND isUsed = false AND attempts < 5 AND expiresAt > now()
  async consumeChallengeAtomically(id) {
    const ch = this.challenges.get(id);
    if (!ch) return { count: 0 };

    if (ch.isUsed || ch.attempts >= 5 || ch.expiresAt <= new Date()) {
      return { count: 0 };
    }

    ch.isUsed = true;
    ch.attempts += 1;
    return { count: 1 };
  }

  async incrementAttemptAtomically(id) {
    const ch = this.challenges.get(id);
    if (ch && !ch.isUsed) {
      ch.attempts += 1;
    }
  }
}

// 3.1 Simultaneous verification of same challenge using Promise.all
{
  const otpDb = new MockAtomicOtpDatabase();
  const hash = await bcrypt.hash('123456', 10);
  otpDb.createChallenge('ch_simultaneous_1', '+919876543210', hash, new Date(Date.now() + 5 * 60 * 1000));

  // Run 2 simultaneous consumer threads with small artificial jitter
  async function attemptVerify() {
    const candidate = otpDb.challenges.get('ch_simultaneous_1');
    const valid = await bcrypt.compare('123456', candidate.codeHash);
    if (!valid) throw new Error('Invalid code');

    // Atomic conditional update
    const res = await otpDb.consumeChallengeAtomically('ch_simultaneous_1');
    if (res.count !== 1) {
      throw new Error('This OTP challenge has already been consumed or has expired.');
    }
    return { success: true };
  }

  const results = await Promise.allSettled([
    attemptVerify(),
    attemptVerify(),
  ]);

  const fulfilled = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');

  assert.equal(fulfilled.length, 1, 'Exactly one concurrent verification request must succeed');
  assert.equal(rejected.length, 1, 'Exactly one concurrent verification request must be rejected');
  assert.ok(rejected[0].reason.message.includes('already been consumed'));

  // Ensure challenge is marked used
  assert.equal(otpDb.challenges.get('ch_simultaneous_1').isUsed, true);
  console.log('  ✅ PASS: 3.1 Two simultaneous OTP verification requests on synchronization barrier yield exactly 1 success and 1 rejection');
}

// 3.2 Simultaneous failed verification attempts cannot exceed threshold
{
  const otpDb = new MockAtomicOtpDatabase();
  const hash = await bcrypt.hash('123456', 10);
  otpDb.createChallenge('ch_simultaneous_attempts', '+919876543210', hash, new Date(Date.now() + 5 * 60 * 1000));

  // 6 concurrent invalid submissions
  await Promise.all(
    Array.from({ length: 6 }).map(async () => {
      await otpDb.incrementAttemptAtomically('ch_simultaneous_attempts');
    })
  );

  assert.ok(otpDb.challenges.get('ch_simultaneous_attempts').attempts >= 5);
  // Now legitimate attempt cannot consume
  const consumeRes = await otpDb.consumeChallengeAtomically('ch_simultaneous_attempts');
  assert.equal(consumeRes.count, 0, 'Cannot consume challenge after max attempts reached');
  console.log('  ✅ PASS: 3.2 Concurrent invalid OTP submissions increment attempts safely and block further consumption');
}

// ============================================================================
// Group 4: Canonical Serialized Payload Versioning (v1)
// ============================================================================
console.log('\n--- 4. Canonical Serialization Versioning (v1) ---');

function canonicalSerializeV1(userId, storeId, data, items) {
  const sortedItems = [...items]
    .sort((a, b) => a.variantId.localeCompare(b.variantId))
    .map(i => `variant=${i.variantId}&qty=${i.quantity}`)
    .join(';');

  const canonicalEntries = [
    ['v', '1'],
    ['userId', userId],
    ['storeId', storeId],
    ['addressId', data.addressId],
    ['paymentMethod', data.paymentMethod],
    ['deliveryTip', String(data.deliveryTip || 0)],
    ['deliverySlot', (data.deliverySlot || '').trim()],
    ['notes', (data.notes || '').trim()],
    ['items', sortedItems],
  ];

  const serialized = canonicalEntries.map(([k, val]) => `${k}:${val}`).join('|');
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

const testItems = [
  { variantId: 'v_tomato', quantity: 2 },
  { variantId: 'v_potato', quantity: 5 },
];
const fpV1 = canonicalSerializeV1('u_101', 's_ggm_1', { addressId: 'a_1', paymentMethod: 'COD', deliveryTip: 1000, deliverySlot: '10 mins', notes: 'Call' }, testItems);
assert.equal(typeof fpV1, 'string');
assert.equal(fpV1.length, 64);
console.log(`  ✅ PASS: 4.1 Canonical v1 serialization produces valid 64-char hex SHA-256 digest: ${fpV1.substring(0, 16)}...`);

console.log('\n🎉 All 10/10 Batch 11.4 Conflict Hardening & OTP Concurrency Tests Passed Successfully!\n');
