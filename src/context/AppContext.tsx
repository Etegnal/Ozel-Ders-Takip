import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification, AppState, StudentQuestion } from '../types';
import { storageService, normalizeStr, ensureAdminTeacher, markIdAsDeleted } from '../services/storage';

export type ModalType = 'student' | 'lesson' | 'homework' | 'transaction' | 'teacher' | 'weekly-schedule' | null;

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
  registerStudent: (name: string, email: string, phone: string, grade: string, password: string, teacherId: string) => Promise<boolean>;
  logoutStudent: () => void;
  linkStudentToTeacherByCode: (teacherCodeInput: string) => Promise<{ success: boolean; teacherName?: string; message?: string }>;
  toggleStudentHomeworkStatus: (homeworkId: string) => void;
  syncCloudNow: () => Promise<void>;
  syncCode: string;
  updateSyncCode: (code: string) => Promise<void>;
  students: Student[];
  allStudents: Student[];
  lessons: Lesson[];
  homeworks: Homework[];
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
  questions: StudentQuestion[];
  
  // Question Actions
  addQuestion: (lessonName: string, topicName: string, questionImage: string, questionText?: string) => void;
  addSolution: (questionId: string, solutionImage?: string, solutionText?: string) => void;
  giveQuestionFeedback: (questionId: string, feedback: 'understood' | 'not_understood') => void;
  deleteQuestion: (id: string) => void;
  
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
  clearTransactions: () => void;
  
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

  const [isCloudLoaded, setIsCloudLoaded] = useState(false);

  // Sync state to local storage on change, BUT ONLY AFTER INITIAL CLOUD FETCH HAS LOADED!
  useEffect(() => {
    if (!isCloudLoaded) return;
    storageService.saveState(state);
  }, [state, isCloudLoaded]);

  // Initial and periodic central cloud database sync (polling every 3s + on window focus)
  useEffect(() => {
    const handleCloudSync = async () => {
      const cloudState = await storageService.fetchCloudState();
      if (cloudState) {
        setState(prev => ({
          ...cloudState,
          activeTeacherId: prev.activeTeacherId || '',
          userRole: prev.userRole || 'teacher',
          activeStudentId: prev.activeStudentId || null
        }));
        setIsCloudLoaded(true);
      }
    };

    handleCloudSync();
    const interval = setInterval(handleCloudSync, 3000);

    const onFocus = () => {
      handleCloudSync();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Active Teacher details
  const teachers = state.teachers;
  const allStudents = state.students;

  const effectiveTeacherId = state.activeTeacherId;
  const activeTeacher = state.teachers.find(t => t.id === effectiveTeacherId);
  const activeStudent = state.students.find(s => s.id === state.activeStudentId);

  // Automatically fetch cloud state on mount
  useEffect(() => {
    try {
      syncCloudNow();
    } catch (e) {
      console.warn('Initial cloud sync failed:', e);
    }
  }, []);

  // Manual cloud sync handler
  const syncCloudNow = async () => {
    const cloudState = await storageService.fetchCloudState();
    if (cloudState) {
      setState(prev => ({
        ...cloudState,
        activeTeacherId: prev.activeTeacherId,
        activeStudentId: prev.activeStudentId,
        userRole: prev.userRole
      }));
    }
  };

  const updateSyncCode = async () => {
    const cloudState = await storageService.fetchCloudState();
    if (cloudState) {
      setState(cloudState);
    }
  };

  // Super Admin Check: Yasin Eren Alacahan (`yasinalacahan23@gmail.com`) has platform-wide management permissions
  const isAdmin = Boolean(
    state.activeTeacherId === 'teacher-yasin-1' ||
    (activeTeacher && (
      normalizeStr(activeTeacher.name).includes('admin') ||
      normalizeStr(activeTeacher.email).includes('yasinalacahan')
    ))
  );

  // Filtered lists for the active teacher (Fail-safe: Admin or matching teacherId sees all relevant records)
  const students = state.students.filter(s => 
    s.teacherId === effectiveTeacherId || 
    (isAdmin && (s.teacherId === 'teacher-yasin-1' || !s.teacherId))
  );
  const lessons = state.lessons.filter(l => 
    l.teacherId === effectiveTeacherId || (isAdmin && (l.teacherId === 'teacher-yasin-1' || !l.teacherId))
  );
  const homeworks = state.homeworks.filter(h => 
    h.teacherId === effectiveTeacherId || (isAdmin && (h.teacherId === 'teacher-yasin-1' || !h.teacherId))
  );
  const transactions = state.transactions.filter(t => 
    t.teacherId === effectiveTeacherId || (isAdmin && (t.teacherId === 'teacher-yasin-1' || !t.teacherId))
  );
  const notifications = state.notifications.filter(n => 
    n.teacherId === effectiveTeacherId || (isAdmin && (n.teacherId === 'teacher-yasin-1' || !n.teacherId))
  );
  const questions = (state.questions || []).filter(q => 
    q.teacherId === effectiveTeacherId || (isAdmin && (q.teacherId === 'teacher-yasin-1' || !q.teacherId))
  );

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

    const cloudState = await storageService.fetchCloudState();
    const currentTeachers = cloudState && Array.isArray(cloudState.teachers) ? cloudState.teachers : state.teachers;

    const teacher = currentTeachers.find(t => {
      const normEmail = normalizeStr(t.email);
      const normName = normalizeStr(t.name);

      const matchEmail = normEmail === normInput;
      const matchName = normName === normInput;

      if (!matchEmail && !matchName) {
        return false;
      }

      const teacherPass = (t.password || 'admin123').trim();
      return teacherPass === cleanPassword;
    });

    if (teacher) {
      try {
        localStorage.setItem('coach_user_logged_in', 'true');
      } catch {}

      const newState: AppState = {
        ...(cloudState || state),
        teachers: currentTeachers,
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
      localStorage.setItem('coach_user_logged_in', 'false');
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

  const updateAndPersistState = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const newState = updater(prev);
      storageService.saveState(newState);
      return newState;
    });
  };

  const deleteTeacher = (id: string) => {
    if (id === 'teacher-yasin-1') return; // Cannot delete Super Admin
    updateAndPersistState(prev => {
      const remainingTeachers = prev.teachers.filter(t => t.id !== id);
      const nextActiveId = prev.activeTeacherId === id 
        ? (remainingTeachers[0]?.id || '') 
        : prev.activeTeacherId;

      return {
        ...prev,
        teachers: ensureAdminTeacher(remainingTeachers),
        activeTeacherId: nextActiveId
      };
    });
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    updateAndPersistState(prev => ({
      ...prev,
      teachers: ensureAdminTeacher(prev.teachers.map(t => (t.id === id ? { ...t, ...updates } : t)))
    }));
  };

  const updateTeacherSettings = (settings: { enabled: boolean; idInstance: string; apiTokenInstance: string; }) => {
    if (!state.activeTeacherId) return;
    updateTeacher(state.activeTeacherId, { whatsappSettings: settings });
  };

  // --- Student Auth Actions ---
  const loginAsStudent = async (identifier: string, password: string): Promise<boolean> => {
    const normId = normalizeStr(identifier);
    const normPhoneId = normalizePhone(identifier);
    const cleanPassword = password.trim();

    const findStudent = (studentsList: Student[]) => {
      return studentsList.find(s => {
        const normName = normalizeStr(s.name);
        const normEmail = normalizeStr(s.email);
        const normStudentPhone = normalizePhone(s.phone);
        const normParentPhone = normalizePhone(s.parentPhone);

        const matchName = normName === normId;
        const matchEmail = normEmail === normId;
        const matchPhone = (normPhoneId.length >= 7) && (normStudentPhone === normPhoneId || normParentPhone === normPhoneId);

        const studentPass = (s.password || '').trim();
        return (matchName || matchEmail || matchPhone) && studentPass.length > 0 && studentPass === cleanPassword;
      });
    };

    let student = findStudent(state.students);

    if (!student) {
      const cloudState = await storageService.fetchCloudState();
      if (cloudState && Array.isArray(cloudState.students)) {
        setState(cloudState);
        student = findStudent(cloudState.students);
      }
    }

    if (student) {
      try {
        localStorage.setItem('coach_user_logged_in', 'true');
      } catch {}

      const newState: AppState = {
        ...state,
        userRole: 'student',
        activeStudentId: student.id,
        activeTeacherId: student.teacherId || ''
      };

      setState(newState);
      await storageService.saveState(newState);
      return true;
    }
    return false;
  };

  const registerStudent = async (
    name: string,
    email: string,
    phone: string,
    grade: string,
    password: string,
    teacherId?: string
  ): Promise<boolean> => {
    const cleanPhone = phone.trim();
    const normInputPhone = normalizePhone(cleanPhone);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !normInputPhone || !password.trim()) {
      return false;
    }

    const cloudState = await storageService.fetchCloudState();
    const currentStudents = cloudState && Array.isArray(cloudState.students) ? cloudState.students : state.students;

    // Check if student with matching phone number already exists
    const existingIndex = currentStudents.findIndex(s => {
      const p1 = normalizePhone(s.phone);
      const p2 = normalizePhone(s.parentPhone);
      return normInputPhone && (p1 === normInputPhone || p2 === normInputPhone);
    });

    let updatedStudents = [...currentStudents];
    let createdStudent: Student;

    if (existingIndex !== -1) {
      createdStudent = {
        ...updatedStudents[existingIndex],
        name: cleanName || updatedStudents[existingIndex].name,
        phone: cleanPhone || updatedStudents[existingIndex].phone,
        password: password.trim(),
        teacherId: teacherId || updatedStudents[existingIndex].teacherId || ''
      };
      updatedStudents[existingIndex] = createdStudent;
    } else {
      createdStudent = {
        id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        teacherId: teacherId || '',
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        grade: grade || '12. Sınıf (YKS)',
        password: password.trim(),
        hourlyRate: 1000,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      updatedStudents.push(createdStudent);
    }

    const newNotification: AppNotification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      teacherId: createdStudent.teacherId || 'teacher-yasin-1',
      title: 'Yeni Öğrenci Kaydı',
      message: `${createdStudent.name} (${cleanPhone}) sisteme öğrenci kaydı oluşturdu.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };

    const updatedNotifications = [newNotification, ...((cloudState || state).notifications || [])];

    const updatedState: AppState = {
      ...(cloudState || state),
      students: updatedStudents,
      notifications: updatedNotifications,
      userRole: 'student',
      activeStudentId: createdStudent.id,
      activeTeacherId: createdStudent.teacherId || ''
    };

    setState(updatedState);
    await storageService.saveState(updatedState);
    return true;
  };

  const logoutStudent = () => {
    try {
      localStorage.setItem('coach_user_logged_in', 'false');
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

  const linkStudentToTeacherByCode = async (teacherCodeInput: string): Promise<{ success: boolean; teacherName?: string; message?: string }> => {
    const cleanCode = teacherCodeInput.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Lütfen bir öğretmen eşleşme kodu girin.' };

    const cloudState = await storageService.fetchCloudState();
    const currentTeachers = cloudState && Array.isArray(cloudState.teachers) ? cloudState.teachers : state.teachers;

    const matchedTeacher = currentTeachers.find(t => {
      const code = (t.code || '').trim().toUpperCase();
      const idCode = t.id.trim().toUpperCase();
      return code === cleanCode || idCode === cleanCode || ('KOC-' + code) === cleanCode;
    });

    if (!matchedTeacher) {
      return { success: false, message: 'Bu koda sahip bir öğretmen bulunamadı. Lütfen kodu kontrol edin.' };
    }

    if (!state.activeStudentId) {
      return { success: false, message: 'Öğrenci oturumu aktif değil.' };
    }

    let updatedStudents = [...(cloudState?.students || state.students)];
    const studentIdx = updatedStudents.findIndex(s => s.id === state.activeStudentId);

    if (studentIdx !== -1) {
      updatedStudents[studentIdx] = {
        ...updatedStudents[studentIdx],
        teacherId: matchedTeacher.id
      };
    }

    const updatedState: AppState = {
      ...(cloudState || state),
      students: updatedStudents,
      activeTeacherId: matchedTeacher.id
    };

    setState(updatedState);
    await storageService.saveState(updatedState);
    return { success: true, teacherName: matchedTeacher.name };
  };

  const toggleStudentHomeworkStatus = (homeworkId: string) => {
    updateAndPersistState(prev => ({
      ...prev,
      homeworks: prev.homeworks.map(h => {
        if (h.id === homeworkId) {
          if (h.status === 'completed' || h.status === 'evaluated') {
            return h; // One-way guard: cannot revert back to pending
          }
          return { ...h, status: 'completed' };
        }
        return h;
      })
    }));
  };

  // --- Student Actions ---
  const normalizePhone = (phoneStr?: string | null): string => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, ''); // strip non-numeric
    if (cleaned.startsWith('90') && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'balance' | 'teacherId'>) => {
    const inputPhone = normalizePhone(studentData.phone);
    const inputName = normalizeStr(studentData.name);

    updateAndPersistState(prev => {
      // Find matching student by phone number or name
      const existingIndex = prev.students.findIndex(s => {
        const p = normalizePhone(s.phone);
        const pParent = normalizePhone(s.parentPhone);
        const n = normalizeStr(s.name);
        return (inputPhone && (p === inputPhone || pParent === inputPhone)) ||
               (inputName && n === inputName);
      });

      let updatedStudents = [...prev.students];
      if (existingIndex !== -1) {
        // MATCH FOUND! Link student to current active teacher!
        const target = updatedStudents[existingIndex];
        updatedStudents[existingIndex] = {
          ...target,
          teacherId: prev.activeTeacherId || target.teacherId,
          name: studentData.name.trim() || target.name,
          phone: inputPhone || target.phone,
          grade: studentData.grade || target.grade,
          hourlyRate: studentData.hourlyRate || target.hourlyRate,
          monthlyHours: studentData.monthlyHours || target.monthlyHours,
          parentName: studentData.parentName || target.parentName,
          parentPhone: studentData.parentPhone ? normalizePhone(studentData.parentPhone) : target.parentPhone,
          notes: studentData.notes || target.notes
        };
      } else {
        // Create new student assigned to active teacher
        const newStudent: Student = {
          ...studentData,
          phone: inputPhone,
          parentPhone: studentData.parentPhone ? normalizePhone(studentData.parentPhone) : undefined,
          teacherId: prev.activeTeacherId,
          id: `student-${Date.now()}`,
          balance: 0,
          createdAt: new Date().toISOString()
        };
        updatedStudents.push(newStudent);
      }

      return { ...prev, students: updatedStudents };
    });
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const formattedUpdates = { ...updates };
    if (updates.phone !== undefined) {
      formattedUpdates.phone = normalizePhone(updates.phone);
    }
    if (updates.parentPhone !== undefined) {
      formattedUpdates.parentPhone = updates.parentPhone ? normalizePhone(updates.parentPhone) : undefined;
    }

    updateAndPersistState(prev => {
      const targetStudent = prev.students.find(s => s.id === id);
      const targetPhoneNorm = targetStudent ? normalizePhone(targetStudent.phone || targetStudent.parentPhone) : '';

      const updatedStudents = prev.students.map(s => {
        const sPhoneNorm = normalizePhone(s.phone || s.parentPhone);
        const isMatch = s.id === id || (targetPhoneNorm && sPhoneNorm && sPhoneNorm === targetPhoneNorm);
        if (isMatch) {
          return { ...s, ...formattedUpdates };
        }
        return s;
      });

      return { ...prev, students: updatedStudents };
    });
  };

  const deleteStudent = (id: string) => {
    markIdAsDeleted(id);
    updateAndPersistState(prev => ({
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

    updateAndPersistState(prev => {
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
    updateAndPersistState(prev => {
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
    markIdAsDeleted(id);
    updateAndPersistState(prev => {
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
    const targetStudent = state.students.find(s => s.id === homeworkData.studentId);
    const assignedTeacherId = targetStudent?.teacherId || state.activeTeacherId;

    const newHomework: Homework = {
      ...homeworkData,
      teacherId: assignedTeacherId,
      id: `homework-${Date.now()}`
    };
    
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      teacherId: assignedTeacherId,
      title: 'Yeni Ödev Eklendi',
      message: `${homeworkData.studentName} için yeni bir ödev tanımlandı: ${homeworkData.title}`,
      date: new Date().toISOString(),
      read: false,
      type: 'homework'
    };

    updateAndPersistState(prev => ({
      ...prev,
      homeworks: [...prev.homeworks, newHomework],
      notifications: [newNotification, ...prev.notifications]
    }));
  };

  const updateHomework = (id: string, updates: Partial<Homework>) => {
    updateAndPersistState(prev => {
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
    markIdAsDeleted(id);
    updateAndPersistState(prev => ({
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

    updateAndPersistState(prev => {
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
    updateAndPersistState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const deleteTransaction = (id: string) => {
    markIdAsDeleted(id);
    updateAndPersistState(prev => {
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

  const clearTransactions = () => {
    updateAndPersistState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.teacherId !== state.activeTeacherId)
    }));
  };

  // --- Notification Actions ---
  const markNotificationRead = (id: string) => {
    updateAndPersistState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    }));
  };

  const clearAllNotifications = () => {
    updateAndPersistState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.teacherId !== state.activeTeacherId)
    }));
  };

  // --- Question Actions ---
  const addQuestion = (lessonName: string, topicName: string, questionImage: string, questionText?: string) => {
    if (!state.activeStudentId || !state.activeTeacherId) return;

    const newQuestion: StudentQuestion = {
      id: 'question-' + Math.random().toString(36).substr(2, 9),
      studentId: state.activeStudentId,
      studentName: activeStudent ? activeStudent.name : 'Öğrenci',
      teacherId: state.activeTeacherId,
      lessonName: lessonName.trim(),
      topicName: topicName.trim(),
      questionImage,
      questionText: questionText?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const newNotification: AppNotification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      teacherId: state.activeTeacherId,
      title: 'Yeni Soru Soruldu',
      message: `${activeStudent ? activeStudent.name : 'Öğrenci'} yeni bir soru yükledi. Konu: ${topicName}`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };

    updateAndPersistState(prev => ({
      ...prev,
      questions: [newQuestion, ...(prev.questions || [])],
      notifications: [newNotification, ...(prev.notifications || [])]
    }));
  };

  const addSolution = (questionId: string, solutionImage?: string, solutionText?: string) => {
    updateAndPersistState(prev => {
      const q = (prev.questions || []).find(x => x.id === questionId);
      if (!q) return prev;

      const updatedQuestions = (prev.questions || []).map(x => {
        if (x.id === questionId) {
          return {
            ...x,
            solutionImage,
            solutionText: solutionText?.trim(),
            status: 'solved' as const,
            solvedAt: new Date().toISOString(),
            feedback: undefined,
            feedbackAt: undefined
          };
        }
        return x;
      });

      const newNotification: AppNotification = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        teacherId: q.teacherId,
        title: 'Soru Çözüldü',
        message: `${q.studentName} isimli öğrencinin sorduğu soru çözüldü.`,
        date: new Date().toISOString(),
        read: false,
        type: 'system'
      };

      return {
        ...prev,
        questions: updatedQuestions,
        notifications: [newNotification, ...(prev.notifications || [])]
      };
    });
  };

  const giveQuestionFeedback = (questionId: string, feedback: 'understood' | 'not_understood') => {
    updateAndPersistState(prev => {
      const q = (prev.questions || []).find(x => x.id === questionId);
      if (!q) return prev;

      const updatedQuestions = (prev.questions || []).map(x => {
        if (x.id === questionId) {
          return {
            ...x,
            feedback,
            feedbackAt: new Date().toISOString()
          };
        }
        return x;
      });

      const feedbackText = feedback === 'understood' ? 'Çözümü Anladım ✅' : 'Çözümü Anlamadım ❌';
      const newNotification: AppNotification = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        teacherId: q.teacherId,
        title: 'Soru Geri Bildirimi',
        message: `${q.studentName}, "${q.topicName}" konusundaki çözüme şu geri bildirimi yaptı: ${feedbackText}`,
        date: new Date().toISOString(),
        read: false,
        type: 'system'
      };

      return {
        ...prev,
        questions: updatedQuestions,
        notifications: [newNotification, ...(prev.notifications || [])]
      };
    });
  };

  const deleteQuestion = (id: string) => {
    markIdAsDeleted(id);
    updateAndPersistState(prev => ({
      ...prev,
      questions: (prev.questions || []).filter(q => q.id !== id)
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
        registerStudent,
        logoutStudent,
        linkStudentToTeacherByCode,
        toggleStudentHomeworkStatus,
        syncCloudNow,
        syncCode: '',
        updateSyncCode,

        students,
        allStudents,
        lessons,
        homeworks,
        transactions,
        notifications,
        questions,

        addQuestion,
        addSolution,
        giveQuestionFeedback,
        deleteQuestion,

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
        clearTransactions,
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
