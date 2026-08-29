import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Calendar, 
  Users, 
  BookOpen, 
  Wallet, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  ChevronDown,
  UserPlus,
  Trash2,
  X,
  ShieldCheck,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { 
    notifications, 
    teachers, 
    activeTeacherId, 
    setActiveTeacherId, 
    activeTeacher,
    logout,
    register,
    deleteTeacher,
    isAdmin
  } = useApp();

  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  // New Teacher form state
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('Matematik');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
    { path: '/calendar', label: 'Takvim', icon: Calendar },
    { path: '/students', label: 'Öğrenciler', icon: Users },
    { path: '/homeworks', label: 'Ödevler', icon: BookOpen },
    { path: '/questions', label: 'Soru Çözüm', icon: HelpCircle },
    { path: '/finances', label: 'Finans', icon: Wallet },
    { path: '/notifications', label: 'Bildirimler', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined },
  ];

  if (isAdmin) {
    navItems.push({
      path: '/super-admin',
      label: 'Super Admin',
      icon: ShieldCheck
    });
  }

  const handleSwitchTeacher = (id: string) => {
    setActiveTeacherId(id);
    setShowTeacherDropdown(false);
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim() || !newTeacherPassword.trim()) return;

    const success = register(
      newTeacherName,
      newTeacherEmail,
      newTeacherSubject,
      newTeacherPassword
    );

    if (!success) {
      alert('Bu e-posta adresi zaten kullanımda.');
      return;
    }

    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPassword('');
    setShowAddTeacherModal(false);
    setShowTeacherDropdown(false);
  };

  const [logoError, setLogoError] = useState(false);

  return (
    <aside 
      className={`glass-sidebar h-screen flex flex-col justify-between transition-all duration-300 z-30 fixed left-0 top-0 text-text-primary ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="p-4 flex items-center justify-between border-b border-border h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded-xl text-primary border border-primary/20 overflow-hidden shadow-inner">
            {!logoError ? (
              <img 
                src={`${(import.meta as any).env.BASE_URL}logo.png`} 
                className="w-full h-full object-cover" 
                alt="KOÇ Logo" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <GraduationCap className="w-5 h-5 text-primary" />
            )}
          </div>
          {!collapsed && (
            <span className="font-sans font-extrabold text-xl tracking-tight text-text-primary">
              KOÇ
            </span>
          )}
        </div>
        
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)} 
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 hover:bg-surface-hover rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Collapse Toggle for Collapsed View */}
      {collapsed && (
        <div className="p-3 border-b border-border flex justify-center">
          <button 
            onClick={() => setCollapsed(false)} 
            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors hover:bg-surface-hover rounded-xl border border-border/50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm ${
                  isActive
                    ? 'bg-primary text-black font-bold shadow-md shadow-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-black' : 'text-text-muted group-hover:text-text-primary'} />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black text-primary' : 'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-border space-y-2 relative">
        {/* Teacher Selection Dropdown (Only for Admin) */}
        {showTeacherDropdown && !collapsed && isAdmin && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowTeacherDropdown(false)} />
            <div className="absolute bottom-20 left-3 right-3 bg-surface border border-border rounded-2xl p-2 shadow-2xl z-50 space-y-1">
              <div className="text-[10px] font-bold text-text-muted px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                <span>Öğretmen Değiştir</span>
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px]">Admin</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {teachers.map(t => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                      t.id === activeTeacherId 
                        ? 'bg-primary/15 text-primary font-bold border border-primary/30' 
                        : 'hover:bg-surface-hover text-text-primary'
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchTeacher(t.id)}
                      className="flex-1 text-left truncate flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                        {t.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-semibold">{t.name}</p>
                        <p className="text-[9px] text-text-muted truncate">{t.subject}</p>
                      </div>
                    </button>
                    {teachers.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`${t.name} isimli öğretmeni silmek istediğinizden emin misiniz?`)) {
                            deleteTeacher(t.id);
                          }
                        }}
                        className="p-1 hover:bg-red-500/20 text-text-muted hover:text-red-400 rounded-md transition-all ml-1 flex-shrink-0"
                        title="Öğretmeni Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => {
                  setShowAddTeacherModal(true);
                  setShowTeacherDropdown(false);
                }}
                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={12} />
                <span>Yeni Öğretmen Ekle</span>
              </button>
            </div>
          </>
        )}

        {/* User Card */}
        <div 
          onClick={() => !collapsed && isAdmin && setShowTeacherDropdown(!showTeacherDropdown)}
          className={`flex items-center justify-between gap-3 bg-surface-card/60 p-2.5 rounded-xl border border-border/45 overflow-hidden transition-all ${
            isAdmin ? 'cursor-pointer hover:border-primary/20 hover:bg-surface-card' : 'cursor-default'
          } ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold font-sans flex-shrink-0">
              {activeTeacher ? activeTeacher.name.charAt(0) : 'K'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-sm font-semibold truncate">
                  <span>{activeTeacher ? activeTeacher.name : 'Yükleniyor...'}</span>
                  {isAdmin && <ChevronDown size={14} className="text-text-muted flex-shrink-0" />}
                </div>
                <p className="text-xs text-text-muted truncate">
                  {activeTeacher ? activeTeacher.subject : 'Öğretmen'} · {activeTeacher ? activeTeacher.email : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>

      {/* --- ADD NEW TEACHER MODAL --- */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAddTeacherModal(false)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <UserPlus className="text-primary w-5 h-5" />
                <span>Yeni Öğretmen Kaydı</span>
              </h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddTeacherSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">AD SOYAD</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Mehmet Yılmaz"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">E-POSTA ADRESİ</label>
                <input 
                  type="email" 
                  required
                  placeholder="Örn: mehmet@example.com"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">DERS BRANŞI</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Matematik / Geometri"
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ŞİFRE</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Öğretmeni Ekle
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
