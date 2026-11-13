-- Pravdhan Store: Batch 11.3 Additive Migration
-- Description: Add requestFingerprint column on orders for canonical checkout payload mismatch rejection
-- Target: Neon PostgreSQL
-- Preconditions: Safe additive migration; checks for column existence before adding.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'requestFingerprint'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "requestFingerprint" TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "orders_requestFingerprint_idx" 
ON "orders" ("requestFingerprint") 
WHERE "requestFingerprint" IS NOT NULL;
