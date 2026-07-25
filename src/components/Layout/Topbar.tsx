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

interface TopbarProps {
  onAddClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onAddClick }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const { 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter 
  } = useApp();

  // Helper to determine page title/context
  const getPageInfo = () => {
    switch (path) {
      case '/':
        return { title: 'Takvim ve Planlama', showSearch: false };
      case '/students':
        return { title: 'Öğrenci Yönetimi', showSearch: true };
      case '/homeworks':
        return { title: 'Ödev Takip Paneli', showSearch: false };
      case '/finance':
        return { title: 'Finansal Analiz ve Raporlama', showSearch: false };
      case '/notifications':
        return { title: 'Bildirimler', showSearch: false };
      default:
        return { title: 'Dashboard', showSearch: false };
    }
  };

  const { title, showSearch } = getPageInfo();

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
        {/* Students view specific filters */}
        {path === '/students' && (
          <>
            {/* Status filters */}
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

            {/* Groups Select Dropdown */}
            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <Filter size={14} />
              <span>Gruplar</span>
            </button>

            {/* Sort Dropdown */}
            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <ChevronsUpDown size={14} />
              <span>Yeni</span>
            </button>

            {/* View Grid/List Switches */}
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

        {/* Calendar Page controls */}
        {path === '/' && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <CalendarIcon size={14} />
              <span>Haftalık Program</span>
            </button>
          </div>
        )}

        {/* Homework page controls */}
        {path === '/homeworks' && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors">
              <BookOpen size={14} />
              <span>Kütüphane</span>
            </button>
          </div>
        )}

        {/* Universal Quick Action "+" button */}
        {onAddClick && (
          <button 
            onClick={onAddClick}
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
