# BATCH 10 FINANCIAL INTEGRITY REPORT
## Net Applied Allocations, Refund Reconciliation & Multi-Tender Invariants

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Date:** November 10, 2026

---

### 1. Mathematical Formulation

Let $O$ be an order with payable amount $A_{\text{order}}$. Let $P$ be the set of payment records associated with $O$.

For each payment record $p \in P$, the net applied payment $A_{\text{net}}(p)$ is computed as:
$$A_{\text{net}}(p) = \begin{cases}
\max\left(0, A(p) - \sum_{r \in R(p), \text{status}(r) = \text{PROCESSED}} A(r)\right) & \text{if } \text{method}(p) \ne \text{COD} \land \text{status}(p) = \text{PAID} \\
0 & \text{otherwise}
\end{cases}$$

The net non-COD applied payment is:
$$A_{\text{non-COD}} = \sum_{p \in P} A_{\text{net}}(p)$$

The net physical COD cash obligation is:
$$A_{\text{COD}} = \max\left(0, A_{\text{order}} - A_{\text{non-COD}}\right)$$

If $A_{\text{non-COD}} > A_{\text{order}}$:
- During order creation: The transaction is rejected via `ValidationError` and completely rolled back.
- During historical backfill: The order is recorded in `isolatedOverAllocatedOrders` for manual review.

---

### 2. Multi-Tender Refund Matrix

| Original Order | Initial Payment | Partial Refund | Net Applied | Net Expected COD | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **₹1,500 Split Order** | ₹1,000 Online Paid | ₹200 Processed | ₹800 | ₹700 | **VERIFIED (Test 2)** |
| **₹1,500 Split Order** | ₹1,000 Online Paid | ₹1,000 Processed (Full) | ₹0 | ₹1,500 | **VERIFIED (Test 1)** |
| **₹2,000 Split Order** | ₹1,500 Online Paid | ₹300 + ₹200 (Multi) | ₹1,000 | ₹1,000 | **VERIFIED (Test 3)** |
| **₹1,000 Split Order** | ₹600 Online Paid | ₹200 Pending | ₹600 | ₹400 | **VERIFIED (Test 4)** |
| **₹800 Fully Prepaid** | ₹800 Wallet Paid | ₹0 | ₹800 | ₹0 (No CashCollection) | **VERIFIED (Zero-Cash)** |
