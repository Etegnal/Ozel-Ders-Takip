process.env.DATABASE_URL = "postgresql://neondb_owner:npg_2eyXDEUVYo0g@ep-divine-cell-b2b6snh7-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Ensuring tables...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OzeldersAppStateSnapshots" (
        "id" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OzeldersAppStateSnapshots_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Table OzeldersAppStateSnapshots created/verified!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
