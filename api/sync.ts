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
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OzeldersAppState" (
        "id" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OzeldersAppState_pkey" PRIMARY KEY ("id")
      );
    `);
    isTableVerified = true;
  } catch (err) {
    console.error('Table verification/creation error:', err);
  }
}

function mergeDbArrays<T extends { id: string }>(existingArr: T[] = [], incomingArr: T[] = [], deletedIdsArr: string[] = []): T[] {
  const deletedSet = new Set(deletedIdsArr);
  const map = new Map<string, T>();

  if (Array.isArray(existingArr)) {
    existingArr.forEach(item => {
      if (item && item.id && !deletedSet.has(item.id)) {
        map.set(item.id, item);
      }
    });
  }

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

  const defaultState = {
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
    if (req.method === 'GET') {
      try {
        const dbStateRecord = await prisma.ozeldersAppState.findUnique({
          where: { id: 'default' }
        });

        if (dbStateRecord && dbStateRecord.data) {
          return res.status(200).json(dbStateRecord.data);
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

        const existingData: any = (dbStateRecord && dbStateRecord.data) ? dbStateRecord.data : defaultState;
        const deletedIdsArr: string[] = Array.isArray(payload.deletedIds) ? payload.deletedIds : [];

        const mergedData = {
          teachers: mergeDbArrays(existingData.teachers || defaultState.teachers, payload.teachers || [], deletedIdsArr),
          students: mergeDbArrays(existingData.students || [], payload.students || [], deletedIdsArr),
          lessons: mergeDbArrays(existingData.lessons || [], payload.lessons || [], deletedIdsArr),
          homeworks: mergeDbArrays(existingData.homeworks || [], payload.homeworks || [], deletedIdsArr),
          transactions: mergeDbArrays(existingData.transactions || [], payload.transactions || [], deletedIdsArr),
          notifications: mergeDbArrays(existingData.notifications || [], payload.notifications || [], deletedIdsArr),
          questions: mergeDbArrays(existingData.questions || [], payload.questions || [], deletedIdsArr),
          examResults: mergeDbArrays(existingData.examResults || [], payload.examResults || [], deletedIdsArr),
          adminMessages: mergeDbArrays(existingData.adminMessages || [], payload.adminMessages || [], deletedIdsArr)
        };

        await prisma.ozeldersAppState.upsert({
          where: { id: 'default' },
          update: { data: mergedData },
          create: { id: 'default', data: mergedData }
        });

        return res.status(200).json({ success: true, timestamp: new Date().toISOString() });
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
