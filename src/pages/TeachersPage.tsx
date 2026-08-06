import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Plus, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Trash2, 
  Mail, 
  BookOpen, 
  Lock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const { 
    teachers, 
    activeTeacherId, 
    setActiveTeacherId, 
    deleteTeacher, 
    register, 
    syncCloudNow, 
    students, 
    lessons
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Modal State for adding new teacher
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('Matematik');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [addErrorMsg, setAddErrorMsg] = useState('');

  const toggleShowPassword = (id: string) => {
    setShowPassMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('');
    await syncCloudNow();
    setIsSyncing(false);
    setSyncStatusMsg('Veri Tabanı Canlı Senkronize Edildi');
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrorMsg('');
    if (!newTeacherName.trim() || !newTeacherEmail.trim() || !newTeacherPassword.trim()) {
      setAddErrorMsg('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newTeacherPassword.trim().length < 6) {
      setAddErrorMsg('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const success = await register(
      newTeacherName.trim(),
      newTeacherEmail.trim(),
      newTeacherSubject,
      newTeacherPassword.trim()
    );

    if (!success) {
      setAddErrorMsg('Bu e-posta adresi zaten kullanımda.');
      return;
    }

    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPassword('');
    setShowAddModal(false);
  };

  // Filtered teachers list
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = subjectFilter === 'all' || teacher.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  const allSubjects = Array.from(new Set(teachers.map(t => t.subject).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-surface-card/60 border border-border p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 bg-primary/15 border border-primary/30 text-primary font-bold text-xs rounded-lg flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Super Admin Paneli</span>
              </span>
              <span className="text-xs text-text-muted">· Yalnızca Yasin Eren Alacahan Yetkili</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Öğretmen Yönetim Paneli</h1>
            <p className="text-xs text-text-secondary mt-1">
              Sisteme kayıtlı tüm öğretmenlerin hesap bilgilerini, şifrelerini ve performansını görüntüleyin.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-card border border-border hover:border-primary/40 text-text-primary text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={`text-primary ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Eşitleniyor...' : 'Bulut Verilerini Yenile'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <Plus size={15} />
              <span>Yeni Öğretmen Ekle</span>
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-medium animate-fade-in">
            <CheckCircle2 size={13} />
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card p-4 rounded-xl border border-border/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Toplam Kayıtlı Öğretmen</p>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">{teachers.length} Öğretmen</h3>
          </div>
        </div>

        <div className="bg-surface-card p-4 rounded-xl border border-border/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Toplam Kayıtlı Öğrenci</p>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">{students.length} Öğrenci</h3>
          </div>
        </div>

        <div className="bg-surface-card p-4 rounded-xl border border-border/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CalendarIcon size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Toplam Planlanan Ders</p>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">{lessons.length} Ders Saat</h3>
          </div>
        </div>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-card/40 p-4 border border-border/80 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="İsim, e-posta veya branş ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-card border border-border text-text-primary text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-text-secondary whitespace-nowrap font-medium">Branş Filtresi:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-surface-card border border-border text-text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer w-full sm:w-48"
          >
            <option value="all">Tüm Branşlar ({teachers.length})</option>
            {allSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-surface-card border border-border rounded-2xl p-12 text-center">
          <AlertCircle className="mx-auto text-text-muted w-10 h-10 mb-3" />
          <h3 className="text-base font-bold text-text-primary">Kayıtlı Öğretmen Bulunamadı</h3>
          <p className="text-xs text-text-secondary mt-1">Arama kriterlerinize uyan kayıtlı öğretmen bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const isSelf = teacher.id === activeTeacherId;
            const teacherStudentsCount = students.filter(s => s.teacherId === teacher.id).length;
            const teacherLessonsCount = lessons.filter(l => l.teacherId === teacher.id).length;
            const showPass = Boolean(showPassMap[teacher.id]);

            return (
              <div 
                key={teacher.id}
                className={`bg-surface-card border rounded-2xl p-5 relative flex flex-col justify-between transition-all hover:border-primary/30 ${
                  isSelf ? 'border-primary/40 shadow-lg shadow-primary/5 bg-primary/5' : 'border-border'
                }`}
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-lg">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-text-primary">{teacher.name}</h3>
                          {teacher.name.toLowerCase().includes('yasin') && (
                            <span className="text-xs" title="Super Admin">👑</span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 bg-surface-hover text-text-secondary text-[11px] rounded-md font-medium inline-block mt-0.5">
                          {teacher.subject}
                        </span>
                      </div>
                    </div>

                    {isSelf && (
                      <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <UserCheck size={12} />
                        <span>Aktif Görünüm</span>
                      </span>
                    )}
                  </div>

                  {/* Teacher Information Box */}
                  <div className="space-y-2 bg-background/60 p-3 rounded-xl border border-border/60 text-xs mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <Mail size={13} /> E-Posta:
                      </span>
                      <span className="font-semibold text-text-primary select-all">{teacher.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <Lock size={13} /> Şifre:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary select-all">
                          {showPass ? teacher.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => toggleShowPassword(teacher.id)}
                          className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
                          title={showPass ? 'Gizle' : 'Göster'}
                        >
                          {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                      <span className="text-text-muted">Kayıt Tarihi:</span>
                      <span className="text-text-secondary">
                        {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                      </span>
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface-hover p-2 rounded-xl text-center">
                      <span className="text-[10px] text-text-muted block">Atanan Öğrenci</span>
                      <span className="text-sm font-bold text-text-primary">{teacherStudentsCount} Öğrenci</span>
                    </div>
                    <div className="bg-surface-hover p-2 rounded-xl text-center">
                      <span className="text-[10px] text-text-muted block">Planlanan Ders</span>
                      <span className="text-sm font-bold text-text-primary">{teacherLessonsCount} Ders</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setActiveTeacherId(teacher.id)}
                    disabled={isSelf}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isSelf 
                        ? 'bg-surface-hover text-text-muted opacity-60 cursor-default'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 cursor-pointer'
                    }`}
                  >
                    <span>{isSelf ? 'Şu An Seçili' : 'Hesabına Geçiş Yap'}</span>
                  </button>

                  {teachers.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`${teacher.name} isimli öğretmeni silmek istediğinizden emin misiniz?`)) {
                          deleteTeacher(teacher.id);
                        }
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                      title="Öğretmeni Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                <span>Yeni Öğretmen Kaydı Ekle</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {addErrorMsg && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                {addErrorMsg}
              </div>
            )}

            <form onSubmit={handleAddTeacherSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-text-secondary font-bold uppercase tracking-wider">AD SOYAD</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-bold uppercase tracking-wider">BRANŞ</label>
                <select
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer"
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
                <label className="text-text-secondary font-bold uppercase tracking-wider">E-POSTA ADRESİ</label>
                <input
                  type="email"
                  required
                  placeholder="ogretmen@example.com"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-bold uppercase tracking-wider">ŞİFRE</label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-surface-hover text-text-secondary text-xs rounded-xl font-bold hover:text-text-primary transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  Öğretmeni Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
