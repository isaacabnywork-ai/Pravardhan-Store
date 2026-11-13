# BATCH 10.1 REFUND CONCURRENCY REVIEW
## Concurrency Safety, Race Conditions & Gateway Failure Recovery

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Audited Commit:** `8edc2cddf84a7257931e591a12b31e8fbfb84ac2`  
**Starting Baseline:** `f69bcf3566be23591529c37597ba1fdd33bb313b`  
**Audit Mode:** STRICT READ-ONLY INDEPENDENT AUDIT  
**Date:** November 12, 2026  

---

### 1. Executive Summary

This document reviews the concurrency mechanics, transactional isolation, and failure recovery characteristics of the refund engine introduced in Batch 10 (`src/modules/payments/refund-service.ts` and `src/app/api/v1/webhooks/razorpay/route.ts`).

The core finding is that while `RefundService.createRefund` wraps its balance check and record creation inside `prisma.$transaction`, **it relies on default PostgreSQL Read Committed isolation without explicit row-level locking (`SELECT ... FOR UPDATE`) or conditional update queries on the parent `Payment` record**. Consequently, two concurrent refund requests executing simultaneously against the same payment record could both observe the same `alreadyRefundedPaise` balance before either writes, creating an over-refund race condition under high concurrency unless distinct idempotency keys or database serializable isolation are utilized.

---

### 2. Refund Creation Concurrency Analysis

#### A. Code Inspection (`src/modules/payments/refund-service.ts`)
```typescript
return prisma.$transaction(async (tx) => {
  // 1. Idempotency Check
  if (idempotencyKey) {
    const existing = await tx.refund.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return existing;
  }

  // 2. Validate Payment
  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
    include: {
      refunds: {
        where: { status: { in: [RefundStatus.PROCESSED, RefundStatus.PENDING] } },
      },
    },
  });

  // 3. Balance Validation
  const alreadyRefundedPaise = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
  const remainingRefundablePaise = payment.amount - alreadyRefundedPaise;

  if (amountPaise > remainingRefundablePaise) {
    throw new ConflictError(...);
  }

  // 4. Create Refund Record
  const refund = await tx.refund.create({ ... });
  ...
});
```

#### B. Concurrency Evaluation
1. **Idempotency Protection:**
   - The unique constraint `CREATE UNIQUE INDEX "refunds_idempotencyKey_key" ON "refunds"("idempotencyKey")` at the database level guarantees that if a client or gateway retries with the exact same `idempotencyKey`, the second insert will be rejected with a unique key violation (P2002), or return the existing record if serialized.
2. **Concurrent Distinct Requests (The Split Race Window):**
   - Suppose Payment `p_1` has `amount = 100000` (₹1,000) and 0 prior refunds.
   - Request A asks for ₹700 with `idempotencyKey: 'ref_A'`.
   - Request B asks for ₹600 with `idempotencyKey: 'ref_B'`.
   - In standard PostgreSQL `READ COMMITTED` isolation, if Transaction A and Transaction B read `p_1` at the exact same instant, both observe `alreadyRefundedPaise = 0` and `remainingRefundablePaise = 100000`.
   - Both transactions pass the validation check (`700 <= 1000` and `600 <= 1000`).
   - Both insert into `refunds`. Both commit successfully.
   - Total refunded: ₹1,300 on a ₹1,000 payment.
3. **Required Concurrency Hardening (Recommendation for Batch 10.2):**
   - Execute an explicit row lock via raw query:
     `SELECT id FROM payments WHERE id = $1 FOR UPDATE` inside `tx`.
   - Alternatively, maintain a running `refundedAmount` column on `Payment` and execute an atomic conditional update:
     `UPDATE payments SET refundedAmount = refundedAmount + $1 WHERE id = $2 AND amount - refundedAmount >= $1`.

---

### 3. Gateway Interaction & Webhook Failure Modes

#### A. Gateway Call Isolation
In `RefundService.createRefund`, no external HTTP call is made directly to Razorpay inside the database transaction. The method records the refund intent (setting status to `PENDING` when `gatewayPaymentId` is present), avoiding long-running database transaction holds during gateway latency.

#### B. Webhook Idempotency & Terminal State Invariants (`src/app/api/v1/webhooks/razorpay/route.ts`)
1. **Idempotent Matching:**
   - Incoming `refund.processed` or `refund.created` webhooks search for an existing refund record via `gatewayRefundId`.
   - If `refund.status === RefundStatus.PROCESSED`, the handler immediately returns the refund record without re-applying state changes or altering balances.
2. **Terminal State Regression Guard:**
   - In `RefundService.processGatewayRefundWebhook`:
     ```typescript
     if (refund) {
       if (refund.status === RefundStatus.PROCESSED) {
         return refund; // Idempotent return
       }
       return tx.refund.update({
         where: { id: refund.id },
         data: {
           status: status === 'PROCESSED' ? RefundStatus.PROCESSED : RefundStatus.FAILED,
           ...
         }
       });
     }
     ```
   - **Protection:** Once a refund reaches `PROCESSED`, a late-arriving `refund.failed` or duplicate webhook CANNOT regress it to `FAILED`.
   - **Unordered Webhooks:** If `refund.created` arrives, it marks the refund `PROCESSED` (or `PENDING`). When `refund.processed` arrives subsequently, it verifies `status === PROCESSED` and exits safely.
3. **Webhook Signature Security:**
   - Webhooks verify HMAC-SHA256 signatures via `RAZORPAY_WEBHOOK_SECRET` before parsing payloads. Unsigned or invalid requests are aborted with an error.

---

### 4. Recovery Scenarios Summary

| Scenario | System Behavior | Recovery Feasibility |
| :--- | :--- | :--- |
| **Gateway Timeout on Initiate** | Transaction records `PENDING`. Gateway webhook reconciles asynchronously. | Fully recoverable via webhook or status query. |
| **Duplicate Webhook Delivery** | Matching `gatewayRefundId` returns existing `PROCESSED` record. | Safe; 0 duplicate accounting effects. |
| **Late Arriving Failed Webhook** | `status === 'PROCESSED'` guard blocks regression to `FAILED`. | State preserved; no data loss. |
| **Concurrent Refund Initiation** | Blocked if same `idempotencyKey`. Possible race if different keys on same payment. | Requires `SELECT FOR UPDATE` in next minor release. |
