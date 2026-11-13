# PRAVDHAN STORE — BATCH 9.4 FINANCIAL INTEGRITY REPORT
**COD Financial Accounting & Revenue Verification Framework**

- **Project:** Pravdhan Store Hyper-Local Quick Commerce
- **Target Invariant:** Physical Cash Receipt Strict Verification
- **Audit Requirement:** COND-9.3-02 Resolution

---

## 1. Core Financial Rules Enforced

### Rule A: Delivered Does Not Mean Collected
An order with payment method `COD` and status `DELIVERED` must **never** automatically contribute to collected revenue. In the quick-commerce delivery workflow, delivery completion (handing over goods to customer) and physical cash collection must be backed by a verified `CashCollection` entry where `collectedAmount > 0`.

### Rule B: Canonical Pending Ledger Entries
Every new COD order checkout creates an atomic `CashCollection` ledger entry in `PENDING` / `UNSETTLED` state with `collectedAmount: 0` and `expectedAmount: grandTotal`. This ensures an audit trail exists for every outstanding COD order before dispatch.

### Rule C: Physical Collection Verification
Physical cash collected by riders is recorded through the cash collection service. It classifies the collection as `COLLECTED`, `SHORT_COLLECTED`, `EXCESS_COLLECTED`, or `FAILED` based on the exact integer paise received. Once settled upon handover to store cash managers, records transition to `SETTLED` (or `DISCREPANCY`) and become permanently immutable.

### Rule D: Historical Order Handling & Segregation
Historical COD orders that were delivered prior to the activation of the `CashCollection` ledger are categorized as `unverifiedLegacy`. They are tracked in reconciliation reports under `unverifiedLegacyCount` and `unverifiedLegacyPaise` requiring manual verification, but are strictly excluded from collected revenue.

### Rule E: Split & Multi-Payment Non-Duplication
Online gateway payments (`PaymentStatus.PAID`), wallet debits, and physical cash collections are isolated to their own ledgers. In split payments or partial refunds, components are never double-counted.

---

## 2. Service Implementation Audit

| Service | File | Financial Invariant Implementation |
| :--- | :--- | :--- |
| **Order Checkout** | `src/modules/orders/service.ts` | Creates atomic `CashCollection` record on COD order placement. Updates pending collection to `FAILED` on cancellation. |
| **Dispatch / Rider Assignment** | `src/modules/operations/service.ts` | Updates `CashCollection.riderId` on rider assignment. |
| **Operations Dashboard** | `src/modules/operations/service.ts` | Total and today revenue strictly verify `collectedAmount > 0` for COD orders. |
| **Financial Analytics** | `src/modules/analytics/financial-analytics-service.ts` | Removed legacy delivered status fallback. Delivered COD without collection record is classified as unverified legacy. |
| **Sales Analytics** | `src/modules/analytics/sales-analytics-service.ts` | Completed revenue only includes COD orders with verified `collectedAmount > 0`. |
| **Analytics Dashboard** | `src/modules/analytics/dashboard-service.ts` | Today completed revenue only includes COD orders with verified `collectedAmount > 0`. |
| **General Sales Report** | `src/modules/analytics/service.ts` | `paidOrders` filter strictly verifies physical cash collection for COD orders. |
| **Backfill Utility** | `src/modules/operations/cash-collection-service.ts` | Idempotently creates `PENDING` entries with zero collected cash for historical orders. |
