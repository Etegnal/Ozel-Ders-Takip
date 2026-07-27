export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  password?: string; // Optional if we want, but required for registration. Let's make it optional or required. Let's make it required.
  createdAt: string;
  whatsappSettings?: {
    enabled: boolean;
    idInstance: string;
    apiTokenInstance: string;
  };
}

export type StudentStatus = 'active' | 'archive';

export interface Student {
  id: string;
  teacherId: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  parentName?: string;
  parentPhone?: string;
  grade: string; // e.g., "8. Sınıf"
  hourlyRate: number; // rate per hour e.g. 1000
  monthlyHours?: number; // optional monthly target hours e.g. 8
  balance: number; // accumulated balance: positive means debt/due, negative means prepaid
  status: StudentStatus;
  weeklySchedule?: string[]; // e.g., ["Pazartesi 17:00", "Çarşamba 18:00"]
  notes?: string;
  createdAt: string;
}

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number; // e.g. 60, 90
  rate: number; // rate calculated/applied for this lesson
  status: LessonStatus;
  notes?: string;
}

export type HomeworkStatus = 'pending' | 'completed' | 'overdue' | 'evaluated';

export interface Homework {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  status: HomeworkStatus;
  evaluation?: 'excellent' | 'good' | 'average' | 'poor' | string; // e.g., "Yetersiz AI" or "Pek İyi"
}

export type TransactionType = 'income' | 'expense';

export interface FinancialTransaction {
  id: string;
  teacherId: string;
  studentId?: string;
  studentName?: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string; // e.g., "Ders Ücreti", "Kaynak Kitap", "Ulaşım"
  notes?: string;
}

export interface AppNotification {
  id: string;
  teacherId: string;
  title: string;
  message: string;
  date: string; // ISO String
  read: boolean;
  type: 'homework' | 'lesson' | 'finance' | 'system';
}

export interface AppState {
  teachers: Teacher[];
  activeTeacherId: string;
  userRole: 'teacher' | 'student';
  activeStudentId: string | null;
  students: Student[];
  lessons: Lesson[];
  homeworks: Homework[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
}
