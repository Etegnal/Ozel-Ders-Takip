export type StudentStatus = 'active' | 'archive';

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  grade: string; // e.g., "8. Sınıf"
  hourlyRate: number; // rate per hour e.g. 1000
  monthlyRate?: number; // optional fixed monthly fee e.g. 4000
  balance: number; // accumulated balance: positive means debt/due, negative means prepaid
  status: StudentStatus;
  weeklySchedule?: string[]; // e.g., ["Pazartesi 17:00", "Çarşamba 18:00"]
  notes?: string;
  createdAt: string;
}

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
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
  title: string;
  message: string;
  date: string; // ISO String
  read: boolean;
  type: 'homework' | 'lesson' | 'finance' | 'system';
}

export interface AppState {
  students: Student[];
  lessons: Lesson[];
  homeworks: Homework[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
}
