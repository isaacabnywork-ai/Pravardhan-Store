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
