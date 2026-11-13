-- Pravdhan Store: Batch 11.12 Additive Migration
-- Description: Create SmsDeliveryStatus enum and sms_delivery_jobs table for transactional outbox
-- Target: PostgreSQL 16+ / Neon PostgreSQL
-- Preconditions: Safe additive migration; idempotent execution using IF NOT EXISTS and DO blocks.

-- 1. Create SmsDeliveryStatus enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SmsDeliveryStatus') THEN
        CREATE TYPE "SmsDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED');
    END IF;
END $$;

-- 2. Create sms_delivery_jobs table if not exists
CREATE TABLE IF NOT EXISTS "sms_delivery_jobs" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "encryptedCode" TEXT,
    "status" "SmsDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "claimToken" TEXT,
    "lastError" TEXT,
    "providerMsgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_delivery_jobs_pkey" PRIMARY KEY ("id")
);

-- 3. Add Foreign Key to otp_challenges with cascade delete if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sms_delivery_jobs_challengeId_fkey'
    ) THEN
        ALTER TABLE "sms_delivery_jobs" 
        ADD CONSTRAINT "sms_delivery_jobs_challengeId_fkey" 
        FOREIGN KEY ("challengeId") REFERENCES "otp_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS "sms_delivery_jobs_challengeId_idx" ON "sms_delivery_jobs"("challengeId");
CREATE INDEX IF NOT EXISTS "sms_delivery_jobs_status_nextAttemptAt_idx" ON "sms_delivery_jobs"("status", "nextAttemptAt");
CREATE INDEX IF NOT EXISTS "sms_delivery_jobs_phone_idx" ON "sms_delivery_jobs"("phone");
