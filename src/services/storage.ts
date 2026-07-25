import { AppState, Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification } from '../types';

const STORAGE_KEY = 'coach_app_state';

const initialMockState: AppState = {
  teachers: [
    {
      id: 'teacher-1',
      name: 'Rahmi KOÇ',
      email: 'rahmik93@gmail.com',
      subject: 'Matematik',
      createdAt: '2026-07-01T10:00:00Z'
    },
    {
      id: 'teacher-2',
      name: 'Merve YILMAZ',
      email: 'merve.ylmz@gmail.com',
      subject: 'Fizik',
      createdAt: '2026-07-10T10:00:00Z'
    }
  ],
  activeTeacherId: 'teacher-1',
  students: [
    {
      id: 'student-1',
      teacherId: 'teacher-1',
      name: 'Eren',
      phone: '+905435269142',
      parentName: '',
      parentPhone: '',
      grade: '8. Sınıf',
      hourlyRate: 1000,
      monthlyRate: 4000,
      balance: 0,
      status: 'active',
      weeklySchedule: ['Çarşamba 18:00', 'Cuma 18:00'],
      notes: 'Matematik LGS hazırlık öğrencisi. Konu eksikleri gideriliyor.',
      createdAt: '2026-07-01T10:00:00Z'
    },
    {
      id: 'student-2',
      teacherId: 'teacher-2',
      name: 'Ayşe Kaya',
      phone: '+905551234567',
      parentName: 'Fatma Kaya',
      parentPhone: '+905557654321',
      grade: '10. Sınıf',
      hourlyRate: 1200,
      monthlyRate: 4800,
      balance: 1200,
      status: 'active',
      weeklySchedule: ['Cumartesi 10:00'],
      notes: 'Fizik okul derslerine takviye ve TYT hazırlık.',
      createdAt: '2026-07-10T11:00:00Z'
    }
  ],
  lessons: [
    {
      id: 'lesson-1',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      studentName: 'Eren',
      date: '2026-07-22', // July 22, 2026
      startTime: '18:00',
      durationMinutes: 60,
      rate: 1000,
      status: 'completed',
      notes: 'LGS Üslü Sayılar konusu işlendi. Test çözümü yapıldı.'
    },
    {
      id: 'lesson-2',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      studentName: 'Eren',
      date: '2026-07-24', // July 24, 2026
      startTime: '18:00',
      durationMinutes: 60,
      rate: 1000,
      status: 'completed',
      notes: 'Kareköklü Sayılar giriş yapıldı.'
    },
    {
      id: 'lesson-3',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      studentName: 'Eren',
      date: '2026-07-29', // July 29, 2026 (Upcoming)
      startTime: '18:00',
      durationMinutes: 60,
      rate: 1000,
      status: 'scheduled'
    },
    {
      id: 'lesson-4',
      teacherId: 'teacher-2',
      studentId: 'student-2',
      studentName: 'Ayşe Kaya',
      date: '2026-07-25', // Today
      startTime: '10:00',
      durationMinutes: 90,
      rate: 1800,
      status: 'scheduled'
    }
  ],
  homeworks: [
    {
      id: 'homework-1',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      studentName: 'Eren',
      title: 'test',
      description: 'LGS Matematik Üslü Sayılar 3. Test Kitabı - Sayfa 45-50 arası çözülecek.',
      dueDate: '2026-07-15', // 15 Temmuz Çarşamba
      dueTime: '23:59',
      status: 'evaluated',
      evaluation: 'Yetersiz AI'
    },
    {
      id: 'homework-2',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      studentName: 'Eren',
      title: 'Kareköklü Sayılar Ödevi',
      description: 'İlk 50 soru çözülüp kontrol edilecek.',
      dueDate: '2026-07-28',
      dueTime: '21:00',
      status: 'pending'
    }
  ],
  transactions: [
    {
      id: 'trans-1',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      studentName: 'Eren',
      type: 'income',
      amount: 2000,
      date: '2026-07-24',
      category: 'Ders Ücreti',
      notes: '2 Saatlik Ders Ödemesi alındı'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      teacherId: 'teacher-1',
      title: 'Ödev Değerlendirildi',
      message: "Eren'in 'test' ödevi Yetersiz olarak işaretlendi.",
      date: '2026-07-15T21:58:00Z',
      read: false,
      type: 'homework'
    },
    {
      id: 'notif-2',
      teacherId: 'teacher-1',
      title: 'Ders Hatırlatması',
      message: 'Bugün saat 18:00\'da Eren ile dersiniz var.',
      date: '2026-07-24T08:00:00Z',
      read: true,
      type: 'lesson'
    }
  ]
};

export const storageService = {
  getState(): AppState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveState(initialMockState);
      return initialMockState;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialMockState;
    }
  },

  saveState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  // Teachers CRUD
  getTeachers(): Teacher[] {
    return this.getState().teachers;
  },

  saveTeachers(teachers: Teacher[]): void {
    const state = this.getState();
    state.teachers = teachers;
    this.saveState(state);
  },

  getActiveTeacherId(): string {
    return this.getState().activeTeacherId;
  },

  setActiveTeacherId(id: string): void {
    const state = this.getState();
    state.activeTeacherId = id;
    this.saveState(state);
  },

  // Students CRUD
  getStudents(): Student[] {
    return this.getState().students;
  },

  saveStudents(students: Student[]): void {
    const state = this.getState();
    state.students = students;
    this.saveState(state);
  },

  // Lessons CRUD
  getLessons(): Lesson[] {
    return this.getState().lessons;
  },

  saveLessons(lessons: Lesson[]): void {
    const state = this.getState();
    state.lessons = lessons;
    this.saveState(state);
  },

  // Homeworks CRUD
  getHomeworks(): Homework[] {
    return this.getState().homeworks;
  },

  saveHomeworks(homeworks: Homework[]): void {
    const state = this.getState();
    state.homeworks = homeworks;
    this.saveState(state);
  },

  // Transactions CRUD
  getTransactions(): FinancialTransaction[] {
    return this.getState().transactions;
  },

  saveTransactions(transactions: FinancialTransaction[]): void {
    const state = this.getState();
    state.transactions = transactions;
    this.saveState(state);
  },

  // Notifications CRUD
  getNotifications(): AppNotification[] {
    return this.getState().notifications;
  },

  saveNotifications(notifications: AppNotification[]): void {
    const state = this.getState();
    state.notifications = notifications;
    this.saveState(state);
  }
};
