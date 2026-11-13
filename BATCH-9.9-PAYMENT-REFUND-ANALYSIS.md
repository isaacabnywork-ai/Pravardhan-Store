# BATCH 9.9 PAYMENT REFUND ANALYSIS
## Data Model, Refund Lifecycle & Net Applied Payment Mechanics

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Audit Target HEAD:** `f69bcf3566be23591529c37597ba1fdd33bb313b`  
**Date:** November 10, 2026

---

### 1. Payment Data Model & Status Enum

In `prisma/schema.prisma`:
```prisma
enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model Payment {
  id                 String        @id @default(cuid())
  orderId            String
  paymentMethod      PaymentMethod
  paymentStatus      PaymentStatus @default(PENDING)
  amount             Int           // in paise
  gatewayOrderId     String?
  gatewayPaymentId   String?
  gatewaySignature   String?
  gatewayRawResponse Json?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  order              Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

### 2. Refund Lifecycle Analysis

1. **Full Refunds:**
   - When an entire order or payment is refunded, `paymentStatus` is updated to `PaymentStatus.REFUNDED`.
   - In `calculateNetCodObligation`, `p.paymentStatus === 'PAID'` evaluates to `false`.
   - The refunded payment is completely excluded from deducting from the outstanding COD obligation, which is the mathematically correct behavior for full refunds.
2. **Partial Refunds:**
   - Currently, the database schema lacks an explicit `refundedAmount` column on `Payment` or a separate `Refund` table.
   - If a partial refund event occurs (e.g. ₹200 refunded out of a ₹1,000 payment), the platform currently can only represent this by either:
     a) Transitioning the status to `REFUNDED` (which treats the full amount as refunded), or
     b) Keeping the status as `PAID` (which treats the full original amount as applied).
   - In a future financial release (Batch 10), adding `refundedAmount: Int @default(0)` or a dedicated `PaymentRefund` model will allow precise calculation of $\text{netApplied} = \text{amount} - \text{refundedAmount}$.
3. **Pending / Failed Refunds:**
   - Under current logic, pending refunds do not alter `paymentStatus` from `PAID`, ensuring that funds not yet returned to the customer remain counted as applied until refund settlement completes.
