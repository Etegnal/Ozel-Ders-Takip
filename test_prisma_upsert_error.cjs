const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpsert() {
  console.log('--- TESTING PRISMA UPSERT LOCALLY ---');
  
  const testPayload = {
    teachers: [
      {
        id: 'teacher-yasin-1',
        name: 'ADMİN',
        email: 'yasinalacahan23@gmail.com',
        subject: 'Fizik / Matematik',
        password: 'admin123',
        createdAt: '2026-07-25T10:00:00.000Z'
      }
    ],
    students: [],
    lessons: [],
    homeworks: [],
    transactions: [],
    notifications: [],
    questions: []
  };

  try {
    const res = await prisma.ozeldersAppState.upsert({
      where: { id: 'default' },
      update: { data: testPayload },
      create: { id: 'default', data: testPayload }
    });
    console.log('UPSERT SUCCESSFUL:', res.id);
  } catch (e) {
    console.error('UPSERT ERROR:', e);
  }
}

testUpsert().finally(() => prisma.$disconnect());
