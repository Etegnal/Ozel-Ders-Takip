import { AppState, Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification, StudentQuestion } from '../types';

const STORAGE_KEY = 'koc_app_state_v10_force_cloud';

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

export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) {
    digits = digits.substring(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.substring(1);
  }
  return digits;
}

export const defaultTeachers: Teacher[] = [
  {
    id: 'teacher-yasin-1',
    code: 'KOC-1001',
    name: 'ADMİN',
    email: 'yasinalacahan23@gmail.com',
    subject: 'Fizik / Matematik',
    password: 'admin123',
    createdAt: '2026-07-25T10:00:00.000Z'
  }
];

export function generateTeacherCode(id: string): string {
  const numericStr = id.replace(/\D/g, '');
  if (numericStr.length >= 4) {
    return 'KOC-' + numericStr.slice(-4);
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const codeNum = Math.abs(hash % 9000) + 1000;
  return 'KOC-' + codeNum;
}

export function pruneOldQuestions(questions: StudentQuestion[]): StudentQuestion[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffTime = thirtyDaysAgo.getTime();
  
  return (questions || []).filter(q => {
    const qDate = new Date(q.createdAt).getTime();
    return qDate >= cutoffTime;
  });
}

export const initialMockState: AppState = {
  teachers: defaultTeachers,
  activeTeacherId: '',
  userRole: 'teacher',
  activeStudentId: null,
  students: [],
  lessons: [],
  homeworks: [],
  transactions: [],
  notifications: [],
  questions: [],
  examResults: []
};

const LEGACY_TEST_IDS = ['teacher-ayse-2', 'teacher-mehmet-3', 'teacher-elif-4', 'teacher-rahmi-5'];

// Helper: Ensure Super Admin ADMİN is ALWAYS present and all teachers have pairing codes
export function ensureAdminTeacher(teachers: Teacher[]): Teacher[] {
  let list = Array.isArray(teachers) ? teachers.filter(t => t && t.id && !LEGACY_TEST_IDS.includes(t.id)) : [];
  const adminIndex = list.findIndex(t => 
    t.id === 'teacher-yasin-1' || 
    normalizeStr(t.email).includes('yasinalacahan') || 
    normalizeStr(t.name).includes('admin')
  );

  if (adminIndex === -1) {
    list.unshift({ ...defaultTeachers[0], code: 'KOC-1001' });
  } else {
    list[adminIndex] = {
      ...defaultTeachers[0],
      ...list[adminIndex],
      name: 'ADMİN',
      email: 'yasinalacahan23@gmail.com',
      password: 'admin123',
      code: list[adminIndex].code || 'KOC-1001'
    };
  }

  return list.map((t, idx) => ({
    ...t,
    code: t.code || generateTeacherCode(t.id || `teacher-${idx + 1000}`)
  }));
}

function mergeTeachers(localTeachers: Teacher[], cloudTeachers: Teacher[]): Teacher[] {
  const map = new Map<string, Teacher>();
  defaultTeachers.forEach(t => map.set(t.id, t));
  
  if (Array.isArray(cloudTeachers) && cloudTeachers.length > 0) {
    cloudTeachers.forEach(t => {
      if (t && t.id && !LEGACY_TEST_IDS.includes(t.id)) map.set(t.id, t);
    });
  } else if (Array.isArray(localTeachers)) {
    localTeachers.forEach(t => {
      if (t && t.id && !LEGACY_TEST_IDS.includes(t.id)) map.set(t.id, t);
    });
  }
  
  const result = Array.from(map.values());
  return ensureAdminTeacher(result);
}

const DELETED_IDS_KEY = 'koc_deleted_ids_v1';
const deletedIds = new Set<string>((() => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
})());

export function markIdAsDeleted(id: string) {
  if (id) {
    deletedIds.add(id);
    try {
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(deletedIds)));
    } catch {}
  }
}



function sanitizeState(state: AppState): AppState {
  const cleanTeachers = ensureAdminTeacher(state.teachers || []);
  return {
    ...state,
    teachers: cleanTeachers,
    students: state.students || [],
    lessons: state.lessons || [],
    homeworks: state.homeworks || [],
    transactions: state.transactions || [],
    notifications: state.notifications || [],
    questions: state.questions || [],
    examResults: state.examResults || []
  };
}

let inMemoryState: AppState = (() => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.teachers)) {
        return sanitizeState({
          ...initialMockState,
          ...parsed,
          teachers: ensureAdminTeacher(parsed.teachers)
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse localStorage inMemoryState', e);
  }
  return sanitizeState(initialMockState);
})();

function getSyncApiEndpoint(): string {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '/api/sync';
  }
  return 'https://koc-one.vercel.app/api/sync';
}

let lastMutationTimestamp = 0;

function mergeArrayById<T extends { id: string }>(existingArr: T[] = [], newArr: T[] = []): T[] {
  const map = new Map<string, T>();
  
  if (Array.isArray(existingArr)) {
    existingArr.forEach(item => {
      if (item && item.id && !deletedIds.has(item.id)) {
        map.set(item.id, item);
      }
    });
  }
  
  if (Array.isArray(newArr)) {
    newArr.forEach(item => {
      if (item && item.id && !deletedIds.has(item.id)) {
        const prev = map.get(item.id);
        map.set(item.id, prev ? { ...prev, ...item } : item);
      }
    });
  }
  
  return Array.from(map.values());
}

export const storageService = {
  getState(): AppState {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.teachers)) {
          inMemoryState = sanitizeState({
            ...initialMockState,
            ...parsed,
            teachers: ensureAdminTeacher(parsed.teachers)
          });
          return inMemoryState;
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage getState', e);
    }
    return inMemoryState;
  },

  async saveState(state: AppState): Promise<boolean> {
    lastMutationTimestamp = Date.now();
    
    // Merge new state with inMemoryState so empty local state never wipes existing records
    const mergedState: AppState = {
      ...state,
      teachers: (state.teachers && state.teachers.length > 0) ? state.teachers : inMemoryState.teachers,
      students: mergeArrayById(inMemoryState.students || [], state.students || []),
      lessons: mergeArrayById(inMemoryState.lessons || [], state.lessons || []),
      homeworks: mergeArrayById(inMemoryState.homeworks || [], state.homeworks || []),
      transactions: mergeArrayById(inMemoryState.transactions || [], state.transactions || []),
      notifications: mergeArrayById(inMemoryState.notifications || [], state.notifications || []),
      questions: mergeArrayById(inMemoryState.questions || [], state.questions || []),
      examResults: mergeArrayById(inMemoryState.examResults || [], state.examResults || [])
    };

    inMemoryState = mergedState;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedState));
    } catch {}

    const sanitizedState = sanitizeState(mergedState);
    const payload = JSON.stringify({
      deletedIds: Array.from(deletedIds),
      teachers: sanitizedState.teachers,
      students: (sanitizedState.students || []).filter(s => s && s.id && !deletedIds.has(s.id)),
      lessons: (sanitizedState.lessons || []).filter(l => l && l.id && !deletedIds.has(l.id)),
      homeworks: (sanitizedState.homeworks || []).filter(h => h && h.id && !deletedIds.has(h.id)),
      transactions: (sanitizedState.transactions || []).filter(t => t && t.id && !deletedIds.has(t.id)),
      notifications: (sanitizedState.notifications || []).filter(n => n && n.id && !deletedIds.has(n.id)),
      questions: (sanitizedState.questions || []).filter(q => q && q.id && !deletedIds.has(q.id)),
      examResults: (sanitizedState.examResults || []).filter((e: any) => e && e.id && !deletedIds.has(e.id))
    });

    try {
      const vercelRes = await fetch(getSyncApiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      return vercelRes.ok;
    } catch (err) {
      console.warn('Vercel API sync error:', err);
      return false;
    }
  },

  async fetchCloudState(): Promise<AppState> {
    const fetchStartTime = Date.now();
    let cloudData: any = null;

    try {
      const vercelRes = await fetch(getSyncApiEndpoint(), {
        headers: { 'Accept': 'application/json' }
      });
      if (vercelRes.ok) {
        const data = await vercelRes.json();
        if (data && typeof data === 'object' && !data.error) {
          cloudData = data;
        }
      }
    } catch (err) {
      console.warn('Vercel API fetch error:', err);
    }

    if (!cloudData || typeof cloudData !== 'object') return inMemoryState;

    if (lastMutationTimestamp > fetchStartTime) {
      return inMemoryState;
    }

    const cloudTeachers = cloudData.teachers || [];
    const finalTeachers = mergeTeachers(inMemoryState.teachers || [], cloudTeachers);

    const validActiveTeacherId = (inMemoryState.activeTeacherId && finalTeachers.some(t => t.id === inMemoryState.activeTeacherId))
      ? inMemoryState.activeTeacherId
      : '';

    const updatedState: AppState = {
      teachers: finalTeachers,
      activeTeacherId: validActiveTeacherId,
      userRole: inMemoryState.userRole || 'teacher',
      activeStudentId: inMemoryState.activeStudentId || null,
      students: (cloudData.students || []).filter((s: any) => s && s.id && !deletedIds.has(s.id)),
      lessons: (cloudData.lessons || []).filter((l: any) => l && l.id && !deletedIds.has(l.id)),
      homeworks: (cloudData.homeworks || []).filter((h: any) => h && h.id && !deletedIds.has(h.id)),
      transactions: (cloudData.transactions || []).filter((t: any) => t && t.id && !deletedIds.has(t.id)),
      notifications: (cloudData.notifications || []).filter((n: any) => n && n.id && !deletedIds.has(n.id)),
      questions: pruneOldQuestions((cloudData.questions || []).filter((q: any) => q && q.id && !deletedIds.has(q.id))),
      examResults: (cloudData.examResults || []).filter((e: any) => e && e.id && !deletedIds.has(e.id))
    };

    inMemoryState = updatedState;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch {}

    return updatedState;
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

  // Financial Transactions CRUD
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
  },

  // Questions CRUD
  getQuestions(): StudentQuestion[] {
    return this.getState().questions || [];
  },

  saveQuestions(questions: StudentQuestion[]): void {
    const state = this.getState();
    state.questions = questions;
    this.saveState(state);
  }
};
