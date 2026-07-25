import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, Lesson, Homework, FinancialTransaction, AppNotification, AppState } from '../types';
import { storageService } from '../services/storage';

export type ModalType = 'student' | 'lesson' | 'homework' | 'transaction' | 'teacher' | null;

interface AppContextType {
  teachers: Teacher[];
  activeTeacherId: string;
  activeTeacher: Teacher | undefined;
  setActiveTeacherId: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>) => void;

  students: Student[];
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

  // Active Teacher details
  const activeTeacher = state.teachers.find(t => t.id === state.activeTeacherId);

  // Filtered lists for the active teacher
  const students = state.students.filter(s => s.teacherId === state.activeTeacherId);
  const lessons = state.lessons.filter(l => l.teacherId === state.activeTeacherId);
  const homeworks = state.homeworks.filter(h => h.teacherId === state.activeTeacherId);
  const transactions = state.transactions.filter(t => t.teacherId === state.activeTeacherId);
  const notifications = state.notifications.filter(n => n.teacherId === state.activeTeacherId);

  // --- Teacher Actions ---
  const setActiveTeacherId = (id: string) => {
    setState(prev => ({
      ...prev,
      activeTeacherId: id
    }));
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'createdAt'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teacher-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher],
      activeTeacherId: newTeacher.id // Automatically switch to the newly created teacher
    }));
  };

  // --- Student Actions ---
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'balance' | 'teacherId'>) => {
    const newStudent: Student = {
      ...studentData,
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
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => (s.id === id ? { ...s, ...updates } : s))
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
        teachers: state.teachers,
        activeTeacherId: state.activeTeacherId,
        activeTeacher,
        setActiveTeacherId,
        addTeacher,

        students,
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
