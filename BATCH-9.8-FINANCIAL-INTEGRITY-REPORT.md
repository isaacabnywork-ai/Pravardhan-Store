# BATCH 9.8 FINANCIAL INTEGRITY REPORT
## Mathematical Formulation, Payment Status Treatment & Zero-Cash Logistics

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Batch:** Batch 9.8 Final Remediation  
**Date:** November 10, 2026

---

### 1. Authoritative Source of Truth for Payments

In the PostgreSQL database schema, payment allocations are modeled as child records of `Order` in the `payments` table:
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
}
```

### 2. Payment Status Eligibility Rules

| Payment State | Method | Status | Reduces COD Obligation? | Accounting Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Active Wallet Debit** | `WALLET` | `PAID` | **YES** | Legitimate settled customer debit. |
| **Captured Razorpay** | `UPI` / `CARD` | `PAID` | **YES** | Legitimate captured gateway tender. |
| **Pending Gateway Payment** | Any | `PENDING` | **NO** | Unverified; physical cash must still be collected if unpaid. |
| **Failed Gateway Payment** | Any | `FAILED` | **NO** | Unsuccessful tender; zero revenue received. |
| **Refunded Payment** | Any | `REFUNDED` | **NO** | Tender returned to customer; outstanding balance restored. |
| **Duplicate Payment Record** | Any | `PAID` | **NO (deduped)** | Deduplicated by ID to prevent multi-deduction. |

### 3. Net COD Cash Calculation & Over-Allocation Protection

$$\text{ValidAllocationsPaise} = \sum_{\substack{p \in \text{Payments} \\ p.\text{method} \neq \text{COD} \\ p.\text{status} = \text{PAID}}} p.\text{amount}$$

#### Over-Allocation Guard
If $\text{ValidAllocationsPaise} > \text{GrandTotalPaise}$:
- **New Order Creation:** Throws `ValidationError`, initiating automatic transaction rollback.
- **Historical Backfill:** Record is isolated in `isolatedOverAllocatedOrders` registry for manual investigation, preventing fabricated zero-cash ledger lines.

### 4. Zero-Cash Order Logistics Semantics

When $\text{ExpectedCodPaise} = 0$:
- **Invariant:** Physical cash collections model doorstep currency transactions and physical shift handovers.
- **Correction:** If an order has zero physical cash obligation, **no `CashCollection` record is created**.
- **Impact:**
  - Zero-cash orders complete their standard lifecycle (`CONFIRMED -> OUT_FOR_DELIVERY -> DELIVERED`) without obstruction.
  - Delivery partner apps are not instructed to collect cash envelopes.
  - Store cash managers are not expected to receive non-existent banknotes during shift settlement.
  - Operational KPIs reflect genuine physical currency handovers.
