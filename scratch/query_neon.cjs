process.env.DATABASE_URL = "postgresql://neondb_owner:npg_2eyXDEUVYo0g@ep-divine-cell-b2b6snh7-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const record = await prisma.ozeldersAppState.findUnique({ where: { id: 'default' } });
    console.log('RECORD FOUND:');
    console.log(JSON.stringify(record?.data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
