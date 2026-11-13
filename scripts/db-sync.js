const { execSync } = require('child_process');
const path = require('path');

async function syncDatabase() {
  const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('postgres:postgres@localhost')) {
    console.log('⚡ Skipping auto-migration on localhost/dummy database URL.');
    return;
  }

  console.log('🚀 Real PostgreSQL database detected on Neon. Running database synchronization...');
  try {
    console.log('📦 Applying authoritative versioned migrations via MigrationRunner...');
    execSync('npx tsx -e "import { MigrationRunner } from \'./src/lib/services/migration-runner\'; new MigrationRunner().runMigrations().then(console.log);"', { stdio: 'inherit' });

    console.log('🌱 Seeding initial catalog, store, and staff data...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

    console.log('✅ Neon database setup and migrations completed successfully!');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
  }
}

syncDatabase();
