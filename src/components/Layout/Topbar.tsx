import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Calendar as CalendarIcon,
  ChevronsUpDown,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const { 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter,
    setActiveModal
  } = useApp();

  const getPageInfo = () => {
    switch (path) {
      case '/':
        return { title: 'Takvim ve Planlama', showSearch: false, modalType: 'lesson' as const };
      case '/students':
        return { title: 'Öğrenci Yönetimi', showSearch: true, modalType: 'student' as const };
      case '/homeworks':
        return { title: 'Ödev Takip Paneli', showSearch: false, modalType: 'homework' as const };
      case '/finance':
        return { title: 'Finansal Analiz ve Raporlama', showSearch: false, modalType: 'transaction' as const };
      case '/notifications':
        return { title: 'Bildirimler', showSearch: false, modalType: null };
      default:
        return { title: 'Dashboard', showSearch: false, modalType: null };
    }
  };

  const { title, showSearch, modalType } = getPageInfo();

  const handlePlusClick = () => {
    if (modalType) {
      setActiveModal(modalType);
    }
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/40 backdrop-blur-md sticky top-0 z-20">
      {/* Left Section: Page Title or Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {showSearch ? (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Öğrenci ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-card border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        ) : (
          <h1 className="text-xl font-bold font-sans tracking-tight text-text-primary">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section: Page Specific Filters & Actions */}
      <div className="flex items-center gap-3">
        {path === '/students' && (
          <>
            <div className="bg-surface-card border border-border rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setStatusFilter('active')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'active'
                    ? 'bg-primary text-black font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('archive')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'archive'
                    ? 'bg-primary text-black font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Arşiv
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-primary text-black font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Tümü
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <Filter size={14} />
              <span>Gruplar</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <ChevronsUpDown size={14} />
              <span>Yeni</span>
            </button>

            <div className="bg-surface-card border border-border rounded-xl p-1 flex items-center gap-0.5">
              <button className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                <Eye size={15} />
              </button>
              <button className="p-1.5 rounded-lg bg-primary text-black font-bold shadow-sm">
                <List size={14} />
              </button>
              <button className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                <Grid size={15} />
              </button>
            </div>
          </>
        )}

        {path === '/' && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <CalendarIcon size={14} />
              <span>Haftalık Program</span>
            </button>
          </div>
        )}

        {path === '/homeworks' && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <BookOpen size={14} />
              <span>Kütüphane</span>
            </button>
          </div>
        )}

        {/* Global Quick Action "+" button */}
        {modalType && (
          <button 
            onClick={handlePlusClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-black font-bold text-sm rounded-xl transition-colors shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Plus size={16} />
            <span>Yeni Ekle</span>
          </button>
        )}
      </div>
    </header>
  );
};
