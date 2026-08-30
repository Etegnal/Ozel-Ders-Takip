export interface Teacher {
  id: string;
  code?: string; // Unique student pairing code e.g. KOC-1001
  name: string;
  email: string;
  subject: string;
  password?: string;
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
  attachmentUrl?: string; // Image base64 or file URL
  attachmentName?: string;
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

export interface StudentQuestion {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  lessonName: string;
  topicName: string;
  questionImage: string; // Base64 compressed JPEG
  questionText?: string;
  solutionImage?: string; // Base64 compressed JPEG
  solutionText?: string;
  solutionAudio?: string; // Base64 webm/mp3 audio data URL
  status: 'pending' | 'solved';
  feedback?: 'understood' | 'not_understood';
  solvedAt?: string;
  feedbackAt?: string;
  createdAt: string;
}

export interface SubjectScore {
  subject: string;
  correct: number;
  incorrect: number;
  net: number;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  examTitle: string;
  examType: 'TYT' | 'AYT' | 'LGS' | 'Diğer';
  date: string; // YYYY-MM-DD
  scores: SubjectScore[];
  totalNet: number;
  notes?: string;
  createdAt: string;
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
  questions: StudentQuestion[];
  examResults?: ExamResult[];
}
