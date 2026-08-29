import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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

  try {
    if (req.method === 'GET') {
      const dbStateRecord = await prisma.ozeldersAppState.findUnique({
        where: { id: 'default' }
      });

      if (dbStateRecord && dbStateRecord.data) {
        return res.status(200).json(dbStateRecord.data);
      } else {
        return res.status(200).json({ empty: true });
      }
    }

    if (req.method === 'POST') {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Geçersiz veri gönderildi' });
      }

      await prisma.ozeldersAppState.upsert({
        where: { id: 'default' },
        update: { data: payload },
        create: { id: 'default', data: payload }
      });

      return res.status(200).json({ success: true, timestamp: new Date().toISOString() });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Vercel API Sync Error:', error);
    return res.status(500).json({ error: error.message || 'Veritabanı hatası' });
  }
}
