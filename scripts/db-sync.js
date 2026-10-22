const { execSync } = require('child_process');

async function syncDatabase() {
  const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('postgres:postgres@localhost')) {
    console.log('⚡ Skipping auto-migration on localhost/dummy database URL.');
    return;
  }

  console.log('🚀 Real PostgreSQL database detected on Neon. Running database synchronization...');
  try {
    console.log('📦 Pushing Prisma schema to Neon PostgreSQL...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    console.log('🌱 Seeding initial catalog, store, and staff data...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

    console.log('✅ Neon database setup and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
  }
}

syncDatabase();
