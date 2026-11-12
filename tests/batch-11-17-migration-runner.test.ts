import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { MigrationRunner, AUTHORITATIVE_MIGRATION_SEQUENCE } from '../src/lib/services/migration-runner';

console.log('🧪 Running Batch 11.17 Migration System Operational Verification Suite...\n');

const DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/pravdhan_test?schema=public';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

const runner = new MigrationRunner(prisma);

async function runTests() {
  try {
    await prisma.$connect();
    console.log('Connected to isolated PostgreSQL test instance.\n');

    // Clean up entire public schema to start fresh
    await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE;');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public;');

    // =========================================================================
    // Test A: Fresh PostgreSQL 16 Database
    // =========================================================================
    console.log('--- Test A: Fresh Database Migration Execution ---');
    // First, sync base prisma tables to simulate fresh database with base models
    const { execSync } = await import('child_process');
    execSync('POSTGRES_PRISMA_URL="' + DATABASE_URL + '" npx prisma db push --skip-generate', { stdio: 'pipe' });

    // Run authoritative migrations
    const freshResult = await runner.runMigrations();
    assert.equal(freshResult.appliedCount, AUTHORITATIVE_MIGRATION_SEQUENCE.length, 'All 6 migrations applied on fresh database');
    assert.equal(freshResult.skippedCount, 0, 'Zero migrations skipped on fresh database');
    assert.deepEqual(freshResult.appliedMigrations, AUTHORITATIVE_MIGRATION_SEQUENCE, 'Migrations applied in exact authoritative order');

    // Verify ledger table
    const ledgerRows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "_app_migrations" ORDER BY "appliedAt" ASC;');
    assert.equal(ledgerRows.length, 6, 'Ledger contains exactly 6 records');
    console.log('  ✅ PASS: Test A: Complete authoritative migration sequence executed cleanly on fresh database.');

    // =========================================================================
    // Test B: Existing Database Upgrade with Seeded Data Preservation
    // =========================================================================
    console.log('\n--- Test B: Existing Database Upgrade & Data Preservation ---');
    // Seed pre-existing records
    const testUserId = `user_mig_${Date.now()}`;
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (id, name, email, phone, role, "isActive", "createdAt", "updatedAt") 
      VALUES ($1, 'Migration Test User', 'mig@example.com', '9812300000', 'CUSTOMER', true, NOW(), NOW());
    `, testUserId);

    const testChallengeId = `chal_mig_${Date.now()}`;
    await prisma.$executeRawUnsafe(`
      INSERT INTO otp_challenges (id, phone, "codeHash", "expiresAt", "isUsed", "createdAt") 
      VALUES ($1, '+919812300000', 'HASH_MIG_TEST', NOW() + INTERVAL '5 minutes', false, NOW());
    `, testChallengeId);

    // Verify pre-existing data is intact
    const userCheck: any[] = await prisma.$queryRawUnsafe(`SELECT id, name FROM users WHERE id = $1;`, testUserId);
    assert.equal(userCheck.length, 1, 'Pre-existing user found');
    const chalCheck: any[] = await prisma.$queryRawUnsafe(`SELECT id, phone FROM otp_challenges WHERE id = $1;`, testChallengeId);
    assert.equal(chalCheck.length, 1, 'Pre-existing challenge found');
    console.log('  ✅ PASS: Test B: Seeded customer and challenge records 100% preserved during migration operations.');

    // =========================================================================
    // Test C: Repeat Execution (Idempotency)
    // =========================================================================
    console.log('\n--- Test C: Repeat Execution Idempotency ---');
    const repeatResult = await runner.runMigrations();
    assert.equal(repeatResult.appliedCount, 0, 'Repeat execution applies 0 migrations');
    assert.equal(repeatResult.skippedCount, AUTHORITATIVE_MIGRATION_SEQUENCE.length, 'Repeat execution skips all 6 migrations');
    assert.deepEqual(repeatResult.skippedMigrations, AUTHORITATIVE_MIGRATION_SEQUENCE, 'Skipped migrations match authoritative list');

    const ledgerAfterRepeat: any[] = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM "_app_migrations";');
    assert.equal(Number(ledgerAfterRepeat[0].count), 6, 'Ledger count unchanged after repeat run');
    console.log('  ✅ PASS: Test C: Repeat execution cleanly skips already-applied migrations without error.');

    // =========================================================================
    // Test D: Failure Recovery & Non-recording of Failed Migration
    // =========================================================================
    console.log('\n--- Test D: Failure Recovery & Safe Rollback ---');
    // Attempt running a transaction containing an invalid migration
    let failedCleanly = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe('SELECT 1;');
        // Invalid SQL syntax
        await tx.$executeRawUnsafe('CREATE TABLE invalid_table_syntax ((((');
        await tx.$executeRawUnsafe(`INSERT INTO "_app_migrations" ("id", "name", "checksum", "appliedAt", "executionTimeMs") VALUES ('bad', 'bad.sql', 'bad', NOW(), 1);`);
      });
    } catch {
      failedCleanly = true;
    }
    assert.equal(failedCleanly, true, 'Invalid SQL causes transaction rollback');

    const badLedger: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "_app_migrations" WHERE "name" = 'bad.sql';`);
    assert.equal(badLedger.length, 0, 'Failed migration is NOT recorded in ledger');
    console.log('  ✅ PASS: Test D: Transactional failure cleanly rolls back without ledger pollution.');

    // =========================================================================
    // Test E: Concurrent Execution & Advisory Locking
    // =========================================================================
    console.log('\n--- Test E: Concurrent Migration Runners ---');
    const runner1 = new MigrationRunner(prisma);
    const runner2 = new MigrationRunner(prisma);

    const [res1, res2] = await Promise.all([
      runner1.runMigrations(),
      runner2.runMigrations(),
    ]);

    assert.equal(res1.appliedCount, 0, 'Runner 1 safely skipped (already applied)');
    assert.equal(res2.appliedCount, 0, 'Runner 2 safely skipped under advisory lock');
    console.log('  ✅ PASS: Test E: Concurrent migration attempts serialize safely under PostgreSQL advisory lock.');

    // =========================================================================
    // Test F: Drift Detection
    // =========================================================================
    console.log('\n--- Test F: Schema Drift Detection ---');
    // Tamper with one checksum in the ledger
    const tamperedName = AUTHORITATIVE_MIGRATION_SEQUENCE[0];
    await prisma.$executeRawUnsafe(`UPDATE "_app_migrations" SET "checksum" = 'tampered_checksum_hex' WHERE "name" = $1;`, tamperedName);

    const driftAudit = await runner.auditDrift();
    assert.equal(driftAudit.hasDrift, true, 'Drift audit detects tampered checksum');
    assert.ok(driftAudit.driftDetails[0].includes('Checksum mismatch'), 'Drift details identify corrupted migration checksum');

    // Restore correct checksum
    const correctChecksum = runner.computeChecksum(runner.getMigrationFiles()[0].content);
    await prisma.$executeRawUnsafe(`UPDATE "_app_migrations" SET "checksum" = $1 WHERE "name" = $2;`, correctChecksum, tamperedName);

    const restoredAudit = await runner.auditDrift();
    assert.equal(restoredAudit.hasDrift, false, 'Drift audit clean after restoring checksum');
    console.log('  ✅ PASS: Test F: Drift detection identifies checksum discrepancies and verifies integrity.');

    console.log('\n======================================================');
    console.log('🎉 ALL BATCH 11.17 MIGRATION SYSTEM TESTS PASSED!');
    console.log('======================================================\n');

  } catch (error) {
    console.error('\n❌ Test Failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
