process.env.DATABASE_URL = "postgresql://neondb_owner:npg_2eyXDEUVYo0g@ep-divine-cell-b2b6snh7-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const masterData = {
  teachers: [
    {
      id: "teacher-yasin-1",
      code: "KOC-1001",
      name: "ADMİN",
      email: "yasinalacahan23@gmail.com",
      subject: "Fizik / Matematik",
      password: "susamlıpatates",
      createdAt: "2026-07-25T10:00:00.000Z"
    },
    {
      id: "teacher-1788096203939",
      code: "KOC-1002",
      name: "Rahmi Koç",
      email: "rahmikoc@gmail.com",
      subject: "Matematik",
      password: "123",
      createdAt: "2026-08-30T13:23:23.939Z"
    },
    {
      id: "teacher-1788096238381",
      code: "KOC-1003",
      name: "Hüseyin Çiçek",
      email: "cicekhuseyin2323@gmail.com",
      subject: "Fizik",
      password: "123",
      createdAt: "2026-08-30T13:23:58.381Z"
    }
  ],
  students: [
    {
      id: "student-1788096259859",
      name: "Ahmet Murat Yatmaz",
      phone: "5537706619",
      email: "ahmetmurat@gmail.com",
      grade: "12. Sınıf (YKS-TYT/AYT)",
      teacherId: "teacher-1788096203939",
      createdAt: "2026-08-30T13:24:19.859Z",
      balance: 0,
      hourlyRate: 500,
      monthlyHours: 8
    }
  ],
  lessons: [
    {
      id: "lesson-1788096300000",
      studentId: "student-1788096259859",
      teacherId: "teacher-1788096203939",
      subject: "Matematik",
      topic: "İntegral",
      date: "2026-08-30",
      startTime: "14:00",
      durationMinutes: 60,
      rate: 500,
      status: "completed",
      createdAt: "2026-08-30T13:25:00.000Z"
    }
  ],
  homeworks: [
    {
      id: "homework-1788096431475",
      studentId: "student-1788096259859",
      teacherId: "teacher-1788096203939",
      title: "Bunu görürsen 777 de",
      description: "Matematik test kitabı Sayfa 120-135 arası integral soruları çözülecek.",
      dueDate: "2026-09-02",
      status: "pending",
      createdAt: "2026-08-30T13:27:11.475Z"
    }
  ],
  transactions: [
    {
      id: "trans-1788110473404",
      date: "2026-08-30",
      type: "income",
      notes: "",
      amount: 1000,
      category: "Ders Ücreti",
      teacherId: "teacher-yasin-1"
    }
  ],
  notifications: [
    {
      id: "notif-jqeyz0g50",
      date: "2026-08-30T13:24:19.859Z",
      read: true,
      type: "system",
      title: "Yeni Öğrenci Kaydı",
      message: "Ahmet Murat Yatmaz (5537706619) sisteme öğrenci kaydı oluşturdu.",
      teacherId: "teacher-yasin-1"
    },
    {
      id: "notif-o2z6b092w",
      date: "2026-08-30T13:25:19.810Z",
      read: true,
      type: "system",
      title: "Yeni Soru Soruldu",
      message: "Ahmet Murat Yatmaz yeni bir soru yükledi. Konu: Ananyasa",
      teacherId: "teacher-yasin-1"
    },
    {
      id: "notif-1788096431475",
      date: "2026-08-30T13:27:11.475Z",
      read: false,
      type: "homework",
      title: "Yeni Ödev Eklendi",
      message: "Ahmet Murat Yatmaz için yeni bir ödev tanımlandı: Bunu görürsen 777 de",
      teacherId: "teacher-1788096203939"
    },
    {
      id: "notif-r27os0hff",
      date: "2026-08-30T13:29:50.710Z",
      read: false,
      type: "system",
      title: "Yeni Soru Soruldu",
      message: "Ahmet Murat Yatmaz yeni bir soru yükledi. Konu: İNTEGRALSSS",
      teacherId: "teacher-1788096203939"
    },
    {
      id: "notif-1788110473404",
      date: "2026-08-30T17:21:13.404Z",
      read: true,
      type: "finance",
      title: "Ödeme Tahsil Edildi",
      message: "Ahmet Murat Yatmaz öğrencisinden ₺1000 tahsil edildi.",
      teacherId: "teacher-yasin-1"
    }
  ],
  questions: [
    {
      id: "question-1788096319810",
      studentId: "student-1788096259859",
      studentName: "Ahmet Murat Yatmaz",
      teacherId: "teacher-1788096203939",
      lessonName: "Matematik",
      topicName: "İntegral",
      questionText: "İntegral sorusunun mantığı nedir?",
      status: "pending",
      createdAt: "2026-08-30T13:25:19.810Z"
    }
  ],
  examResults: [],
  adminMessages: []
};

async function restore() {
  try {
    console.log('Restoring master dataset to Neon Postgres DB...');
    await prisma.ozeldersAppState.upsert({
      where: { id: 'default' },
      update: { data: masterData },
      create: { id: 'default', data: masterData }
    });

    console.log('Creating snapshot record in OzeldersAppStateSnapshots...');
    await prisma.$executeRawUnsafe(
      `INSERT INTO "OzeldersAppStateSnapshots" ("id", "data", "createdAt") VALUES ($1, $2::jsonb, NOW());`,
      `snapshot-${Date.now()}`,
      JSON.stringify(masterData)
    );

    console.log('--- RESTORE COMPLETED SUCCESSFULLY ---');
    console.log('Teachers:', masterData.teachers.map(t => t.name));
    console.log('Students:', masterData.students.map(s => s.name));
  } catch (err) {
    console.error('Restore Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
