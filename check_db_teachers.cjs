const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTeachers() {
  console.log('--- CHECKING NEON POSTGRESQL STATE ---');
  try {
    const record = await prisma.ozeldersAppState.findUnique({ where: { id: 'default' } });
    if (record && record.data) {
      console.log('RECORD DATA TEACHERS:', JSON.stringify(record.data.teachers, null, 2));
      console.log('RECORD DATA STUDENTS COUNT:', record.data.students?.length || 0);
    } else {
      console.log('NO RECORD FOUND IN NEON POSTGRESQL!');
    }
  } catch (err) {
    console.error('Database query error:', err.message);
  }
}

checkTeachers().finally(() => prisma.$disconnect());
