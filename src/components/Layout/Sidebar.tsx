import React, { useState } from 'react';
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
  ChevronDown,
  UserPlus,
  X
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
    register
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
    { to: '/', icon: Calendar, label: 'Takvim' },
    { to: '/students', icon: Users, label: 'Öğrenciler' },
    { to: '/homeworks', icon: BookOpen, label: 'Ödevler' },
    { to: '/finance', icon: Wallet, label: 'Finans' },
    { to: '/notifications', icon: Bell, label: 'Bildirimler', badge: unreadNotificationsCount },
  ];

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

  return (
    <aside 
      className={`glass-sidebar h-screen flex flex-col justify-between transition-all duration-300 z-30 fixed left-0 top-0 text-text-primary ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="p-4 flex items-center justify-between border-b border-border h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded-lg text-primary border border-primary/20">
            {/* SVG Custom Whistle/Coach Logo */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <path d="M9 14h6"/>
              <path d="M9 18h6"/>
              <path d="M9 10h6"/>
            </svg>
          </div>
          {!collapsed && (
            <span className="font-sans font-bold text-lg bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
              Coach<span className="text-primary">.</span>
            </span>
          )}
        </div>
        
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
                    ? 'bg-surface-card border border-primary/20 text-text-primary font-semibold glow-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-sans truncate">{item.label}</span>}
              
              {item.badge && item.badge > 0 && (
                <span className={`absolute right-3 flex items-center justify-center bg-primary text-black font-bold text-[10px] rounded-full h-5 min-w-5 px-1 ${
                  collapsed ? '-top-1 -right-1' : ''
                }`}>
                  {item.badge}
                </span>
              )}

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
      <div className="p-3 border-t border-border space-y-4 relative">
        
        {/* Dynamic Teacher Switcher Dropdown */}
        {showTeacherDropdown && !collapsed && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowTeacherDropdown(false)} />
            <div className="absolute bottom-28 left-4 right-4 bg-surface-card border border-border rounded-xl shadow-xl p-2 z-20 space-y-1">
              <p className="text-[10px] text-text-muted font-bold px-2 py-1 uppercase">Öğretmen Değiştir</p>
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {teachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSwitchTeacher(t.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex flex-col transition-all ${
                      t.id === activeTeacherId
                        ? 'bg-primary/10 border border-primary/20 text-text-primary font-semibold'
                        : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-transparent'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] text-text-muted">{t.subject} · {t.email}</span>
                  </button>
                ))}
              </div>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => {
                  setShowAddTeacherModal(true);
                  setShowTeacherDropdown(false);
                }}
                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus size={12} />
                <span>Yeni Öğretmen Ekle</span>
              </button>
            </div>
          </>
        )}

        {/* User Card with click to Switch Teacher */}
        <div 
          onClick={() => !collapsed && setShowTeacherDropdown(!showTeacherDropdown)}
          className={`flex items-center gap-3 bg-surface-card/60 p-2.5 rounded-xl border border-border/45 overflow-hidden cursor-pointer hover:border-primary/20 hover:bg-surface-card transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold font-sans flex-shrink-0">
            {activeTeacher ? activeTeacher.name.charAt(0) : 'C'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-sm font-semibold truncate">
                <span>{activeTeacher ? activeTeacher.name : 'Yükleniyor...'}</span>
                <ChevronDown size={14} className="text-text-muted flex-shrink-0" />
              </div>
              <p className="text-xs text-text-muted truncate">
                {activeTeacher ? activeTeacher.subject : 'Öğretmen'} · {activeTeacher ? activeTeacher.email : ''}
              </p>
            </div>
          )}

        </div>



        {/* Log Out Button */}
        <button 
          onClick={logout}
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
                <label className="text-xs text-text-secondary font-semibold">ÖĞRETMEN ADI SOYADI</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Merve Kaya"
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
                  placeholder="Örn: merve@site.com"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">BRANŞ / ALAN</label>
                <select 
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                >
                  <option value="Matematik">Matematik</option>
                  <option value="Fizik">Fizik</option>
                  <option value="Kimya">Kimya</option>
                  <option value="Biyoloji">Biyoloji</option>
                  <option value="Türkçe / Edebiyat">Türkçe / Edebiyat</option>
                  <option value="İngilizce">İngilizce</option>
                  <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                  <option value="Sınıf Öğretmenliği">Sınıf Öğretmenliği</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ŞİFRE</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Öğretmen Kaydet & Giriş Yap
              </button>
            </form>
          </div>
        </div>
      )}

    </aside>
  );
};
