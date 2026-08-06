import { AppState, Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification } from '../types';

const STORAGE_KEY = 'coach_app_state';
const CLOUD_OBJECT_URL = 'https://jsonblob.com/api/jsonBlob/019fd8d2-78a8-7163-8bad-2e10a963783c';

export const defaultTeachers: Teacher[] = [
  {
    id: 'teacher-yasin-1',
    name: 'Yasin Eren Alacahan',
    email: 'yasinalacahan23@gmail.com',
    subject: 'Fizik / Matematik',
    password: '123456',
    createdAt: '2026-07-25T10:00:00.000Z'
  },
  {
    id: 'teacher-ayse-2',
    name: 'Ayşe Yılmaz',
    email: 'ayse@ogretmen.com',
    subject: 'Matematik',
    password: '123456',
    createdAt: '2026-07-26T12:00:00.000Z'
  },
  {
    id: 'teacher-mehmet-3',
    name: 'Mehmet Demir',
    email: 'mehmet@ogretmen.com',
    subject: 'Kimya',
    password: '123456',
    createdAt: '2026-07-27T14:30:00.000Z'
  },
  {
    id: 'teacher-elif-4',
    name: 'Elif Kaya',
    email: 'elif@ogretmen.com',
    subject: 'Biyoloji',
    password: '123456',
    createdAt: '2026-07-28T09:15:00.000Z'
  }
];

const initialMockState: AppState = {
  teachers: defaultTeachers,
  activeTeacherId: 'teacher-yasin-1',
  userRole: 'teacher',
  activeStudentId: null,
  students: [],
  lessons: [],
  homeworks: [],
  transactions: [],
  notifications: []
};

// Helper to merge items by id / key preserving latest properties
function mergeById<T extends { id: string }>(primaryArr: T[] = [], secondaryArr: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of primaryArr) {
    if (item && item.id) map.set(item.id, { ...item });
  }
  for (const item of secondaryArr) {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : { ...item });
    }
  }
  return Array.from(map.values());
}

// Helper to ensure Yasin Eren Alacahan Admin Teacher is ALWAYS present
function ensureAdminTeacher(teachers: Teacher[]): Teacher[] {
  let list = Array.isArray(teachers) ? [...teachers] : [];
  const adminIndex = list.findIndex(t => 
    t.id === 'teacher-yasin-1' || 
    t.email.toLowerCase().includes('yasinalacahan') || 
    t.name.toLowerCase().includes('yasin eren alacahan')
  );

  if (adminIndex === -1) {
    list.unshift(defaultTeachers[0]);
  } else {
    list[adminIndex] = {
      ...defaultTeachers[0],
      ...list[adminIndex],
      email: 'yasinalacahan23@gmail.com'
    };
  }
  return list;
}

export const storageService = {
  getState(): AppState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveState(initialMockState);
      return initialMockState;
    }
    try {
      const parsed = JSON.parse(raw);
      let teachersList = mergeById(defaultTeachers, parsed.teachers || []);
      teachersList = ensureAdminTeacher(teachersList);

      const activeTeacherId = teachersList.some((t: Teacher) => t.id === parsed.activeTeacherId)
        ? parsed.activeTeacherId
        : (teachersList[0]?.id || 'teacher-yasin-1');

      return {
        teachers: teachersList,
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
    const sanitizedState = {
      ...state,
      teachers: ensureAdminTeacher(state.teachers)
    };

    // 1. Instant local persistence
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedState));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 2. Non-blocking Async Cloud Push with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch(CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        teachers: sanitizedState.teachers,
        students: sanitizedState.students,
        lessons: sanitizedState.lessons,
        homeworks: sanitizedState.homeworks,
        transactions: sanitizedState.transactions,
        notifications: sanitizedState.notifications
      }),
      signal: controller.signal
    }).catch(() => {})
      .finally(() => clearTimeout(timeoutId));
  },

  // Fetch and merge cloud state with local storage
  async fetchCloudState(): Promise<AppState | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(CLOUD_OBJECT_URL, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const cloudData = await res.json();
      if (!cloudData || typeof cloudData !== 'object') return null;

      const currentState = this.getState();

      const mergedTeachers = ensureAdminTeacher(
        mergeById(currentState.teachers, cloudData.teachers || [])
      );

      const mergedState: AppState = {
        teachers: mergedTeachers,
        activeTeacherId: currentState.activeTeacherId || mergedTeachers[0]?.id || 'teacher-yasin-1',
        userRole: currentState.userRole || 'teacher',
        activeStudentId: currentState.activeStudentId,
        students: mergeById(currentState.students, cloudData.students || []),
        lessons: mergeById(currentState.lessons, cloudData.lessons || []),
        homeworks: mergeById(currentState.homeworks, cloudData.homeworks || []),
        transactions: mergeById(currentState.transactions, cloudData.transactions || []),
        notifications: mergeById(currentState.notifications, cloudData.notifications || [])
      };

      // Save merged result back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedState));

      // Asynchronously sync back merged state
      fetch(CLOUD_OBJECT_URL, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          teachers: mergedState.teachers,
          students: mergedState.students,
          lessons: mergedState.lessons,
          homeworks: mergedState.homeworks,
          transactions: mergedState.transactions,
          notifications: mergedState.notifications
        })
      }).catch(() => {});

      return mergedState;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  },

  // Teachers CRUD
  getTeachers(): Teacher[] {
    return this.getState().teachers;
  },

  saveTeachers(teachers: Teacher[]): void {
    const state = this.getState();
    state.teachers = ensureAdminTeacher(teachers);
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

