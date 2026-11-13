-- Pravdhan Store: Batch 11.2 Additive Migration
-- Description: Add database-enforced idempotency key on orders scoped to authenticated customer
-- Target: Neon PostgreSQL
-- Preconditions: Safe additive migration; checks for column and index existence before creation.

DO $$
BEGIN
    -- 1. Add idempotencyKey column to orders table if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'idempotencyKey'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "idempotencyKey" TEXT;
    END IF;
END $$;

-- 2. Create Unique composite index on (userId, idempotencyKey) for database-enforced customer-scoped idempotency
-- Note: In PostgreSQL, UNIQUE constraints allow multiple NULLs, so orders without an idempotencyKey are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS "orders_userId_idempotencyKey_key" 
ON "orders" ("userId", "idempotencyKey") 
WHERE "idempotencyKey" IS NOT NULL;

-- 3. Create standalone index on idempotencyKey for efficient lookup
CREATE INDEX IF NOT EXISTS "orders_idempotencyKey_idx" 
ON "orders" ("idempotencyKey") 
WHERE "idempotencyKey" IS NOT NULL;
