import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Wallet, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Settings,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { notifications } = useApp();
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { to: '/', icon: Calendar, label: 'Takvim' },
    { to: '/students', icon: Users, label: 'Öğrenciler' },
    { to: '/homeworks', icon: BookOpen, label: 'Ödevler' },
    { to: '/finance', icon: Wallet, label: 'Finans' },
    { to: '/notifications', icon: Bell, label: 'Bildirimler', badge: unreadNotificationsCount },
  ];

  return (
    <aside 
      className={`glass-sidebar h-screen flex flex-col justify-between transition-all duration-300 z-30 fixed left-0 top-0 text-text-primary ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="p-4 flex items-center justify-between border-b border-border h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded-lg text-primary">
            {/* SVG Custom Fox Logo */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-primary" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C11.5 2 11 2.2 10.7 2.6L7.2 6.8C6.8 6.5 6.4 6.3 5.9 6.2L6.8 2.6C6.9 2.2 6.7 1.8 6.3 1.7C5.9 1.6 5.5 1.8 5.4 2.2L4.3 6.6C2.9 7.6 2 9.2 2 11C2 12.8 2.9 14.4 4.3 15.4L3.1 20.3C3 20.7 3.2 21.1 3.6 21.2C3.7 21.2 3.8 21.2 3.9 21.2C4.2 21.2 4.5 21 4.6 20.7L5.9 15.8C6.3 15.9 6.6 16 7 16H17C17.4 16 17.7 15.9 18.1 15.8L19.4 20.7C19.5 21.1 19.9 21.3 20.3 21.2C20.7 21.1 20.9 20.7 20.8 20.3L19.6 15.4C21.1 14.4 22 12.8 22 11C22 9.2 21.1 7.6 19.7 6.6L18.6 2.2C18.5 1.8 18.1 1.6 17.7 1.7C17.3 1.8 17.1 2.2 17.2 2.6L18.1 6.2C17.6 6.3 17.2 6.5 16.8 6.8L13.3 2.6C13 2.2 12.5 2 12 2ZM12 9C13.1 9 14 9.9 14 11C14 12.1 13.1 13 12 13C10.9 13 10 12.1 10 11C10 9.9 10.9 9 12 9Z"/>
            </svg>
          </div>
          {!collapsed && (
            <span className="font-sans font-bold text-lg bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
              Tilki<span className="text-primary">.</span>
            </span>
          )}
        </div>
        
        {/* Collapse Button inside sidebar header (can toggle from here too) */}
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)} 
            className="p-1 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-surface-card border border-primary/20 text-text-primary font-medium glow-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-sans truncate">{item.label}</span>}
              
              {/* Sidebar Badges */}
              {item.badge && item.badge > 0 && (
                <span className={`absolute right-3 flex items-center justify-center bg-primary text-black font-bold text-[10px] rounded-full h-5 min-w-5 px-1 ${
                  collapsed ? '-top-1 -right-1' : ''
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1.5 bg-surface-hover text-text-primary text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile and Subscription Area */}
      <div className="p-3 border-t border-border space-y-4">
        {/* User Card */}
        <div className={`flex items-center gap-3 bg-surface-card/60 p-2.5 rounded-xl border border-border/40 overflow-hidden ${
          collapsed ? 'justify-center' : ''
        }`}>
          <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold font-sans">
            R
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Rahmi KOÇ</p>
              <p className="text-xs text-text-muted truncate">rahmik93@gmail.com</p>
            </div>
          )}
          {!collapsed && (
            <button className="text-text-muted hover:text-text-primary transition-colors">
              <Settings size={16} />
            </button>
          )}
        </div>

        {/* Subscription Meter (Deneme Süresi) */}
        {!collapsed && (
          <div className="bg-surface-card/40 p-3 rounded-xl border border-border/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">DENEME SÜRESİ</span>
              <span className="text-emerald-500 font-bold">21 gün kaldı</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[70%]" />
            </div>
            <button className="w-full bg-primary hover:bg-primary-hover text-black font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-primary/20">
              <Sparkles size={14} />
              <span>Abone Ol</span>
            </button>
          </div>
        )}

        {/* Log Out Button */}
        <button 
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Çıkış Yap</span>}
        </button>
      </div>

      {/* Floating Toggle Collapse Button */}
      {collapsed && (
        <button 
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-16 w-6 h-6 bg-surface-card border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all shadow-md z-50 cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </aside>
  );
};
