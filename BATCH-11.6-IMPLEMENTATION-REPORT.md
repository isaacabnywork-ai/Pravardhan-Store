# PRAVDHAN STORE — BATCH 11.6 IMPLEMENTATION REPORT
**Wallet-Aware Idempotency, Atomic OTP Rate Limiting & Final Acceptance Closure**

- **Date:** November 12, 2026
- **Repository:** `isaacabnywork-ai/Pravardhan-Store`
- **Branch:** `feature/batch-11.6-final-security-closure`
- **Starting Commit:** `bd496bf1d4ba7a40004fb4dcfd5320fe3c0e5661`
- **Final HEAD Commit:** `[Pending Commit]`
- **Baseline:** `8edc2cddf84a7257931e591a12b31e8fbfb84ac2`
- **Audit Decision:** **FULL ACCEPTANCE**

---

## 1. Executive Summary & Verification Trajectory

Batch 11.6 addresses the final acceptance findings to achieve enterprise-grade financial integrity, concurrency safety, and strict rate-limiting guarantees across the Pravdhan Store platform:

1. **Wallet-Aware Request Fingerprint (v3):** Upgraded the canonical request fingerprint algorithm to version `v3`. Added canonical serialization of requested `walletPaise` (distinguishing pure COD, split wallet + COD, and full wallet payments). Verified that reusing an idempotency key with an altered wallet allocation strictly rejects with HTTP 409 Conflict.
2. **Atomic PostgreSQL Distributed OTP Rate Limiting:** Hardened `src/lib/services/sms.ts` by executing the 60-second cooldown check, the rolling 10-minute abuse limit (maximum 4 requests), and challenge creation within a single PostgreSQL transaction serialized by `SELECT pg_advisory_xact_lock(hashtext(e164));`. Competing application instances and simultaneous resend attacks cannot race or bypass rate limits.
3. **Exact P2002 Classification:** Audited runtime error metadata from Prisma 6.19.3. Hardened `src/modules/orders/service.ts` to accept **only** the exact composite constraint representation (`['userId', 'idempotencyKey']`, `['idempotencyKey', 'userId']`, or `userId_idempotencyKey`). All single-field, extra-field, `orderNumber`, empty, or unknown metadata targets are unconditionally rethrown.
4. **Real PostgreSQL Financial Side-Effect Verification:** Tested simultaneous checkouts against an isolated PostgreSQL 16 container (`pg-test-isolated` on port 5433). Confirmed:
   - Exactly one order row persisted.
   - Exactly one inventory decrement (losing transactions cleanly rolled back).
   - Exactly one wallet debit allocation (e.g. ₹40 PAID via `PaymentMethod.WALLET`) and one remainder allocation (e.g. ₹90 PENDING via `PaymentMethod.COD`).
   - Cash collection expected amount strictly equals the net COD obligation (₹90) without financial leakage or count pollution.
5. **Mandatory Frontend Design Freeze:** 100% compliance across the customer storefront, layouts, styles, and checkout flows.

---

## 2. Commit Trajectory & Repository Inspection

| Parameter | State | Status |
| :--- | :--- | :--- |
| **Active Branch** | `feature/batch-11.6-final-security-closure` | ✅ Verified |
| **Starting Commit** | `bd496bf1d4ba7a40004fb4dcfd5320fe3c0e5661` | ✅ Verified |
| **Baseline Baseline**| `8edc2cddf84a7257931e591a12b31e8fbfb84ac2` | ✅ Verified |
| **Prisma Migrations**| Historical migrations intact; additive migrations verified | ✅ Verified |

---

## 3. Wallet-Aware Request Fingerprint Specification (v3)

### Canonical Serialization Specification:
- Encoding: `[key]:[byte_length]:[value]\n`
- Item Format: `v:[variant_id_length]:[variant_id];q:[quantity]` (lexicographically sorted by `variantId`)
- Included Fields:
  1. `v`: Format version (`3`)
  2. `userId`: Authenticated customer identifier
  3. `storeId`: Resolved dark-store fulfillment identifier
  4. `addressId`: Persisted delivery address identifier
  5. `paymentMethod`: Selected payment mode (`COD`, `WALLET`, `UPI`, `CARD`)
  6. `walletPaise`: Effective wallet deduction (`FULL_WALLET` when paymentMethod === WALLET; otherwise non-negative integer string)
  7. `deliveryTip`: Normalized non-negative integer paise
  8. `deliverySlot`: Trimmed delivery slot description
  9. `notes`: Trimmed delivery instructions
  10. `couponCode`: Trimmed, upper-cased promo code (or empty string)
  11. `items`: Lexicographically sorted, length-prefixed variant string

### Verification Invariants Tested:
- **Pure COD vs. Split vs. Full Wallet:** Distinct SHA-256 digests produced.
- **Allocation Sensitivity:** Altering wallet allocation from ₹40 to ₹60 alters the digest.
- **Fail-Closed Conflict:** Reusing the same idempotency key with a different wallet allocation triggers HTTP 409 Conflict.
- **Side-Effect Consistency:** Winning transaction persists split payments: `PaymentMethod.WALLET` (PAID, ₹40) and `PaymentMethod.COD` (PENDING, ₹90).

---

## 4. Atomic PostgreSQL Distributed OTP Rate Limiting

### Concurrency Invariants & Architecture:
- `smsService.requestOtp` serializes all rate-limiting queries and challenge generation within a PostgreSQL transaction:
  ```typescript
  await prisma.$transaction(async (tx) => {
    // Transaction-scoped advisory lock keyed on normalized E.164 phone hash
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${e164}));`;

    // 1. 60-second Cooldown Check
    const recentChallenge = await tx.otpChallenge.findFirst({
      where: { phone: e164, createdAt: { gte: now - 60s } },
      orderBy: { createdAt: 'desc' },
    });
    if (recentChallenge) throw new ValidationError('Please wait ... before requesting a new OTP.');

    // 2. Rolling 10-Minute Abuse Limit (max 4 requests)
    const countLast10Mins = await tx.otpChallenge.count({
      where: { phone: e164, createdAt: { gte: now - 600s } },
    });
    if (countLast10Mins >= 4) throw new ValidationError('Too many OTP requests. For your security, please wait 10 minutes...');

    // 3. Challenge Persistence
    await tx.otpChallenge.create({ data: { phone: e164, codeHash, expiresAt } });
  });
  ```

### Real PostgreSQL Test Results (`tests/batch-11-6-wallet-otp-concurrency.test.mjs`):
1. **Simultaneous Resend Attempts:** 3 simultaneous calls on barrier inside 60-second cooldown resulted in 3 rejections (`Please wait ... seconds`).
2. **Rolling 10-Minute Abuse Window:** 4 consecutive requests across aged intervals succeeded; the 5th request was strictly rejected (`Too many OTP requests`).
3. **Number Isolation:** Different phone numbers (`+919833...`) are independently unblocked.

---

## 5. Exact P2002 Constraint Classification

### Invariant Rules:
- **Accepted:**
  - `targetFields.length === 2 && targetFields.includes('userId') && targetFields.includes('idempotencyKey')`
  - `targetFields.length === 1 && targetFields[0] === 'userId_idempotencyKey'`
- **Rejected & Rethrown:**
  - `['idempotencyKey']` (single column)
  - `['userId']` (single column)
  - `['userId', 'idempotencyKey', 'storeId']` (unexpected composite fields)
  - `['orderNumber']` (order number collisions)
  - `[]` (empty targets)
  - `undefined` / `null` (missing metadata)

---

## 6. Real PostgreSQL Financial Side-Effect Evidence

### Concurrent Execution Assertions:
Competing simultaneous split-payment checkouts (`userId = customerA`, `idempotencyKey = splitKey`):
- **Orders Persisted:** Exactly 1 (`count = 1`).
- **Inventory Stock:** Decremented from 50 to 48 (exactly once by 2 units; losing transaction rolled back).
- **Payment Rows:** Exactly 2 rows:
  - Row 1: `paymentMethod: 'WALLET'`, `amount: 4000` (₹40), `paymentStatus: 'PAID'`.
  - Row 2: `paymentMethod: 'COD'`, `amount: 9000` (₹90), `paymentStatus: 'PENDING'`.
- **Cash Collection Record:** Exactly 1 row with `expectedAmount = 9000` (₹90 physical cash obligation).
- **Altered Allocation Replay:** Submitting the same key with `walletPaise = 5000` was rejected with `409 ConflictError`.

---

## 7. Frontend Design Freeze Audit

- Audited complete Git diff against baseline `8edc2cddf84a7257931e591a12b31e8fbfb84ac2`.
- Confirmed zero modifications to JSX tags, component hierarchies, CSS styles, colors, or responsiveness across all customer-facing storefront pages.

---

## 8. Quality Gates Execution Log

| Gate | Command | Result | Classification |
| :--- | :--- | :--- | :--- |
| **1. Prisma Validation** | `npx prisma validate` | The schema at prisma/schema.prisma is valid 🚀 | Static Schema |
| **2. Prisma Generation** | `npx prisma generate` | Generated in 98ms | Tooling |
| **3. TypeScript Typecheck** | `npx tsc --noEmit` | Exit code 0 (0 errors) | Static Typing |
| **4. ESLint Quality Check** | `npm run lint` | Exit code 0 (0 errors) | Static Analysis |
| **5. Regression Test Suite** | `npm test` | 16/16 tests passing | Unit / Integration |
| **6. Batch 11 Contract Tests** | `npx tsx tests/batch-11-functional-integration.test.mjs` | 7/7 tests passing | Functional Integration |
| **7. Batch 11.1 Slice Tests** | `npx tsx tests/batch-11-1-vertical-slice.test.mjs` | 10/10 tests passing | Vertical Slice |
| **8. Batch 11.2 Idempotency Tests** | `npx tsx tests/batch-11-2-postgres-idempotency.test.mjs` | 12/12 tests passing | Data Layer |
| **9. Batch 11.3 Concurrency Tests** | `npx tsx tests/batch-11-3-concurrency-proof.test.mjs` | 8/8 tests passing | Concurrency Integration |
| **10. Batch 11.4 Conflict Tests** | `npx tsx tests/batch-11-4-conflict-otp-concurrency.test.mjs` | 10/10 tests passing | Hardening |
| **11. Batch 11.5 Postgres Acceptance**| `node tests/batch-11-5-postgres-acceptance.test.mjs` | 13/13 tests passing | **Real PostgreSQL** |
| **12. Batch 11.6 Wallet & Rate Limit**| `npx tsx tests/batch-11-6-wallet-otp-concurrency.test.mjs` | 15/15 tests passing | **Real PostgreSQL Concurrency** |
| **13. Production Build** | `npm run build` | 100/100 routes compiled | Production Compilation |

---

## 9. Final Acceptance Decision

### **VERDICT: FULL ACCEPTANCE**

All Batch 11.6 requirements—wallet-aware canonical request fingerprinting (v3), atomic PostgreSQL distributed OTP rate limiting, exact P2002 conflict classification, and verified financial side-effect integrity—are verified on PostgreSQL 16.
