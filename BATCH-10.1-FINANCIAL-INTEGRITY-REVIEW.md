# BATCH 10.1 FINANCIAL INTEGRITY REVIEW
## Net Applied Allocations, Refund Reconciliation & Multi-Tender Invariants

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Audited Commit:** `8edc2cddf84a7257931e591a12b31e8fbfb84ac2`  
**Starting Baseline:** `f69bcf3566be23591529c37597ba1fdd33bb313b`  
**Audit Mode:** STRICT READ-ONLY INDEPENDENT AUDIT  
**Date:** November 12, 2026  

---

### 1. Verification of the Critical Accounting Equation

The audit independently traced and calculated the exact accounting example mandated in Section 5:

**Baseline Scenario:**
- Order payable: ₹1,500 (150,000 paise).
- Original successful Razorpay payment: ₹1,000 (100,000 paise, `paymentStatus: 'PAID'`).
- Successfully processed refund: ₹200 (20,000 paise, `status: 'PROCESSED'`).
- Net applied non-COD payment: $100,000 - 20,000 = 80,000\text{ paise}$ (₹800).
- Expected COD: $150,000 - 80,000 = 70,000\text{ paise}$ (₹700).

#### Code Execution Evidence (`src/modules/operations/financial-reconciliation-helper.ts`):
```typescript
const isNonCod = payment.paymentMethod !== PaymentMethod.COD && payment.paymentMethod !== 'COD';
const isPaid = payment.paymentStatus === PaymentStatus.PAID || payment.paymentStatus === 'PAID';

if (isNonCod && isPaid) {
  const processedRefundsPaise = (payment.refunds || [])
    .filter((r) => r.status === RefundStatus.PROCESSED || r.status === 'PROCESSED')
    .reduce((sum, r) => sum + r.amount, 0);

  const netAppliedPaymentPaise = Math.max(0, payment.amount - processedRefundsPaise);

  if (netAppliedPaymentPaise > 0) {
    grossNonCodAllocationsPaise += payment.amount;
    totalRefundedPaise += processedRefundsPaise;
    validNonCodAllocationsPaise += netAppliedPaymentPaise;
    appliedPayments.push(payment);
  }
}
```
In `tests/batch-10-refund-ledger.test.mjs`, Test 2 executes this exact input:
```
✓ Test 2 passed: Partial refund strictly deducts remaining applied payment (₹800) leaving ₹700 expected COD.
```
**Result: VERIFIED CORRECT.**

---

### 2. Comprehensive Case-by-Case Verification

#### Case 1: Fully Refunded Payment
- Original payment: ₹1,000 (`PAID`).
- Successful refund: ₹1,000 (`PROCESSED`).
- In `calculateNetCodObligation`:
  `processedRefundsPaise = 100,000`.
  `netAppliedPaymentPaise = Math.max(0, 100,000 - 100,000) = 0`.
  Because `netAppliedPaymentPaise === 0`, it is not pushed to `appliedPayments`, contributing `0` to `validNonCodAllocationsPaise`.
- **Result: VERIFIED (Test 1 passes). Net applied = ₹0.**

#### Case 2: Multiple Partial Refunds
- Original payment: ₹1,500 (`PAID`).
- Refund 1: ₹300 (`PROCESSED`).
- Refund 2: ₹200 (`PROCESSED`).
- Refund 3: ₹100 (`FAILED`).
- `filter(r => r.status === 'PROCESSED')` sums only Refund 1 and Refund 2: `50,000 paise` (₹500).
- `netAppliedPaymentPaise = 150,000 - 50,000 = 100,000 paise` (₹1,000).
- **Result: VERIFIED (Test 3 passes). Net applied = ₹1,000.**

#### Case 3: Pending Refund
- Original payment: ₹1,000 (`PAID`).
- Refund request: ₹200 (`PENDING`).
- In `calculateNetCodObligation`, the filter checks strictly for `status === 'PROCESSED'`. The `PENDING` refund is excluded from `processedRefundsPaise`.
- Net applied remains ₹1,000.
- **Audit Assessment:** This follows sound financial principles. Until a refund is confirmed processed by the gateway or provider, the money remains in escrow/settlement and the merchant cannot consider the customer obligated to repay COD for money they have not yet received back.
- **Result: VERIFIED (Test 4 passes).**

#### Case 4: Failed Refund
- Original payment: ₹1,000 (`PAID`).
- Refund: ₹200 (`FAILED`).
- Excluded by the `status === 'PROCESSED'` filter.
- Net applied remains ₹1,000.
- **Result: VERIFIED (Test 4 passes).**

#### Case 5: Over-Allocation Analysis & Zero-Clamping Guard
- Order payable: ₹1,000 (100,000 paise).
- Net valid non-COD allocations: ₹1,200 (120,000 paise).
- Code check in `financial-reconciliation-helper.ts`:
  ```typescript
  const isOverAllocated = validNonCodAllocationsPaise > payableOrderAmountPaise;
  if (isOverAllocated && options.throwOnOverAllocation) {
    throw new ValidationError(
      `Financial integrity violation: Net applied non-COD payment allocations (₹${Math.round(
        validNonCodAllocationsPaise / 100
      )}) exceed order payable amount (₹${Math.round(payableOrderAmountPaise / 100)})`
    );
  }
  ```
- **Audit Verification:**
  The implementation **does not allow `Math.max(0, ...)` to silently mask over-allocation**. The over-allocation check is performed **before** computing `expectedCodPaise`. If `throwOnOverAllocation` is true (the default used during checkout in `OrderService.createOrder`), a `ValidationError` is thrown and the database transaction aborts. In backfill mode, `isOverAllocated: true` isolates the record into an exceptions list.
- **Result: VERIFIED (Test 5 passes).**

---

### 3. Payment Method Ledger Invariants

1. **Pending COD is NOT Collected Cash:**
   Delivered status never updates cash collection. Cash collection requires a persisted `CashCollection` record with `collectionStatus === 'COLLECTED'` or `SETTLED`.
2. **Failed Razorpay Payments are NOT Revenue:**
   In `financial-analytics-service.ts`, payments with `paymentStatus: 'FAILED'` are explicitly excluded from `razorpayCapturedAmountPaise`.
3. **Wallet Liabilities & Non-Double Counting:**
   In `financial-reconciliation-helper.ts`, a `seenPaymentIds = new Set<string>()` guard prevents duplicate payment allocations from being counted more than once.
4. **Integer Paise Integrity:**
   All amounts (`payableOrderAmountPaise`, `validNonCodAllocationsPaise`, `expectedCodPaise`, `amountPaise`) are stored and computed in integer paise, preventing decimal floating-point drift.
