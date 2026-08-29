const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkState() {
  console.log('--- CHECKING NEON DB STATE ---');
  try {
    const record = await prisma.ozeldersAppState.findUnique({ where: { id: 'default' } });
    if (record && record.data) {
      console.log('CLOUDDATA TEACHERS COUNT:', record.data.teachers?.length || 0);
      console.log('CLOUDDATA TEACHERS:', JSON.stringify(record.data.teachers, null, 2));
      console.log('CLOUDDATA STUDENTS COUNT:', record.data.students?.length || 0);
    } else {
      console.log('NO RECORD FOUND IN NEON DB!');
    }
  } catch (err) {
    console.error('Database query error:', err.message);
  }
}

checkState().finally(() => prisma.$disconnect());
