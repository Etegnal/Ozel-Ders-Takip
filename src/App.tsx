import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout } from './components/Layout/MainLayout';
import { CalendarPage } from './pages/CalendarPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentsPage } from './pages/StudentsPage';
import { HomeworksPage } from './pages/HomeworksPage';
import { FinancePage } from './pages/FinancePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TeachersPage } from './pages/TeachersPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';

import { StudentDashboard } from './pages/StudentDashboard';
import { QuestionsPage } from './pages/QuestionsPage';

const AppContent: React.FC = () => {
  const { activeTeacherId, userRole, activeStudentId } = useApp();

  if (userRole === 'student' && activeStudentId) {
    return <StudentDashboard />;
  }

  if (!activeTeacherId) {
    return <AuthPage />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/homeworks" element={<HomeworksPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/finances" element={<FinancePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/super-admin" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
