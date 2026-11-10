# PRAVDHAN STORE — BATCH 9.2 MIGRATION REVIEW
**Database Migration, Concurrency Schema, and Rollback Procedures**

- **Database Engine:** Neon PostgreSQL 15+
- **ORM / Schema Tool:** Prisma 6.19.3
- **Migration Script:** `prisma/migrations/20261110_batch9_cash_collection.sql`
- **Impact Assessment:** Non-destructive, additive, strict referential integrity

---

## 1. Migration Specification

The Batch 9 migration introduces physical cash collection tracking to support COD operations and cash reconciliations. In Batch 9.2, this migration was audited and updated to enforce strict referential integrity (`ON DELETE RESTRICT`) and unique order indexing.

### SQL Migration Definitions:
```sql
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
```

---

## 2. Backward Compatibility & Zero-Downtime Application

1. **Purely Additive**: The migration creates new enums and a new table `cash_collections`. It does not drop, alter, or lock existing core tables (`Order`, `User`, `Store`, etc.).
2. **Safe Idempotency**: All DDL statements use defensive `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` blocks or `IF NOT EXISTS` constructs.
3. **Connection Pooling Compatibility**: The schema supports Prisma connection poolers (`POSTGRES_PRISMA_URL`) and direct non-pooling endpoints (`POSTGRES_URL_NON_POOLING` / `DIRECT_URL`).

---

## 3. Safe Rollback & Data Recovery Policy (COND-02 Compliance)

### 3.1 Policy Invariant: Schema Rollback vs. Data Recovery
In a financial application handling physical cash receipts, **dropping a ledger table in production is strictly prohibited**. 

If a production rollback is necessitated, engineering must differentiate between:
- **Application Version Rollback (Clean & Safe)**: Revert the application deployment to the previous Git commit. Since the database changes are purely additive, older application versions simply ignore `cash_collections` without schema disruption.
- **Data Preservation**: Under no circumstances should `DROP TABLE "cash_collections"` or `DROP TYPE` be run against a live production database that has already recorded cash transactions.

### 3.2 Controlled Rollback Script (Development / Staging Only)
If rollback is explicitly required in a non-production staging environment prior to data capture:

```sql
-- DANGER: ONLY RUN IN NON-PRODUCTION OR AFTER FULL DATA DUMP
BEGIN;

-- 1. Remove Foreign Key Constraints
ALTER TABLE IF EXISTS "cash_collections" DROP CONSTRAINT IF EXISTS "cash_collections_orderId_fkey";
ALTER TABLE IF EXISTS "cash_collections" DROP CONSTRAINT IF EXISTS "cash_collections_riderId_fkey";

-- 2. Drop Table
DROP TABLE IF EXISTS "cash_collections";

-- 3. Drop Enums
DROP TYPE IF EXISTS "SettlementStatus";
DROP TYPE IF EXISTS "CashCollectionStatus";

COMMIT;
```
