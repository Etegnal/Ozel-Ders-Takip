import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/Layout/MainLayout';
import { CalendarPage } from './pages/CalendarPage';
import { StudentsPage } from './pages/StudentsPage';
import { HomeworksPage } from './pages/HomeworksPage';
import { FinancePage } from './pages/FinancePage';
import { NotificationsPage } from './pages/NotificationsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/homeworks" element={<HomeworksPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </MainLayout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
