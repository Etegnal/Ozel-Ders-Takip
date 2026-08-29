import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Calendar as CalendarIcon,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
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
        return { title: 'Ana Sayfa', showSearch: false };
      case '/calendar':
        return { title: 'Takvim ve Planlama', showSearch: false };
      case '/students':
        return { title: 'Öğrenci Yönetimi', showSearch: true };
      case '/homeworks':
        return { title: 'Ödev Takip Paneli', showSearch: false };
      case '/questions':
        return { title: 'Soru & Çözüm Havuzu', showSearch: false };
      case '/finance':
        return { title: 'Finansal Analiz', showSearch: false };
      case '/notifications':
        return { title: 'Bildirimler', showSearch: false };
      case '/teachers':
        return { title: 'Öğretmen Profilleri', showSearch: false };
      default:
        return { title: 'Dashboard', showSearch: false };
    }
  };

  const { title, showSearch } = getPageInfo();

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-3 md:px-6 bg-surface/60 backdrop-blur-md sticky top-0 z-20 w-full min-w-0">
      {/* Left Section: Mobile Menu Trigger + Page Title or Search */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-2">
        <button 
          onClick={onMobileMenuToggle}
          className="p-2 border border-border/80 rounded-xl text-text-secondary hover:text-text-primary bg-surface-card md:hidden flex-shrink-0"
          title="Menüyü Aç"
        >
          <Menu size={18} />
        </button>

        {showSearch ? (
          <div className="relative w-full max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Öğrenci ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-card border border-border text-text-primary text-xs md:text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        ) : (
          <h1 className="text-sm md:text-xl font-bold font-sans tracking-tight text-text-primary truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section: Page Specific Filters & Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {path === '/students' && (
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="bg-surface-card border border-border rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setStatusFilter('active')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'active'
                    ? 'bg-primary text-black font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('archive')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'archive'
                    ? 'bg-primary text-black font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Arşiv
              </button>
            </div>
          </div>
        )}

        {path === '/' && (
          <div className="hidden sm:flex items-center gap-2">
            <button 
              onClick={() => setActiveModal('weekly-schedule')}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border/80 transition-colors cursor-pointer"
            >
              <CalendarIcon size={14} />
              <span>Haftalık Program</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
