/**
 * Pravdhan Store — Authoritative Additive SQL Migration Runner
 * 
 * Manages ordered execution of additive versioned migrations with:
 * - Persistent ledger table: `_app_migrations`
 * - Checksum tracking (SHA-256) for drift detection
 * - Advisory lock on migration sequence to prevent concurrent corruption
 * - Transactional execution per migration
 * - Safe statement splitting respecting DO $$ ... $$ blocks
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

export interface MigrationRecord {
  id: string;
  name: string;
  checksum: string;
  appliedAt: Date;
  executionTimeMs: number;
}

export interface MigrationResult {
  appliedCount: number;
  skippedCount: number;
  appliedMigrations: string[];
  skippedMigrations: string[];
}

export const AUTHORITATIVE_MIGRATION_SEQUENCE = [
  '20261110_batch9_cash_collection.sql',
  '20261110_batch9_4_cash_collection_remediation.sql',
  '20261110_batch10_refund_ledger.sql',
  '20261112_batch11_2_order_idempotency.sql',
  '20261112_batch11_3_request_fingerprint.sql',
  '20261112_batch11_12_sms_outbox.sql',
];

export class MigrationRunner {
  private prisma: PrismaClient;
  private migrationsDir: string;

  constructor(prismaClient?: PrismaClient, migrationsDir?: string) {
    this.prisma = prismaClient || new PrismaClient();
    this.migrationsDir = migrationsDir || path.join(process.cwd(), 'prisma', 'migrations');
  }

  /**
   * Initializes the persistent migration ledger table `_app_migrations` if not exists.
   */
  async initLedger(): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_app_migrations" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "checksum" TEXT NOT NULL,
        "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "executionTimeMs" INTEGER NOT NULL
      );
    `);
    await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "_app_migrations_name_idx" ON "_app_migrations"("name");
    `);
  }

  /**
   * Computes SHA-256 checksum of file contents.
   */
  computeChecksum(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Splits SQL file content into individual executable statements, respecting DO $$ ... $$ blocks.
   */
  splitSqlStatements(content: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inDollarQuote = false;
    let dollarTag = '';

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!inDollarQuote && trimmed.startsWith('--')) {
        continue;
      }

      current += line + '\n';

      const matches = line.match(/\$[a-zA-Z0-9_]*\$/g);
      if (matches) {
        for (const match of matches) {
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarTag = match;
          } else if (match === dollarTag) {
            inDollarQuote = false;
            dollarTag = '';
          }
        }
      }

      if (!inDollarQuote && trimmed.endsWith(';')) {
        const stmt = current.trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        current = '';
      }
    }

    const remaining = current.trim();
    if (remaining.length > 0) {
      statements.push(remaining);
    }

    return statements;
  }

  /**
   * Discovers migration files and returns them in strictly defined authoritative order.
   */
  getMigrationFiles(): { name: string; fullPath: string; content: string; checksum: string }[] {
    return AUTHORITATIVE_MIGRATION_SEQUENCE.map((fileName) => {
      const fullPath = path.join(this.migrationsDir, fileName);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Required authoritative migration file missing: ${fileName}`);
      }
      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        name: fileName,
        fullPath,
        content,
        checksum: this.computeChecksum(content),
      };
    });
  }

  /**
   * Runs the complete migration pipeline under a global advisory lock.
   */
  async runMigrations(): Promise<MigrationResult> {
    await this.initLedger();

    const isPostgres = !(process.env.DATABASE_URL?.startsWith('file:') || process.env.DATABASE_URL?.startsWith('sqlite:'));
    const files = this.getMigrationFiles();

    const appliedMigrations: string[] = [];
    const skippedMigrations: string[] = [];

    return this.prisma.$transaction(async (tx) => {
      if (isPostgres) {
        await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(hashtext('pravdhan_app_migrations_lock'));`);
      }

      const appliedRows: any[] = await tx.$queryRawUnsafe(`SELECT * FROM "_app_migrations" ORDER BY "appliedAt" ASC;`);
      const appliedMap = new Map<string, { checksum: string }>();
      for (const row of appliedRows) {
        appliedMap.set(row.name, { checksum: row.checksum });
      }

      for (const file of files) {
        const existing = appliedMap.get(file.name);
        if (existing) {
          if (existing.checksum !== file.checksum) {
            throw new Error(`Schema drift detected in migration ${file.name}: recorded checksum ${existing.checksum} does not match current file checksum ${file.checksum}`);
          }
          skippedMigrations.push(file.name);
          continue;
        }

        const startTime = Date.now();
        // Execute migration SQL statement by statement
        const statements = this.splitSqlStatements(file.content);
        for (const statement of statements) {
          await tx.$executeRawUnsafe(statement);
        }
        const duration = Date.now() - startTime;

        const migrationId = `mig_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        await tx.$executeRawUnsafe(
          `INSERT INTO "_app_migrations" ("id", "name", "checksum", "appliedAt", "executionTimeMs") VALUES ($1, $2, $3, NOW(), $4);`,
          migrationId,
          file.name,
          file.checksum,
          duration
        );

        appliedMigrations.push(file.name);
      }

      return {
        appliedCount: appliedMigrations.length,
        skippedCount: skippedMigrations.length,
        appliedMigrations,
        skippedMigrations,
      };
    });
  }

  /**
   * Audits drift across all known migrations.
   */
  async auditDrift(): Promise<{ hasDrift: boolean; driftDetails: string[] }> {
    await this.initLedger();
    const appliedRows: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM "_app_migrations";`);
    const files = this.getMigrationFiles();
    const driftDetails: string[] = [];

    const fileMap = new Map(files.map(f => [f.name, f.checksum]));

    for (const row of appliedRows) {
      const fileChecksum = fileMap.get(row.name);
      if (!fileChecksum) {
        driftDetails.push(`Migration ${row.name} is in ledger but missing from filesystem`);
      } else if (fileChecksum !== row.checksum) {
        driftDetails.push(`Checksum mismatch for ${row.name}: DB has ${row.checksum}, file has ${fileChecksum}`);
      }
    }

    return {
      hasDrift: driftDetails.length > 0,
      driftDetails,
    };
  }
}
