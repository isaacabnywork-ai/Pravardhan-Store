-- Batch 9 Migration Review: Additive CashCollection Model & Enums
-- Status: Additive, backward-compatible, zero-data-loss migration script

-- 1. Create CashCollectionStatus Enum
DO $$ BEGIN
  CREATE TYPE "CashCollectionStatus" AS ENUM ('PENDING', 'COLLECTED', 'SHORT_COLLECTED', 'EXCESS_COLLECTED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create SettlementStatus Enum
DO $$ BEGIN
  CREATE TYPE "SettlementStatus" AS ENUM ('UNSETTLED', 'SETTLED', 'DISCREPANCY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create cash_collections Table
CREATE TABLE IF NOT EXISTS "cash_collections" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "riderId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "expectedAmount" INTEGER NOT NULL,
  "collectedAmount" INTEGER NOT NULL DEFAULT 0,
  "collectionStatus" "CashCollectionStatus" NOT NULL DEFAULT 'PENDING',
  "settlementStatus" "SettlementStatus" NOT NULL DEFAULT 'UNSETTLED',
  "collectedAt" TIMESTAMP(3),
  "settledAt" TIMESTAMP(3),
  "handoverToStaffId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "cash_collections_pkey" PRIMARY KEY ("id")
);

-- 4. Create Indexes & Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "cash_collections_orderId_key" ON "cash_collections"("orderId");
CREATE INDEX IF NOT EXISTS "cash_collections_orderId_idx" ON "cash_collections"("orderId");
CREATE INDEX IF NOT EXISTS "cash_collections_riderId_idx" ON "cash_collections"("riderId");
CREATE INDEX IF NOT EXISTS "cash_collections_storeId_idx" ON "cash_collections"("storeId");
CREATE INDEX IF NOT EXISTS "cash_collections_collectionStatus_idx" ON "cash_collections"("collectionStatus");
CREATE INDEX IF NOT EXISTS "cash_collections_settlementStatus_idx" ON "cash_collections"("settlementStatus");

-- 5. Foreign Key Constraints (with ON DELETE RESTRICT for immutable financial ledger protection)
DO $$ BEGIN
  ALTER TABLE "cash_collections" ADD CONSTRAINT "cash_collections_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "cash_collections" ADD CONSTRAINT "cash_collections_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
