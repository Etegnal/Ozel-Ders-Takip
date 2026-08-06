import { AppState, Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification } from '../types';

const STORAGE_KEY = 'coach_app_state';
const CLOUD_OBJECT_URL = 'https://jsonblob.com/api/jsonBlob/019fd8d2-78a8-7163-8bad-2e10a963783c';

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

// Helper to merge items by id (preserves local & remote additions)
function mergeById<T extends { id: string }>(localArr: T[] = [], remoteArr: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of localArr) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of remoteArr) {
    if (item && item.id) map.set(item.id, item);
  }
  return Array.from(map.values());
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
    
    // Asynchronously push to central jsonblob.com cloud DB for multi-device sync
    fetch(CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        teachers: state.teachers,
        students: state.students,
        lessons: state.lessons,
        homeworks: state.homeworks,
        transactions: state.transactions,
        notifications: state.notifications
      })
    }).catch(() => {});
  },

  // Fetch and merge cloud state with local storage
  async fetchCloudState(): Promise<AppState | null> {
    try {
      const res = await fetch(CLOUD_OBJECT_URL, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return null;
      const cloudData = await res.json();
      if (!cloudData) return null;

      const currentState = this.getState();

      const mergedState: AppState = {
        teachers: mergeById(currentState.teachers, cloudData.teachers || []),
        activeTeacherId: currentState.activeTeacherId || cloudData.teachers?.[0]?.id || '',
        userRole: currentState.userRole || 'teacher',
        activeStudentId: currentState.activeStudentId,
        students: mergeById(currentState.students, cloudData.students || []),
        lessons: mergeById(currentState.lessons, cloudData.lessons || []),
        homeworks: mergeById(currentState.homeworks, cloudData.homeworks || []),
        transactions: mergeById(currentState.transactions, cloudData.transactions || []),
        notifications: mergeById(currentState.notifications, cloudData.notifications || [])
      };

      // Filter out deleted test users if any
      mergedState.teachers = mergedState.teachers.filter(
        (t: Teacher) => !t.name.toLowerCase().includes('rahmi koç') && !t.name.toLowerCase().includes('rahmi koc')
      );

      // Save merged result back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedState));

      // Push merged state back to cloud DB
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
      return null;
    }
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
