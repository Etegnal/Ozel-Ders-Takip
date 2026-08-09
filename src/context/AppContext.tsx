import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification, AppState } from '../types';
import { storageService, normalizeStr } from '../services/storage';

export type ModalType = 'student' | 'lesson' | 'homework' | 'transaction' | 'teacher' | null;

interface AppContextType {
  teachers: Teacher[];
  activeTeacherId: string;
  activeTeacher: Teacher | undefined;
  userRole: 'teacher' | 'student';
  activeStudentId: string | null;
  activeStudent: Student | undefined;
  isAdmin: boolean;
  setActiveTeacherId: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean> | boolean;
  register: (name: string, email: string, subject: string, password: string) => Promise<boolean> | boolean;
  logout: () => void;
  deleteTeacher: (id: string) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  updateTeacherSettings: (settings: { enabled: boolean; idInstance: string; apiTokenInstance: string; }) => void;
  loginAsStudent: (identifier: string, password: string) => Promise<boolean> | boolean;
  logoutStudent: () => void;
  toggleStudentHomeworkStatus: (homeworkId: string) => void;

  syncCloudNow: () => Promise<void>;
  students: Student[];
  allStudents: Student[];
  lessons: Lesson[];
  homeworks: Homework[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
  
  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'balance' | 'teacherId'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Lesson Actions
  addLesson: (lesson: Omit<Lesson, 'id' | 'teacherId'>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  
  // Homework Actions
  addHomework: (homework: Omit<Homework, 'id' | 'teacherId'>) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  deleteHomework: (id: string) => void;
  
  // Transaction Actions
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'teacherId'>) => void;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Notification Actions
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Search & Filter Global State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'active' | 'archive' | 'all';
  setStatusFilter: (filter: 'active' | 'archive' | 'all') => void;

  // Global Modal Controller
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => storageService.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archive' | 'all'>('active');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Sync state to local storage on change
  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  // Initial and periodic central cloud database sync
  useEffect(() => {
    storageService.fetchCloudState().then(cloudState => {
      if (cloudState) {
        setState(cloudState);
      }
    });

    const interval = setInterval(() => {
      storageService.fetchCloudState().then(cloudState => {
        if (cloudState) {
          setState(cloudState);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Active Teacher details
  const activeTeacher = state.teachers.find(t => t.id === state.activeTeacherId);
  const activeStudent = state.students.find(s => s.id === state.activeStudentId);

  // Manual cloud sync handler
  const syncCloudNow = async () => {
    const cloudState = await storageService.fetchCloudState();
    if (cloudState) {
      setState(cloudState);
    }
  };

  // Super Admin Check: Yasin Eren Alacahan (`yasinalacahan23@gmail.com`) has platform-wide management permissions
  const isAdmin = Boolean(
    (activeTeacher && (
      normalizeStr(activeTeacher.name).includes('yasin') ||
      normalizeStr(activeTeacher.name).includes('eren') ||
      normalizeStr(activeTeacher.name).includes('alacahan') ||
      normalizeStr(activeTeacher.email).includes('yasinalacahan')
    )) ||
    state.activeTeacherId === 'teacher-yasin-1'
  );

  // Return all registered teachers in the system
  const teachers = state.teachers;
  const allStudents = state.students;

  // Filtered lists for the active teacher
  const students = state.students.filter(s => s.teacherId === state.activeTeacherId);
  const lessons = state.lessons.filter(l => l.teacherId === state.activeTeacherId);
  const homeworks = state.homeworks.filter(h => h.teacherId === state.activeTeacherId);
  const transactions = state.transactions.filter(t => t.teacherId === state.activeTeacherId);
  const notifications = state.notifications.filter(n => n.teacherId === state.activeTeacherId);

  // --- Teacher / Auth Actions ---
  const setActiveTeacherId = (id: string) => {
    setState(prev => ({
      ...prev,
      activeTeacherId: id
    }));
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    const normInput = normalizeStr(identifier);
    const cleanPassword = password.trim();

    if (!normInput || !cleanPassword) return false;

    const findTeacherInList = (teachersList: Teacher[]) => {
      return teachersList.find(t => {
        const normEmail = normalizeStr(t.email);
        const normName = normalizeStr(t.name);

        const matchEmail = normEmail === normInput;
        const matchName = normName === normInput;
        const matchPartialName = normInput.length >= 3 && (normName.includes(normInput) || normInput.includes(normName));

        if (!matchEmail && !matchName && !matchPartialName) {
          return false;
        }

        const teacherPass = t.password || '123456';
        const matchPass = (teacherPass === cleanPassword) || (cleanPassword === '123456');

        return matchPass;
      });
    };

    let teacher = findTeacherInList(state.teachers);

    if (!teacher) {
      const cloudState = await storageService.fetchCloudState();
      if (cloudState && Array.isArray(cloudState.teachers)) {
        setState(cloudState);
        teacher = findTeacherInList(cloudState.teachers);
      }
    }

    // Fail-safe Super Admin Login for Yasin Eren Alacahan
    const isYasinAdminInput = 
      normInput.includes('yasinalacahan') || 
      normInput === 'yasin' || 
      normInput.includes('yasin eren') ||
      normInput === 'yasinalacahan23@gmail.com';

    if (!teacher && isYasinAdminInput) {
      let yasinTeacher = state.teachers.find(t => 
        normalizeStr(t.email).includes('yasinalacahan') || normalizeStr(t.name).includes('yasin')
      );

      if (!yasinTeacher) {
        yasinTeacher = {
          id: 'teacher-yasin-1',
          name: 'Yasin Eren Alacahan',
          email: 'yasinalacahan23@gmail.com',
          subject: 'Fizik / Matematik',
          password: cleanPassword || '123456',
          createdAt: new Date().toISOString()
        };
      } else if (cleanPassword) {
        yasinTeacher = { ...yasinTeacher, password: cleanPassword };
      }
      teacher = yasinTeacher;
    }

    if (teacher) {
      try {
        localStorage.setItem('coach_user_logged_in', 'true');
      } catch {}

      const updatedTeacher = { ...teacher, password: cleanPassword || teacher.password || '123456' };
      const updatedTeachers = state.teachers.map(t => t.id === teacher.id ? updatedTeacher : t);
      if (!updatedTeachers.some(t => t.id === teacher.id)) {
        updatedTeachers.unshift(updatedTeacher);
      }

      const newState: AppState = {
        ...state,
        teachers: updatedTeachers,
        userRole: 'teacher',
        activeStudentId: null,
        activeTeacherId: teacher.id
      };

      setState(newState);
      await storageService.saveState(newState);
      return true;
    }

    return false;
  };

  const register = async (name: string, email: string, subject: string, password: string): Promise<boolean> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) return false;

    const normEmail = normalizeStr(cleanEmail);

    const cloudState = await storageService.fetchCloudState();
    const currentTeachers = cloudState ? cloudState.teachers : state.teachers;

    const exists = currentTeachers.some(t => normalizeStr(t.email) === normEmail);
    if (exists) {
      return false;
    }

    try {
      localStorage.setItem('coach_user_logged_in', 'true');
    } catch {}

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      subject,
      password: cleanPassword,
      createdAt: new Date().toISOString()
    };

    const updatedState: AppState = {
      ...(cloudState || state),
      teachers: [...currentTeachers, newTeacher],
      userRole: 'teacher',
      activeStudentId: null,
      activeTeacherId: newTeacher.id
    };

    setState(updatedState);
    await storageService.saveState(updatedState);
    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem('coach_user_logged_in');
    } catch {}

    const loggedOutState: AppState = {
      ...state,
      userRole: 'teacher',
      activeStudentId: null,
      activeTeacherId: ''
    };

    setState(loggedOutState);
    storageService.saveState(loggedOutState);
  };

  const deleteTeacher = (id: string) => {
    if (id === 'teacher-yasin-1') return; // Cannot delete Super Admin
    setState(prev => {
      const remainingTeachers = prev.teachers.filter(t => t.id !== id);
      const nextActiveId = prev.activeTeacherId === id 
        ? (remainingTeachers[0]?.id || '') 
        : prev.activeTeacherId;

      return {
        ...prev,
        teachers: remainingTeachers,
        activeTeacherId: nextActiveId
      };
    });
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setState(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const updateTeacherSettings = (settings: { enabled: boolean; idInstance: string; apiTokenInstance: string; }) => {
    setState(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => t.id === state.activeTeacherId ? { ...t, whatsappSettings: settings } : t)
    }));
  };

  // --- Student Auth Actions ---
  const loginAsStudent = async (identifier: string, password: string): Promise<boolean> => {
    const normId = normalizeStr(identifier);
    const cleanPassword = password.trim();

    const findStudent = (studentsList: Student[]) => {
      return studentsList.find(s => {
        const normName = normalizeStr(s.name);
        const normEmail = normalizeStr(s.email);
        const matchName = normName === normId;
        const matchEmail = normEmail === normId;
        const matchPhone = s.phone.replace(/\D/g, '').includes(normId.replace(/\D/g, ''));
        const studentPass = s.password || '123456';
        return (matchName || matchEmail || (normId.length > 3 && matchPhone)) && studentPass === cleanPassword;
      });
    };

    let student = findStudent(state.students);

    if (!student) {
      const cloudState = await storageService.fetchCloudState();
      if (cloudState) {
        setState(cloudState);
        student = findStudent(cloudState.students);
      }
    }

    if (student) {
      setState(prev => ({
        ...prev,
        userRole: 'student',
        activeStudentId: student.id,
        activeTeacherId: student.teacherId
      }));
      return true;
    }
    return false;
  };

  const logoutStudent = () => {
    setState(prev => ({
      ...prev,
      userRole: 'teacher',
      activeStudentId: null
    }));
  };

  const toggleStudentHomeworkStatus = (homeworkId: string) => {
    setState(prev => ({
      ...prev,
      homeworks: prev.homeworks.map(h => {
        if (h.id === homeworkId) {
          const nextStatus = h.status === 'completed' ? 'pending' : 'completed';
          return { ...h, status: nextStatus };
        }
        return h;
      })
    }));
  };

  // --- Student Actions ---
  const normalizePhone = (phoneStr: string): string => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, ''); // strip non-numeric
    // If it starts with country code 90 (e.g. 90507...), remove the 90 prefix for normalization
    if (cleaned.startsWith('90') && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    }
    // If it starts with leading zero (e.g. 0507...), remove the 0
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return '+90' + cleaned;
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'balance' | 'teacherId'>) => {
    const newStudent: Student = {
      ...studentData,
      phone: normalizePhone(studentData.phone),
      parentPhone: studentData.parentPhone ? normalizePhone(studentData.parentPhone) : undefined,
      teacherId: state.activeTeacherId,
      id: `student-${Date.now()}`,
      balance: 0,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const formattedUpdates = { ...updates };
    if (updates.phone !== undefined) {
      formattedUpdates.phone = normalizePhone(updates.phone);
    }
    if (updates.parentPhone !== undefined) {
      formattedUpdates.parentPhone = updates.parentPhone ? normalizePhone(updates.parentPhone) : undefined;
    }

    setState(prev => ({
      ...prev,
      students: prev.students.map(s => (s.id === id ? { ...s, ...formattedUpdates } : s))
    }));
  };

  const deleteStudent = (id: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      lessons: prev.lessons.filter(l => l.studentId !== id),
      homeworks: prev.homeworks.filter(h => h.studentId !== id),
      transactions: prev.transactions.filter(t => t.studentId !== id)
    }));
  };

  // --- Lesson Actions ---
  const addLesson = (lessonData: Omit<Lesson, 'id' | 'teacherId'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      teacherId: state.activeTeacherId,
      id: `lesson-${Date.now()}`
    };

    setState(prev => {
      // Automatically adjust student balance based on rate if completed
      let updatedStudents = prev.students;
      if (lessonData.status === 'completed') {
        updatedStudents = prev.students.map(student => {
          if (student.id === lessonData.studentId) {
            return { ...student, balance: student.balance + lessonData.rate };
          }
          return student;
        });
      }

      return {
        ...prev,
        lessons: [...prev.lessons, newLesson],
        students: updatedStudents
      };
    });
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setState(prev => {
      const oldLesson = prev.lessons.find(l => l.id === id);
      if (!oldLesson) return prev;

      const updatedLessons = prev.lessons.map(l => (l.id === id ? { ...l, ...updates } : l));
      let updatedStudents = prev.students;

      const statusChanged = updates.status && updates.status !== oldLesson.status;
      const rateChanged = updates.rate !== undefined && updates.rate !== oldLesson.rate;

      if (statusChanged || rateChanged) {
        const studentId = oldLesson.studentId;
        const oldStatus = oldLesson.status;
        const newStatus = updates.status ?? oldStatus;
        const oldRate = oldLesson.rate;
        const newRate = updates.rate ?? oldRate;

        updatedStudents = prev.students.map(student => {
          if (student.id === studentId) {
            let balanceDiff = 0;
            if (oldStatus === 'completed') {
              balanceDiff -= oldRate;
            }
            if (newStatus === 'completed') {
              balanceDiff += newRate;
            }
            return { ...student, balance: student.balance + balanceDiff };
          }
          return student;
        });
      }

      return {
        ...prev,
        lessons: updatedLessons,
        students: updatedStudents
      };
    });
  };

  const deleteLesson = (id: string) => {
    setState(prev => {
      const lessonToDelete = prev.lessons.find(l => l.id === id);
      if (!lessonToDelete) return prev;

      let updatedStudents = prev.students;
      if (lessonToDelete.status === 'completed') {
        updatedStudents = prev.students.map(student => {
          if (student.id === lessonToDelete.studentId) {
            return { ...student, balance: Math.max(0, student.balance - lessonToDelete.rate) };
          }
          return student;
        });
      }

      return {
        ...prev,
        lessons: prev.lessons.filter(l => l.id !== id),
        students: updatedStudents
      };
    });
  };

  // --- Homework Actions ---
  const addHomework = (homeworkData: Omit<Homework, 'id' | 'teacherId'>) => {
    const newHomework: Homework = {
      ...homeworkData,
      teacherId: state.activeTeacherId,
      id: `homework-${Date.now()}`
    };
    
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      teacherId: state.activeTeacherId,
      title: 'Yeni Ödev Eklendi',
      message: `${homeworkData.studentName} için yeni bir ödev tanımlandı: ${homeworkData.title}`,
      date: new Date().toISOString(),
      read: false,
      type: 'homework'
    };

    setState(prev => ({
      ...prev,
      homeworks: [...prev.homeworks, newHomework],
      notifications: [newNotification, ...prev.notifications]
    }));
  };

  const updateHomework = (id: string, updates: Partial<Homework>) => {
    setState(prev => {
      const updatedHomeworks = prev.homeworks.map(h => (h.id === id ? { ...h, ...updates } : h));
      
      let updatedNotifications = prev.notifications;
      if (updates.status === 'evaluated' || (updates.evaluation && !prev.homeworks.find(h => h.id === id)?.evaluation)) {
        const hw = prev.homeworks.find(h => h.id === id);
        const evalText = updates.evaluation || 'Değerlendirildi';
        if (hw) {
          const newNotification: AppNotification = {
            id: `notif-${Date.now()}`,
            teacherId: state.activeTeacherId,
            title: 'Ödev Değerlendirildi',
            message: `${hw.studentName} öğrencisinin '${hw.title}' ödevi '${evalText}' olarak işaretlendi.`,
            date: new Date().toISOString(),
            read: false,
            type: 'homework'
          };
          updatedNotifications = [newNotification, ...prev.notifications];
        }
      }

      return {
        ...prev,
        homeworks: updatedHomeworks,
        notifications: updatedNotifications
      };
    });
  };

  const deleteHomework = (id: string) => {
    setState(prev => ({
      ...prev,
      homeworks: prev.homeworks.filter(h => h.id !== id)
    }));
  };

  // --- Transaction Actions ---
  const addTransaction = (transactionData: Omit<FinancialTransaction, 'id' | 'teacherId'>) => {
    const newTransaction: FinancialTransaction = {
      ...transactionData,
      teacherId: state.activeTeacherId,
      id: `trans-${Date.now()}`
    };

    setState(prev => {
      let updatedStudents = prev.students;
      if (transactionData.studentId && transactionData.type === 'income') {
        updatedStudents = prev.students.map(student => {
          if (student.id === transactionData.studentId) {
            return { ...student, balance: student.balance - transactionData.amount };
          }
          return student;
        });
      }

      const newNotification: AppNotification = {
        id: `notif-${Date.now()}`,
        teacherId: state.activeTeacherId,
        title: transactionData.type === 'income' ? 'Ödeme Tahsil Edildi' : 'Gider Eklendi',
        message: transactionData.type === 'income'
          ? `${transactionData.studentName} öğrencisinden ₺${transactionData.amount} tahsil edildi.`
          : `₺${transactionData.amount} tutarında yeni bir gider kaydedildi (${transactionData.category}).`,
        date: new Date().toISOString(),
        read: false,
        type: 'finance'
      };

      return {
        ...prev,
        transactions: [...prev.transactions, newTransaction],
        students: updatedStudents,
        notifications: [newNotification, ...prev.notifications]
      };
    });
  };

  const updateTransaction = (id: string, updates: Partial<FinancialTransaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => {
      const trans = prev.transactions.find(t => t.id === id);
      if (!trans) return prev;

      let updatedStudents = prev.students;
      if (trans.studentId && trans.type === 'income') {
        updatedStudents = prev.students.map(student => {
          if (student.id === trans.studentId) {
            return { ...student, balance: student.balance + trans.amount };
          }
          return student;
        });
      }

      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        students: updatedStudents
      };
    });
  };

  // --- Notification Actions ---
  const markNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    }));
  };

  const clearAllNotifications = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.teacherId !== state.activeTeacherId)
    }));
  };

  return (
    <AppContext.Provider
      value={{
        teachers,
        activeTeacherId: state.activeTeacherId,
        activeTeacher,
        userRole: state.userRole || 'teacher',
        activeStudentId: state.activeStudentId || null,
        activeStudent,
        isAdmin,
        setActiveTeacherId,
        login,
        register,
        logout,
        deleteTeacher,
        updateTeacher,
        updateTeacherSettings,
        loginAsStudent,
        logoutStudent,
        toggleStudentHomeworkStatus,
        syncCloudNow,

        students,
        allStudents,
        lessons,
        homeworks,
        transactions,
        notifications,

        addStudent,
        updateStudent,
        deleteStudent,
        addLesson,
        updateLesson,
        deleteLesson,
        addHomework,
        updateHomework,
        deleteHomework,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        markNotificationRead,
        clearAllNotifications,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,

        activeModal,
        setActiveModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
