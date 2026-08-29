const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  console.log('--- CHECKING NEON POSTGRESQL TABLES ---');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('TABLES IN PUBLIC SCHEMA:', JSON.stringify(tables, null, 2));

    // Try creating the table directly via raw SQL if missing!
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "OzeldersAppState" (
        "id" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OzeldersAppState_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ TABLE OzeldersAppState CREATED OR VERIFIED IN NEON DB!');
  } catch (err) {
    console.error('ERROR CHECKING TABLES:', err);
  }
}

checkTables().finally(() => prisma.$disconnect());
