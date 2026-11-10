# BATCH 9.9 COD CALCULATION VERIFICATION
## Net Physical COD Obligation, Deduplication & Over-Allocation Protection

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Audit Target HEAD:** `f69bcf3566be23591529c37597ba1fdd33bb313b`  
**Date:** November 10, 2026

---

### 1. Mathematical Formulation

In `src/modules/operations/financial-reconciliation-helper.ts`:
$$\text{ExpectedCodPaise} = \max\left(0, \text{PayableTotalPaise} - \sum_{p \in \text{AppliedPayments}} p.\text{amount}\right)$$

Where:
$$\text{AppliedPayments} = \{ p \in \text{Payments} \mid p.\text{paymentMethod} \ne \text{COD} \land p.\text{paymentStatus} = \text{PAID} \land p.\text{id} \text{ is unique} \}$$

### 2. Deduplication Verification

- The helper tracks processed payment identifiers via `seenPaymentIds = new Set<string>()`.
- If a webhook retry or concurrent event injects duplicate representations of the same payment ID, subsequent duplicates are skipped.
- Distinct payments with separate IDs are both accumulated accurately.

### 3. Over-Allocation Protection

- If $\sum p.\text{amount} > \text{PayableTotalPaise}$:
  - `OrderService.createOrder` executes with `throwOnOverAllocation: true`. It throws a `ValidationError`, rolling back the atomic transaction.
  - `CashCollectionService.backfillHistoricalCodOrders` executes with `throwOnOverAllocation: false`. It isolates the order in `isolatedOverAllocatedOrders` registry without clamping or fabricating zero-cash records.
