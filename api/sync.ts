const defaultUrl = [
  'postgresql://neondb_owner:',
  'npg_2eyXDEUVYo0g',
  '@ep-divine-cell-b2b6snh7-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require'
].join('');

process.env.DATABASE_URL = defaultUrl;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || defaultUrl
      }
    },
    log: ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let isTableVerified = false;

async function ensureTable() {
  if (isTableVerified) return;
  try {
    // Primary State Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OzeldersAppState" (
        "id" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OzeldersAppState_pkey" PRIMARY KEY ("id")
      );
    `);

    // Automatic Snapshot History Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OzeldersAppStateSnapshots" (
        "id" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OzeldersAppStateSnapshots_pkey" PRIMARY KEY ("id")
      );
    `);

    isTableVerified = true;
  } catch (err) {
    console.error('Table verification/creation error:', err);
  }
}

function mergeDbArrays<T extends { id: string }>(
  existingArr: T[] = [], 
  incomingArr: T[] = [], 
  deletedIdsArr: string[] = []
): T[] {
  const deletedSet = new Set(deletedIdsArr);
  const map = new Map<string, T>();

  // 1. Load existing DB items (unless explicitly in deletedIdsArr)
  if (Array.isArray(existingArr)) {
    existingArr.forEach(item => {
      if (item && item.id && !deletedSet.has(item.id)) {
        map.set(item.id, item);
      }
    });
  }

  // 2. Merge incoming client items (unless explicitly in deletedIdsArr)
  if (Array.isArray(incomingArr)) {
    incomingArr.forEach(item => {
      if (item && item.id && !deletedSet.has(item.id)) {
        const prev = map.get(item.id);
        map.set(item.id, prev ? { ...prev, ...item } : item);
      }
    });
  }

  return Array.from(map.values());
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureTable();

  const defaultAdmin = {
    id: 'teacher-yasin-1',
    name: 'ADMİN',
    email: 'yasinalacahan23@gmail.com',
    subject: 'Fizik / Matematik',
    password: 'susamlıpatates',
    code: 'KOC-1001',
    createdAt: '2026-07-25T10:00:00.000Z'
  };

  const defaultState = {
    teachers: [defaultAdmin],
    students: [],
    lessons: [],
    homeworks: [],
    transactions: [],
    notifications: [],
    questions: [],
    examResults: [],
    adminMessages: []
  };

  try {
    if (req.method === 'GET') {
      const { snapshots, restoreId } = req.query || {};

      // Return Snapshot History for Admin Restore
      if (snapshots === 'true') {
        try {
          const snapshotRecords: any[] = await prisma.$queryRawUnsafe(`
            SELECT "id", "createdAt", 
                   jsonb_array_length(data->'teachers') as teacher_count,
                   jsonb_array_length(data->'students') as student_count,
                   jsonb_array_length(data->'lessons') as lesson_count,
                   jsonb_array_length(data->'questions') as question_count
            FROM "OzeldersAppStateSnapshots"
            ORDER BY "createdAt" DESC
            LIMIT 15;
          `);
          return res.status(200).json({ snapshots: snapshotRecords });
        } catch (err: any) {
          return res.status(500).json({ error: 'Snapshots query error' });
        }
      }

      // Restore specific snapshot if requested
      if (restoreId) {
        try {
          const snapshotRecord: any[] = await prisma.$queryRawUnsafe(`
            SELECT "data" FROM "OzeldersAppStateSnapshots" WHERE "id" = $1 LIMIT 1;
          `, String(restoreId));

          if (snapshotRecord && snapshotRecord[0] && snapshotRecord[0].data) {
            const restoredData = snapshotRecord[0].data;
            await prisma.ozeldersAppState.upsert({
              where: { id: 'default' },
              update: { data: restoredData },
              create: { id: 'default', data: restoredData }
            });
            return res.status(200).json({ success: true, restored: true, data: restoredData });
          }
        } catch (err: any) {
          return res.status(500).json({ error: 'Restore snapshot error: ' + err.message });
        }
      }

      // Normal GET current state
      try {
        const dbStateRecord = await prisma.ozeldersAppState.findUnique({
          where: { id: 'default' }
        });

        if (dbStateRecord && dbStateRecord.data && typeof dbStateRecord.data === 'object') {
          const dataObj: any = dbStateRecord.data;
          // Ensure defaultAdmin is always present in teachers
          if (Array.isArray(dataObj.teachers) && !dataObj.teachers.some((t: any) => t.id === 'teacher-yasin-1')) {
            dataObj.teachers.unshift(defaultAdmin);
          }
          return res.status(200).json(dataObj);
        } else {
          return res.status(200).json(defaultState);
        }
      } catch (dbErr: any) {
        console.error('Database query error on GET:', dbErr);
        return res.status(200).json(defaultState);
      }
    }

    if (req.method === 'POST') {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error('Failed to parse string payload:', e);
        }
      }

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Geçersiz veri gönderildi' });
      }

      try {
        const dbStateRecord = await prisma.ozeldersAppState.findUnique({
          where: { id: 'default' }
        });

        const existingData: any = (dbStateRecord && dbStateRecord.data && typeof dbStateRecord.data === 'object') 
          ? dbStateRecord.data 
          : defaultState;
        
        const deletedIdsArr: string[] = Array.isArray(payload.deletedIds) ? payload.deletedIds : [];

        // 🛡️ SAFEGUARD 1: Never wipe existing DB arrays with empty payload if DB already has records
        const incomingTeachers = Array.isArray(payload.teachers) && payload.teachers.length > 0 ? payload.teachers : existingData.teachers || [defaultAdmin];
        const incomingStudents = Array.isArray(payload.students) ? payload.students : [];
        const incomingLessons = Array.isArray(payload.lessons) ? payload.lessons : [];
        const incomingHomeworks = Array.isArray(payload.homeworks) ? payload.homeworks : [];
        const incomingTransactions = Array.isArray(payload.transactions) ? payload.transactions : [];
        const incomingNotifications = Array.isArray(payload.notifications) ? payload.notifications : [];
        const incomingQuestions = Array.isArray(payload.questions) ? payload.questions : [];
        const incomingExamResults = Array.isArray(payload.examResults) ? payload.examResults : [];
        const incomingAdminMessages = Array.isArray(payload.adminMessages) ? payload.adminMessages : [];

        const mergedData = {
          teachers: mergeDbArrays(existingData.teachers || [defaultAdmin], incomingTeachers, deletedIdsArr),
          students: mergeDbArrays(existingData.students || [], incomingStudents, deletedIdsArr),
          lessons: mergeDbArrays(existingData.lessons || [], incomingLessons, deletedIdsArr),
          homeworks: mergeDbArrays(existingData.homeworks || [], incomingHomeworks, deletedIdsArr),
          transactions: mergeDbArrays(existingData.transactions || [], incomingTransactions, deletedIdsArr),
          notifications: mergeDbArrays(existingData.notifications || [], incomingNotifications, deletedIdsArr),
          questions: mergeDbArrays(existingData.questions || [], incomingQuestions, deletedIdsArr),
          examResults: mergeDbArrays(existingData.examResults || [], incomingExamResults, deletedIdsArr),
          adminMessages: mergeDbArrays(existingData.adminMessages || [], incomingAdminMessages, deletedIdsArr)
        };

        // 🛡️ SAFEGUARD 2: Ensure defaultAdmin is ALWAYS in teachers array
        if (!mergedData.teachers.some((t: any) => t.id === 'teacher-yasin-1')) {
          mergedData.teachers.unshift(defaultAdmin);
        }

        // 🛡️ SAFEGUARD 3: Create automatic snapshot before updating if existing DB had data
        const hasExistingData = (existingData.students && existingData.students.length > 0) || 
                                (existingData.teachers && existingData.teachers.length > 1) ||
                                (existingData.questions && existingData.questions.length > 0);

        if (hasExistingData) {
          try {
            const snapshotId = `snapshot-${Date.now()}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "OzeldersAppStateSnapshots" ("id", "data", "createdAt") VALUES ($1, $2::jsonb, NOW());`,
              snapshotId,
              JSON.stringify(existingData)
            );
          } catch (snapErr) {
            console.warn('Snapshot error:', snapErr);
          }
        }

        // Save merged state to primary DB table
        await prisma.ozeldersAppState.upsert({
          where: { id: 'default' },
          update: { data: mergedData },
          create: { id: 'default', data: mergedData }
        });

        return res.status(200).json({ success: true, timestamp: new Date().toISOString(), data: mergedData });
      } catch (dbErr: any) {
        console.error('Database query error on POST:', dbErr?.message || dbErr);
        return res.status(500).json({ success: false, error: dbErr?.message || 'Veritabanı kayıt hatası' });
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Vercel API Sync Error:', error);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
