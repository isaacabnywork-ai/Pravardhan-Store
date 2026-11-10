# BATCH 10 REFUND LEDGER DESIGN
## Auditable Partial & Full Refund Data Architecture

**Repository:** `isaacabnywork-ai/Pravardhan-Store`  
**Branch:** `feature/batch-10-production-readiness`  
**Date:** November 10, 2026

---

### 1. Data Model Architecture

The `Refund` model is established in `prisma/schema.prisma` with integer paise precision and explicit state transitions:

```prisma
enum RefundStatus {
  PENDING
  PROCESSED
  FAILED
}

enum RefundReason {
  CUSTOMER_CANCELLATION
  ADMIN_INITIATED
  ITEM_OUT_OF_STOCK
  QUALITY_DISPUTE
  RETURN_ON_DELIVERY
  OTHER
}

model Refund {
  id                 String       @id @default(cuid())
  orderId            String
  paymentId          String
  amount             Int          // in paise
  status             RefundStatus @default(PENDING)
  reason             RefundReason @default(CUSTOMER_CANCELLATION)
  gatewayRefundId    String?      // Razorpay refund ID
  idempotencyKey     String?      @unique
  notes              String?
  rawGatewayResponse Json?
  processedAt        DateTime?
  failedAt           DateTime?
  failureReason      String?
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  order              Order        @relation(fields: [orderId], references: [id], onDelete: Restrict)
  payment            Payment      @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([paymentId])
  @@index([status])
  @@index([gatewayRefundId])
  @@index([idempotencyKey])
  @@map("refunds")
}
```

---

### 2. Refund Invariants & Constraints

1. **Remaining Balance Enforcement:**
   $\text{RequestedRefundPaise} \le \text{PaymentAmountPaise} - \sum \text{ActiveRefundsPaise}$.
2. **Status Distinction:**
   Only `status: 'PROCESSED'` reduces the active applied payment amount. `PENDING` and `FAILED` refunds do not alter the physical COD calculation.
3. **Idempotency Protection:**
   The `idempotencyKey` unique index prevents duplicate refund execution on retries or concurrent requests.
4. **Referential Integrity:**
   `ON DELETE RESTRICT` protects refund records from accidental cascading deletes if orders or payments are referenced.
