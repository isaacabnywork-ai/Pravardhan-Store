# BATCH 9.7 — FINAL INDEPENDENT WALLET + COD FINANCIAL-INTEGRITY ACCEPTANCE AUDIT

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-9-production-hardening`  
**Audit Target HEAD Commit:** `3f445bb38851b30b7abbc70dac22ad35c96f7919` (`3f445bb`)  
**Audit Baseline Commit:** `7a8cd7cdae97a724b1550448be5594d63a87eb57` (Batch 9.4 accepted)  
**Accepted Baseline Commits:**  
- Batch 8 Accepted Baseline: `63e5b04ec79616a9924246f0cd6154083b991c13`  
- Batch 9 Implementation: `05850fe0a1dca216fe8d3635a909404281786e6d`  
- Batch 9.2 Remediation: `34086d72763d94ccec614e59a1360d0ac3495006`  
- Batch 9.4 Remediation: `7a8cd7cdae97a724b1550448be5594d63a87eb57`  
- Batch 9.6 Remediation: `3f445bb38851b30b7abbc70dac22ad35c96f7919`  
**Audit Type:** STRICT READ-ONLY INDEPENDENT AUDIT  
**Date:** November 10, 2026  

---

## 1. Executive Summary & Audit Verdict

### Final Verdict: **ACCEPTANCE WITH CONDITIONS**

A strict, read-only independent audit of the Batch 9.6 implementation on branch `feature/batch-9-production-hardening` at commit `3f445bb` was executed. 

The implementation correctly introduced non-COD payment deduction to resolve split Wallet + COD physical cash collection over-demands. However, independent source inspection of the actual database models, service workflows, and analytics reveals two critical structural findings that must be remediated before full production release:

1. **Semantic Inaccuracy of Zero-Cash Statuses (Critical Finding A):**  
   When a COD order is fully covered by non-COD tenders (`expectedAmount === 0`), Batch 9.6 sets `collectionStatus: COLLECTED` and `settlementStatus: SETTLED` despite `collectedAmount: 0`. While `collectedAmount: 0` prevents monetary revenue inflation, assigning `COLLECTED` and `SETTLED` creates false physical operational counts (e.g., non-zero completed collection and settlement record counts in operational reports where zero cash was handled).
2. **Payment Allocation Source of Truth & Filter Defect (Critical Finding B):**  
   In both `OrderService.createOrder` and `CashCollectionService.backfillHistoricalCodOrders`, the query filtering non-COD allocations filters solely on `paymentMethod: { not: PaymentMethod.COD }`. It fails to filter for `paymentStatus: PaymentStatus.PAID`. Consequently, an order with a `FAILED` or `PENDING` online or wallet payment would prematurely deduct from the rider's expected COD cash collection obligation. Furthermore, silent clamping via `Math.max(0, grandTotal - nonCodAllocations)` conceals potential over-allocations rather than throwing a validation error or isolating the record for discrepancy reconciliation.

---

## 2. Target Repository & Git Verification

| Property | Requirement | Verified Actual | Status |
| :--- | :--- | :--- | :--- |
| **Repository** | `isaacabnywork-ai/Pravardhan-Store` | `C:\Users\ftt10\.gemini\antigravity\scratch\Pravardhan-Store` | **PASS** |
| **Branch** | `feature/batch-9-production-hardening` | `feature/batch-9-production-hardening` | **PASS** |
| **HEAD Commit** | `3f445bb` | `3f445bb38851b30b7abbc70dac22ad35c96f7919` | **PASS** |
| **Working Tree** | Clean | `nothing to commit, working tree clean` | **PASS** |
| **Upstream Status** | Synced | `Your branch is up to date with 'origin/feature/batch-9-production-hardening'` | **PASS** |
| **Batch 9.6 Reports** | 5 deliverable reports | All 5 deliverable reports present on disk | **PASS** |

---

## 3. Critical Finding A — Zero-Cash Collection Semantics

### Inspection of Actual Code
In `src/modules/orders/service.ts` (lines 238–253):
```typescript
const isFullyCovered = expectedCodPaise === 0 && nonCodAllocationsPaise > 0;

await tx.cashCollection.create({
  data: {
    orderId: order.id,
    riderId: assignedRiderId,
    storeId: store.id,
    expectedAmount: expectedCodPaise,
    collectedAmount: 0,
    collectionStatus: isFullyCovered ? CashCollectionStatus.COLLECTED : CashCollectionStatus.PENDING,
    settlementStatus: isFullyCovered ? SettlementStatus.SETTLED : SettlementStatus.UNSETTLED,
    notes: isFullyCovered
      ? 'Order fully funded via non-COD payment allocations; zero physical cash collection required'
      : ...,
  },
});
```

And in `src/modules/operations/cash-collection-service.ts` (lines 278–282):
```typescript
collectionStatus: isFullyPrepaid ? CashCollectionStatus.COLLECTED : CashCollectionStatus.PENDING,
settlementStatus: isFullyPrepaid ? SettlementStatus.SETTLED : SettlementStatus.UNSETTLED,
```

### Evaluation against Audit Questions

1. **Does `COLLECTED` mean physical cash was received?**  
   **No.** In Quick-Commerce logistics, `CashCollectionStatus.COLLECTED` represents the physical event where the delivery partner collected physical currency at doorstep. Marking an order with `collectedAmount: 0` as `COLLECTED` distorts this definition.
2. **Does `SETTLED` mean a real rider-to-store handover occurred?**  
   **No.** `SettlementStatus.SETTLED` represents the physical handover of cash envelopes/currency notes from the field rider to the store cash manager at shift end. Marking zero-cash orders as `SETTLED` fabricates a physical handover event that never took place.
3. **Can zero-cash orders appear as completed physical collections?**  
   **Yes.** In `cashCollectionService.getReconciliation` and administrative collection listings, queries filtering by `collectionStatus: 'COLLECTED'` or `settlementStatus: 'SETTLED'` include these zero-cash records.
4. **Can zero-cash orders inflate collection counts, rider handover counts, or settlement reports?**  
   **Yes.** While rupee amounts are not inflated (because `collectedAmount === 0`), record counts (`totalRecords`, `settledCount`, or completed collection counts in admin operational reports) are distorted.
5. **Is there an existing status representing no cash collection required?**  
   In `enum CashCollectionStatus { PENDING, COLLECTED, SHORT_COLLECTED, EXCESS_COLLECTED, FAILED }`, there is currently no `NOT_REQUIRED` or `EXEMPT` enum member. Because modifying applied migrations is prohibited, the safest architectural handling without schema migration is:
   - For an order with `expectedAmount === 0` (100% prepaid via non-COD tenders), **either do not instantiate a `CashCollection` physical ledger record at all** (since `cashCollections` models physical currency collection on delivery), or instantiate with `collectionStatus: PENDING` and note `EXEMPT / FULLY_PREPAID`, or utilize `FAILED` with notes `NOT_APPLICABLE: FULLY_PREPAID`. Creating no record or leaving it unflagged as a physical collection prevents operational count pollution.

---

## 4. Critical Finding B — Authoritative Non-COD Payment Allocations

### 1. Authoritative Source of Truth
In the PostgreSQL database, the authoritative model for payment allocations is `Payment`:
```prisma
model Payment {
  id                 String        @id @default(cuid())
  orderId            String
  paymentMethod      PaymentMethod
  paymentStatus      PaymentStatus @default(PENDING)
  amount             Int           // in paise
  gatewayOrderId     String?
  gatewayPaymentId   String?
  ...
  order              Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```
There is no separate `WalletPaymentAllocation` table in the schema; multi-tender allocations are represented as distinct `Payment` records linked to `Order` via `orderId`.

### 2. Status Treatment Evaluation
In `src/modules/orders/service.ts`:
```typescript
const nonCodPayments = await tx.payment.findMany({
  where: {
    orderId: order.id,
    paymentMethod: { not: PaymentMethod.COD },
  },
});
const nonCodAllocationsPaise = nonCodPayments.reduce((sum, p) => sum + p.amount, 0);
```
And in `src/modules/operations/cash-collection-service.ts`:
```typescript
const nonCodAllocationsPaise = (order.payments || [])
  .filter((p) => p.paymentMethod !== 'COD')
  .reduce((sum, p) => sum + p.amount, 0);
```

### Identified Flaw: Missing `paymentStatus === PAID` Filter
The query currently sums all payments matching `paymentMethod !== 'COD'` without checking `paymentStatus`.

| Payment State | Desired Behavior | Batch 9.6 Actual Behavior | Risk Level |
| :--- | :--- | :--- | :--- |
| **PAID Wallet Allocation** | Deduct from COD cash | Deducted | **PASS** |
| **FAILED Online/Wallet** | Must NOT deduct | **Deducted** (because status is uninspected) | **CRITICAL DEFECT** |
| **PENDING Online/Wallet** | Must NOT deduct | **Deducted** (because status is uninspected) | **CRITICAL DEFECT** |
| **REFUNDED Payment** | Must NOT deduct from COD | **Deducted** (unless filtered out) | **CRITICAL DEFECT** |

**Remediation Required:**  
Non-COD allocations must strictly be filtered by:
```typescript
where: {
  orderId: order.id,
  paymentMethod: { not: PaymentMethod.COD },
  paymentStatus: PaymentStatus.PAID,
}
```

---

## 5. Arithmetic & Overpayment Protection

### Clamping Inspection: `Math.max(0, grandTotal - nonCodAllocations)`
In `src/modules/orders/service.ts` and `src/modules/operations/cash-collection-service.ts`:
```typescript
const expectedCodPaise = Math.max(0, grandTotal - nonCodAllocationsPaise);
```
While `Math.max(0, ...)` protects the database and field staff against negative cash collection, it silently swallows over-allocation errors where $\sum \text{nonCodAllocations} > \text{grandTotal}$.

- **Condition:** If `nonCodAllocationsPaise > grandTotal`, the system must not silently clamp to zero. It must either reject order creation with a `ValidationError('Non-COD payment allocations exceed order grand total')` or flag the discrepancy explicitly in the audit log.

---

## 6. Historical Backfill Audit

### Code Inspection: `backfillHistoricalCodOrders`
The backfill method queries historical COD orders:
```typescript
const codOrdersWithoutLedger = await prisma.order.findMany({
  where: {
    paymentMethod: 'COD',
    cashCollections: { none: {} },
  },
  select: {
    id: true,
    storeId: true,
    deliveryStaffId: true,
    userId: true,
    grandTotal: true,
    orderNumber: true,
    orderStatus: true,
    payments: {
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        amount: true,
      },
    },
  },
});
```
- **Strengths:**
  - Idempotent: Only orders with `cashCollections: { none: {} }` are selected.
  - Safe: Existing collected/settled records are never modified or overwritten.
  - No fabricated cash: `collectedAmount: 0` is maintained.
- **Weaknesses:**
  - Same missing status check: `(order.payments || []).filter((p) => p.paymentMethod !== 'COD')` does not filter for `p.paymentStatus === 'PAID'`.
  - Same zero-cash semantic defect: Sets `collectionStatus: COLLECTED` and `settlementStatus: SETTLED` when `netExpectedPaise === 0`.

---

## 7. Financial Analytics & Revenue Recognition

### Invariant Verification
1. **Rule A (Delivered != Collected Cash):**
   In `src/modules/analytics/sales-analytics-service.ts` and `financial-analytics-service.ts`, COD revenue is recognized strictly if `cashCollection.collectedAmount > 0`. Because zero-cash orders have `collectedAmount: 0`, they do **not** falsely inflate monetary completed revenue or GMV.
2. **Double-Counting Segregation:**
   Online payments are counted from `payments` where `paymentStatus === PAID`. Cash collections are counted from `cashCollections.collectedAmount`. Net COD calculations ensure physical cash and prepaid amounts do not double count.

---

## 8. Concurrency, Locking & Persistence

1. **Transaction Scope:** `OrderService.createOrder` executes within an atomic `prisma.$transaction`. Payment creation and `CashCollection` creation occur within the same database transaction, ensuring no orphan records can be created.
2. **Idempotent Handover:** `settleCollection` checks `if (collection.settlementStatus === SettlementStatus.SETTLED) throw new ConflictError(...)` inside `prisma.$transaction`.
3. **Database Concurrency Limitations:** Verified unit tests and integration tests validate logic and deterministic calculations. Real high-volume multi-node PostgreSQL concurrency tests require production load runners.

---

## 9. Test Verification Summary

The test suites were executed without modifying any code:

```
> tests/batch-9-6-wallet-cod-reconciliation.test.mjs
✓ Test 1 passed: Pure COD expected cash exactly matches grandTotal in integer paise.
✓ Test 2 passed: Split payment allocates ₹500 wallet and calculates net ₹1,000 COD cash.
✓ Test 3 passed: Split payment allocates ₹750 wallet and calculates net ₹1,250 COD cash.
✓ Test 4 passed: Fully wallet-funded order results in ₹0 expected cash and auto-settled status.
✓ Test 5 passed: Discounted payable grandTotal correctly forms expected amount.
✓ Test 6 passed: Backfill respects split allocations and duplicate backfill idempotency.
✓ Test 7 passed: Cancellation lifecycle reliably handles uncollected vs settled records.
✓ Test 8 passed: Short/excess and settlement math strictly adhere to integer paise and net obligation.

> tests/batch-9-4-remediation.test.mjs: 5/5 Passed
> tests/batch-9-hardening.test.mjs: 3/3 Passed
> tests/analytics.test.mjs: 5/5 Passed
```
**Total Passing Assertions:** 21/21 passed.

---

## 10. Migration & Frontend Freeze Verification

1. **Migration Files:**
   - `prisma/migrations/20261110_batch9_cash_collection.sql`: Untouched (100% clean).
   - `prisma/migrations/20261110_batch9_4_cash_collection_remediation.sql`: Untouched (100% clean).
2. **Frontend Freeze:**
   - `git diff --stat 63e5b04..3f445bb -- "src/app/(storefront)" "src/components" "src/app/checkout"` returned empty.
   - Customer UI/UX remains pixel-for-pixel identical to accepted baseline.

---

## 11. Remediation Conditions for Full Acceptance

To advance from **ACCEPTANCE WITH CONDITIONS** to **FULL ACCEPTANCE**, the following discrete remediations must be implemented:

1. **COND-9.7-01 (Strict Payment Status Filtering):**
   In `src/modules/orders/service.ts` and `src/modules/operations/cash-collection-service.ts`, ensure that non-COD payments reduce the COD cash obligation **only** if `paymentStatus === PaymentStatus.PAID`.
2. **COND-9.7-02 (Zero-Cash Record Semantics):**
   When `expectedAmount === 0` on a COD order (fully prepaid by non-COD tender), do not set `collectionStatus = COLLECTED` and `settlementStatus = SETTLED`. Instead, avoid creating a physical `CashCollection` record altogether, or record it with `collectionStatus = PENDING` and note `EXEMPT_PREPAID` to prevent polluting operational physical cash collection counts.
3. **COND-9.7-03 (Over-Allocation Rejection):**
   In `OrderService.createOrder`, if `nonCodAllocationsPaise > grandTotal`, throw a `ValidationError` rather than silently clamping to `0`.
