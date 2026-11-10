# BATCH 9.6 FINANCIAL INTEGRITY REPORT
## Mathematical Formulation & Multi-Tender Reconciliation Invariants

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Batch:** Batch 9.6 Remediation  
**Date:** November 10, 2026

---

### 1. Fundamental Financial Invariants

1. **Net Physical Cash Obligation:**
   Physical cash to be collected by a delivery partner from the customer at doorstep MUST strictly reflect the outstanding liability after all non-COD tenders have been credited:
   $$\text{ExpectedAmountPaise} = \max\left(0, \text{GrandTotalPaise} - \sum_{p \in \text{Payments}, p.\text{method} \neq \text{COD}} p.\text{amountPaise}\right)$$

2. **Non-Negative Invariant:**
   Expected cash collection amount is constrained by $\max(0, \dots)$, guaranteeing that negative values can never be written to the database or assigned to field agents.

3. **Integer Arithmetic Precision:**
   All monetary amounts are represented as integer paise. Floating-point division and rounding discrepancies are prohibited across all payment, settlement, and discrepancy accounting.

4. **Multi-Tender Double-Counting Prohibition:**
   Prepaid tender (Wallet / UPI / Card) and doorstep Cash on Delivery are mutually reconciled:
   - Wallet allocations are accounted under wallet liabilities and merchandise revenue upon order delivery.
   - Cash collections are accounted under physical cash assets upon handover and settlement.
   - At no point is the wallet portion credited twice (once as wallet, once as COD cash).

---

### 2. Scenario Reconciliation Matrix

| Scenario | Order Grand Total | Non-COD / Wallet Allocation | Expected COD Cash | Actual Cash Collected | Collection Status | Settlement Status | Discrepancy Variance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pure COD** | ₹1,500 (150,000 p) | ₹0 | ₹1,500 (150,000 p) | ₹1,500 | COLLECTED | SETTLED | ₹0 |
| **Wallet + COD Split** | ₹1,500 (150,000 p) | ₹500 (50,000 p) | ₹1,000 (100,000 p) | ₹1,000 | COLLECTED | SETTLED | ₹0 |
| **Wallet + COD Split** | ₹2,000 (200,000 p) | ₹750 (75,000 p) | ₹1,250 (125,000 p) | ₹1,250 | COLLECTED | SETTLED | ₹0 |
| **Fully Wallet-Funded** | ₹800 (80,000 p) | ₹800 (80,000 p) | ₹0 | ₹0 | COLLECTED | SETTLED | ₹0 (No physical cash collected) |
| **Pure COD w/ Discount** | ₹1,200 (120,000 p) | ₹0 | ₹1,200 (120,000 p) | ₹1,200 | COLLECTED | SETTLED | ₹0 |
| **Short Collection** | ₹1,500 (150,000 p) | ₹500 (50,000 p) | ₹1,000 (100,000 p) | ₹800 (80,000 p) | SHORT_COLLECTED | UNSETTLED | Short: ₹200 (20,000 p) |
| **Excess Collection** | ₹1,500 (150,000 p) | ₹500 (50,000 p) | ₹1,000 (100,000 p) | ₹1,100 (110,000 p) | EXCESS_COLLECTED | UNSETTLED | Excess: ₹100 (10,000 p) |

---

### 3. Order Cancellation Behavior

- **Uncollected COD Orders:** If an order is cancelled while in `PLACED` or `CONFIRMED` state with `collectionStatus == 'PENDING'` and `settlementStatus == 'UNSETTLED'`, the associated `CashCollection` entry is transitioned to `FAILED`, with reason recorded in audit notes.
- **Settled COD Orders:** If cash has already been physically collected and settled (`SETTLED`), the collection status is immutable. The order cancellation is rejected by the state machine if delivered/settled, preserving accounting integrity.
