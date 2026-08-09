import { AppState, Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification } from '../types';

const STORAGE_KEY = 'coach_app_state_v3';
const CLOUD_DB_URL = 'https://jsonblob.com/api/jsonBlob/019fdd5b-5e5b-7c2e-b633-279d274f680c';

// Turkish-safe string normalizer (handles İ/i, I/ı, Ğ/g, Ü/u, Ş/s, Ö/o, Ç/c, whitespace)
export function normalizeStr(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

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

export const initialMockState: AppState = {
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

// Helper: Ensure Super Admin Yasin Eren Alacahan is ALWAYS present
export function ensureAdminTeacher(teachers: Teacher[]): Teacher[] {
  let list = Array.isArray(teachers) ? [...teachers] : [];
  const adminIndex = list.findIndex(t => 
    t.id === 'teacher-yasin-1' || 
    normalizeStr(t.email).includes('yasinalacahan') || 
    normalizeStr(t.name).includes('yasin eren alacahan')
  );

  if (adminIndex === -1) {
    list.unshift(defaultTeachers[0]);
  } else {
    list[adminIndex] = {
      ...defaultTeachers[0],
      ...list[adminIndex],
      email: 'yasinalacahan23@gmail.com',
      password: list[adminIndex].password || defaultTeachers[0].password
    };
  }
  return list;
}

// Smart merger for teachers (merges local + cloud without losing registered accounts or custom passwords)
export function mergeTeachers(local: Teacher[], cloud: Teacher[]): Teacher[] {
  const map = new Map<string, Teacher>();

  // 1. Add default teachers
  defaultTeachers.forEach(t => map.set(t.id, t));

  // 2. Add local teachers (local custom passwords ALWAYS take priority over default '123456')
  (local || []).forEach(t => {
    if (!t || !t.id) return;
    const existing = map.get(t.id);
    if (!existing) {
      map.set(t.id, t);
    } else {
      map.set(t.id, {
        ...existing,
        ...t,
        password: (t.password && t.password !== '123456') ? t.password : (existing.password || t.password || '123456')
      });
    }
  });

  // 3. Add cloud teachers (merge by id or email)
  (cloud || []).forEach(t => {
    if (!t || !t.id) return;
    const normCloudEmail = normalizeStr(t.email);
    const existingByEmail = Array.from(map.values()).find(
      ex => normalizeStr(ex.email) === normCloudEmail
    );
    const targetId = existingByEmail ? existingByEmail.id : t.id;
    const existing = map.get(targetId);

    if (!existing) {
      map.set(t.id, t);
    } else {
      // PRESERVE CUSTOM PASSWORD if present in either local or cloud!
      const customPassword = 
        (existing.password && existing.password !== '123456') ? existing.password :
        (t.password && t.password !== '123456') ? t.password :
        (existing.password || t.password || '123456');

      map.set(targetId, {
        ...existing,
        ...t,
        password: customPassword
      });
    }
  });

  return ensureAdminTeacher(Array.from(map.values()));
}

// Smart merger for collections by ID
export function mergeCollections<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  (local || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
  (cloud || []).forEach(item => {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    }
  });
  return Array.from(map.values());
}

let inMemoryState: AppState = { ...initialMockState };

// Try reading local cache on startup
try {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed && Array.isArray(parsed.teachers) && parsed.teachers.length > 0) {
      inMemoryState = {
        ...initialMockState,
        ...parsed,
        teachers: ensureAdminTeacher(parsed.teachers)
      };
    }
  }
} catch (e) {
  console.warn('Failed to load local cache', e);
}

export const storageService = {
  getState(): AppState {
    return inMemoryState;
  },

  async saveState(state: AppState): Promise<boolean> {
    const sanitizedState: AppState = {
      ...state,
      teachers: ensureAdminTeacher(state.teachers)
    };

    inMemoryState = sanitizedState;

    // Save to local cache
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedState));
    } catch {}

    // Direct Sync to Cloud DB with Retries
    const payload = JSON.stringify({
      teachers: sanitizedState.teachers,
      students: sanitizedState.students,
      lessons: sanitizedState.lessons,
      homeworks: sanitizedState.homeworks,
      transactions: sanitizedState.transactions,
      notifications: sanitizedState.notifications
    });

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(CLOUD_DB_URL, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: payload,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) return true;
      } catch {
        // Silent retry
      }
    }
    return false;
  },

  // Fetch Cloud State with Smart Merge
  async fetchCloudState(): Promise<AppState> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(CLOUD_DB_URL, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return inMemoryState;
      const cloudData = await res.json();
      if (!cloudData || typeof cloudData !== 'object') return inMemoryState;

      const mergedTeachers = mergeTeachers(inMemoryState.teachers, cloudData.teachers || []);
      const mergedStudents = mergeCollections(inMemoryState.students, cloudData.students || []).map((s: Student) => ({
        ...s,
        password: s.password || '123456'
      }));
      const mergedLessons = mergeCollections(inMemoryState.lessons, cloudData.lessons || []);
      const mergedHomeworks = mergeCollections(inMemoryState.homeworks, cloudData.homeworks || []);
      const mergedTransactions = mergeCollections(inMemoryState.transactions, cloudData.transactions || []);
      const mergedNotifications = mergeCollections(inMemoryState.notifications, cloudData.notifications || []);

      const updatedState: AppState = {
        teachers: mergedTeachers,
        activeTeacherId: inMemoryState.activeTeacherId || mergedTeachers[0]?.id || 'teacher-yasin-1',
        userRole: inMemoryState.userRole || 'teacher',
        activeStudentId: inMemoryState.activeStudentId || null,
        students: mergedStudents,
        lessons: mergedLessons,
        homeworks: mergedHomeworks,
        transactions: mergedTransactions,
        notifications: mergedNotifications
      };

      inMemoryState = updatedState;

      // Update local cache
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      } catch {}

      return updatedState;
    } catch {
      clearTimeout(timeoutId);
      return inMemoryState;
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


