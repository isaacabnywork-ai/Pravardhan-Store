# PRAVDHAN STORE — BATCH 9.4 MIGRATION REVIEW
**Additive Schema Migration & Foreign Key Remediation Specification**

- **Database Engine:** Neon PostgreSQL 15+
- **Prisma Version:** 6.19.3
- **Primary Migration File:** `prisma/migrations/20261110_batch9_cash_collection.sql` (Restored Baseline)
- **Remediation Migration File:** `prisma/migrations/20261110_batch9_4_cash_collection_remediation.sql` (Additive)

---

## 1. Migration Strategy Overview

In Batch 9.3 audit, COND-9.3-01 identified that editing `20261110_batch9_cash_collection.sql` in-place would fail to update databases that had already applied the Batch 9 migration because PostgreSQL's `duplicate_object` exception handler would silently skip constraint replacement.

To resolve this safely and preserve existing database states:
1. `20261110_batch9_cash_collection.sql` was restored to its original baseline.
2. A new, dedicated, forward-additive migration script was introduced: `20261110_batch9_4_cash_collection_remediation.sql`.

---

## 2. SQL Migration Specification

```sql
-- Batch 9.4 Migration: Enforce ON DELETE RESTRICT and Unique orderId on cash_collections
-- Safe, additive remediation migration supporting both fresh and existing databases

DO $$ 
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- 1. Pre-flight check: Detect if any duplicate orderId records exist before enforcing uniqueness
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT "orderId"
    FROM "cash_collections"
    GROUP BY "orderId"
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Cannot apply migration: % duplicate orderId records exist in cash_collections. Manual financial reconciliation is required.', duplicate_count;
  END IF;

  -- 2. Drop existing foreign key constraint if it exists (whether CASCADE, RESTRICT, or unconstrained)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cash_collections_orderId_fkey'
      AND table_name = 'cash_collections'
  ) THEN
    ALTER TABLE "cash_collections" DROP CONSTRAINT "cash_collections_orderId_fkey";
  END IF;

  -- 3. Add foreign key with strict ON DELETE RESTRICT
  ALTER TABLE "cash_collections"
    ADD CONSTRAINT "cash_collections_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

  -- 4. Create unique index on orderId (idempotent)
  CREATE UNIQUE INDEX IF NOT EXISTS "cash_collections_orderId_key" ON "cash_collections"("orderId");

END $$;
```

---

## 3. Scenario Analysis & Verification

### Scenario A: Fresh Database
1. `20261110_batch9_cash_collection.sql` runs first, creating `cash_collections` with standard indexes.
2. `20261110_batch9_4_cash_collection_remediation.sql` runs next, dropping the initial constraint and recreating `cash_collections_orderId_fkey` with `ON DELETE RESTRICT`, then creating unique index `cash_collections_orderId_key`.
3. **Result:** Restrict constraint and unique index active; 0 records lost.

### Scenario B: Existing Database (Batch 9 Already Applied)
1. The table already exists with `ON DELETE CASCADE`.
2. `20261110_batch9_4_cash_collection_remediation.sql` detects zero duplicate `orderId` records during pre-flight.
3. Drops the existing `cash_collections_orderId_fkey` constraint safely.
4. Recreates it with `ON DELETE RESTRICT`.
5. Adds unique index `cash_collections_orderId_key`.
6. **Result:** Fully upgraded without data loss or downtime.

---

## 4. Rollback Policy

In the event of a staging rollback:
```sql
BEGIN;
ALTER TABLE IF EXISTS "cash_collections" DROP CONSTRAINT IF EXISTS "cash_collections_orderId_fkey";
ALTER TABLE IF EXISTS "cash_collections" ADD CONSTRAINT "cash_collections_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
DROP INDEX IF EXISTS "cash_collections_orderId_key";
COMMIT;
```
*Note: In production, ledger records must never be dropped.*
