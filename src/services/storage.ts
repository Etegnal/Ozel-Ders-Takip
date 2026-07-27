import { AppState, Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification } from '../types';

const STORAGE_KEY = 'coach_app_state';

const initialMockState: AppState = {
  teachers: [],
  activeTeacherId: '',
  userRole: 'teacher',
  activeStudentId: null,
  students: [],
  lessons: [],
  homeworks: [],
  transactions: [],
  notifications: []
};

export const storageService = {
  getState(): AppState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveState(initialMockState);
      return initialMockState;
    }
    try {
      const parsed = JSON.parse(raw);
      const filteredTeachers = (parsed.teachers || []).filter(
        (t: Teacher) => !t.name.toLowerCase().includes('rahmi koç') && !t.name.toLowerCase().includes('rahmi koc')
      );
      const activeTeacherId = filteredTeachers.some((t: Teacher) => t.id === parsed.activeTeacherId)
        ? parsed.activeTeacherId
        : (filteredTeachers[0]?.id || '');

      return {
        teachers: filteredTeachers,
        activeTeacherId: activeTeacherId,
        userRole: parsed.userRole || 'teacher',
        activeStudentId: parsed.activeStudentId || null,
        students: (parsed.students || []).map((s: Student) => ({
          ...s,
          password: s.password || '123456'
        })),
        lessons: parsed.lessons || [],
        homeworks: parsed.homeworks || [],
        transactions: parsed.transactions || [],
        notifications: parsed.notifications || []
      };
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
