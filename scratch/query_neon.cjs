process.env.DATABASE_URL = "postgresql://neondb_owner:npg_2eyXDEUVYo0g@ep-divine-cell-b2b6snh7-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const rows = await prisma.ozeldersAppState.findMany();
    console.log('ALL ROWS IN NEON DB TABLE:', rows.length);
    rows.forEach(r => {
      console.log('ID:', r.id, 'Updated:', r.updatedAt);
      console.log('Teachers:', r.data?.teachers?.map(t => t.name));
      console.log('Students:', r.data?.students?.map(s => s.name));
      console.log('-------------------------------------------');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
