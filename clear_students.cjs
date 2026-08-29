const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database and clearing all student data...');
  
  const existing = await prisma.ozeldersAppState.findUnique({
    where: { id: 'default' }
  });

  let currentData = existing ? existing.data : {};
  if (typeof currentData === 'string') {
    try { currentData = JSON.parse(currentData); } catch {}
  }

  const updatedData = {
    ...currentData,
    students: [],
    lessons: [],
    homeworks: [],
    transactions: [],
    notifications: [],
    questions: []
  };

  await prisma.ozeldersAppState.upsert({
    where: { id: 'default' },
    update: { data: updatedData },
    create: { id: 'default', data: updatedData }
  });

  console.log('Successfully cleared all student data from Neon PostgreSQL!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
