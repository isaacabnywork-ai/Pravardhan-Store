# BATCH 9.9 LIFECYCLE AND BACKFILL REVIEW
## Zero-Cash Order Lifecycle & Historical Data Resiliency

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Audit Target HEAD:** `f69bcf3566be23591529c37597ba1fdd33bb313b`  
**Date:** November 10, 2026

---

### 1. Zero-Cash Order Lifecycle Across Consumers

1. **Order Creation:** If `expectedCodPaise === 0`, `CashCollection` creation is bypassed.
2. **Delivery & Assignment:** `DeliveryAssignment` tracks rider status, OTP verification, and doorstep photo proof independently of `CashCollection`. Absence of a cash record does not impair dispatch or delivery.
3. **Analytics & Financial Reporting:**
   - In `sales-analytics-service.ts`, `financial-analytics-service.ts`, and `dashboard-service.ts`, COD revenue is recognized strictly if `cashCollection.collectedAmount > 0`.
   - Prepaid revenue is counted if `order.paymentStatus === 'PAID'` and `paymentMethod !== 'COD'`.
   - Zero-cash orders are recognized under prepaid merchandise sales and do not alter physical cash handover metrics.
4. **Shift Settlement:** Store cash managers reconcile physical banknotes handed over by riders. Zero-cash orders never produce pending envelopes or artificial shortages.

### 2. Historical Backfill Resiliency

1. **Idempotency:** Backfill queries orders matching `paymentMethod: 'COD'` and `cashCollections: { none: {} }`. Orders with existing collection records are ignored.
2. **Zero-Cash Orders Skipped:** Fully prepaid orders (`isFullyPrepaid || expectedCodPaise === 0`) increment `skippedFullyPrepaidCount` and do not generate physical ledger lines.
3. **Over-Allocation Isolation:** Inconsistent historical records are recorded in `isolatedOverAllocatedOrders` for manual audit.
4. **Historical Batch 9.6 Records Note:** In any development/staging database where Batch 9.6 created zero-cash records (`collectedAmount: 0`, `collectionStatus: 'COLLECTED'`, `settlementStatus: 'SETTLED'`), their financial impact is neutral (0 paise collected/settled), but if clean count reconciliation is desired in production, an operational migration script can safely transition them to `FAILED` or archive them.
