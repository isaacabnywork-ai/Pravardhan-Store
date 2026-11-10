-- Pravdhan Store: Batch 10 Additive Migration
-- Description: Implement Auditable Refund Ledger (Refund model and enums)
-- Target: Neon PostgreSQL
-- Preconditions: Safe additive migration; checks for existence before creation.

DO $$
BEGIN
    -- 1. Create RefundStatus Enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RefundStatus') THEN
        CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
    END IF;

    -- 2. Create RefundReason Enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RefundReason') THEN
        CREATE TYPE "RefundReason" AS ENUM (
            'CUSTOMER_CANCELLATION',
            'ADMIN_INITIATED',
            'ITEM_OUT_OF_STOCK',
            'QUALITY_DISPUTE',
            'RETURN_ON_DELIVERY',
            'OTHER'
        );
    END IF;
END $$;

-- 3. Create refunds table if not exists
CREATE TABLE IF NOT EXISTS "refunds" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" "RefundReason" NOT NULL DEFAULT 'CUSTOMER_CANCELLATION',
    "gatewayRefundId" TEXT,
    "idempotencyKey" TEXT,
    "notes" TEXT,
    "rawGatewayResponse" JSONB,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- 4. Create Indexes safely
CREATE UNIQUE INDEX IF NOT EXISTS "refunds_idempotencyKey_key" ON "refunds"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "refunds_orderId_idx" ON "refunds"("orderId");
CREATE INDEX IF NOT EXISTS "refunds_paymentId_idx" ON "refunds"("paymentId");
CREATE INDEX IF NOT EXISTS "refunds_status_idx" ON "refunds"("status");
CREATE INDEX IF NOT EXISTS "refunds_gatewayRefundId_idx" ON "refunds"("gatewayRefundId");

-- 5. Foreign Key Constraints with ON DELETE RESTRICT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'refunds_orderId_fkey'
    ) THEN
        ALTER TABLE "refunds" ADD CONSTRAINT "refunds_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'refunds_paymentId_fkey'
    ) THEN
        ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey"
            FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
