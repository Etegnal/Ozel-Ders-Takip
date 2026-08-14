import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher, Student } from '../types';
import { 
  ShieldCheck, 
  RefreshCw, 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Trash2, 
  Edit3, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { formatCurrency, getWhatsAppLink } from '../utils/helpers';

export const AdminPage: React.FC = () => {
  const { 
    teachers, 
    allStudents, 
    lessons,
    activeTeacherId, 
    setActiveTeacherId, 
    deleteTeacher, 
    updateTeacher, 
    register, 
    updateStudent,
    deleteStudent,
    syncCloudNow,
    isAdmin,
    firebaseUrl,
    updateFirebaseUrl
  } = useApp();

  const [adminFirebaseUrlInput, setAdminFirebaseUrlInput] = useState(firebaseUrl);
  const [showFirebaseGuideModal, setShowFirebaseGuideModal] = useState(false);

  // Active Admin Tab: 'teachers' | 'students'
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');

  // Cloud Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Search & Filters
  const [teacherSearch, setTeacherSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  
  const [studentSearch, setStudentSearch] = useState('');
  const [studentTeacherFilter, setStudentTeacherFilter] = useState('all');

  // Show Password Map for Teacher Cards
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});

  // --- MODALS FOR TEACHER ---
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('Matematik');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [addTeacherError, setAddTeacherError] = useState('');

  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherEmail, setEditTeacherEmail] = useState('');
  const [editTeacherSubject, setEditTeacherSubject] = useState('Matematik');
  const [editTeacherPassword, setEditTeacherPassword] = useState('');

  // --- MODALS FOR STUDENT ---
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentGrade, setEditStudentGrade] = useState('8. Sınıf');
  const [editStudentHourlyRate, setEditStudentHourlyRate] = useState(1000);
  const [editStudentMonthlyHours, setEditStudentMonthlyHours] = useState(8);
  const [editStudentParentName, setEditStudentParentName] = useState('');
  const [editStudentParentPhone, setEditStudentParentPhone] = useState('');
  const [editStudentTeacherId, setEditStudentTeacherId] = useState('');
  const [editStudentNotes, setEditStudentNotes] = useState('');

  // Handle Manual Sync Button Click
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('');
    await syncCloudNow();
    setIsSyncing(false);
    setSyncStatusMsg('Veri Tabanı Canlı Senkronize Edildi');
    setTimeout(() => setSyncStatusMsg(''), 3500);
  };

  const toggleShowPassword = (id: string) => {
    setShowPassMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // --- Teacher Handlers ---
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTeacherError('');
    if (!newTeacherName.trim() || !newTeacherEmail.trim() || !newTeacherPassword.trim()) {
      setAddTeacherError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    if (newTeacherPassword.trim().length < 6) {
      setAddTeacherError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const success = await register(
      newTeacherName.trim(),
      newTeacherEmail.trim(),
      newTeacherSubject,
      newTeacherPassword.trim()
    );

    if (!success) {
      setAddTeacherError('Bu e-posta adresi zaten kullanımda.');
      return;
    }

    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPassword('');
    setShowAddTeacherModal(false);
  };

  const handleOpenEditTeacherModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditTeacherName(teacher.name);
    setEditTeacherEmail(teacher.email);
    setEditTeacherSubject(teacher.subject);
    setEditTeacherPassword(teacher.password || '123456');
    setShowEditTeacherModal(true);
  };

  const handleEditTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editTeacherName.trim() || !editTeacherEmail.trim() || !editTeacherPassword.trim()) return;

    updateTeacher(editingTeacher.id, {
      name: editTeacherName.trim(),
      email: editTeacherEmail.trim().toLowerCase(),
      subject: editTeacherSubject,
      password: editTeacherPassword.trim()
    });

    setShowEditTeacherModal(false);
    setEditingTeacher(null);
  };

  // --- Student Handlers ---
  const handleOpenEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setEditStudentName(student.name);
    setEditStudentPhone(student.phone);
    setEditStudentGrade(student.grade);
    setEditStudentHourlyRate(student.hourlyRate);
    setEditStudentMonthlyHours(student.monthlyHours || 0);
    setEditStudentParentName(student.parentName || '');
    setEditStudentParentPhone(student.parentPhone || '');
    setEditStudentTeacherId(student.teacherId);
    setEditStudentNotes(student.notes || '');
    setShowEditStudentModal(true);
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    updateStudent(editingStudent.id, {
      name: editStudentName.trim(),
      phone: editStudentPhone.trim(),
      grade: editStudentGrade,
      hourlyRate: Number(editStudentHourlyRate),
      monthlyHours: editStudentMonthlyHours ? Number(editStudentMonthlyHours) : undefined,
      parentName: editStudentParentName.trim() || undefined,
      parentPhone: editStudentParentPhone.trim() || undefined,
      teacherId: editStudentTeacherId,
      notes: editStudentNotes.trim() || undefined
    });

    setShowEditStudentModal(false);
    setEditingStudent(null);
  };

  // Access Security Check
  if (!isAdmin) {
    return (
      <div className="bg-surface-card border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Erişim Engellendi</h2>
        <p className="text-xs text-text-secondary">
          Bu sayfaya yalnızca Platform Super Admin hesabı (Yasin Eren Alacahan) erişebilir.
        </p>
      </div>
    );
  }

  // Filtered Teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(teacherSearch.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || t.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Filtered Students
  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.includes(studentSearch) ||
      (s.grade && s.grade.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesTeacher = studentTeacherFilter === 'all' || s.teacherId === studentTeacherFilter;
    return matchesSearch && matchesTeacher;
  });

  const allSubjects = Array.from(new Set(teachers.map(t => t.subject).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-surface-card/80 border border-primary/30 p-6 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={15} />
                <span>Super Admin Özel Kontrol Paneli</span>
              </span>
              <span className="text-xs text-text-muted">· Yalnızca Yasin Eren Alacahan Yetkili</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Sistem Yönetimi & Veri Tabanı</h1>
            <p className="text-xs text-text-secondary mt-1">
              Tüm öğretmenlerin, öğrencilerin ve sistem verilerinin tam yetkili kontrolünü sağlayın.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* The ONLY Cloud Sync Button Requested by User */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={`${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Eşitleniyor...' : 'Verileri Canlı Eşitle'}</span>
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-semibold animate-fade-in">
            <CheckCircle2 size={14} />
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Firebase Database Configuration Banner */}
      <div className="bg-surface-card/90 border border-border p-5 rounded-3xl space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0 font-bold text-base">
              🔥
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <span>Firebase Canlı Veritabanı Kurulumu</span>
                {firebaseUrl ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Bağlı & Canlı ✅
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Firebase Bağlantısı Yok
                  </span>
                )}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Masaüstü EXE, Mobil APK ve Web Sitenizin anlık veri paylaşması için Firebase Realtime Database URL'nizi girin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFirebaseGuideModal(!showFirebaseGuideModal)}
            className="text-xs text-primary hover:underline font-bold self-start sm:self-center cursor-pointer flex-shrink-0"
          >
            {showFirebaseGuideModal ? 'Rehberi Kapat' : 'Ücretsiz Firebase Kurulum Rehberi'}
          </button>
        </div>

        {/* Input & Save Button */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="url"
            placeholder="Örn: https://proje-id-default-rtdb.firebaseio.com/ veya https://...europe-west1.firebasedatabase.app/"
            value={adminFirebaseUrlInput}
            onChange={(e) => setAdminFirebaseUrlInput(e.target.value)}
            className="flex-1 bg-background border border-border text-text-primary text-xs rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={async () => {
              await updateFirebaseUrl(adminFirebaseUrlInput.trim());
              alert('Firebase Veritabanı adresi güncellendi ve tüm veriler eşitlendi! 🎉');
            }}
            className="bg-primary hover:bg-primary-hover text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer flex-shrink-0"
          >
            Kaydet & Tüm Cihazlara Eşitle
          </button>
        </div>

        {/* Step-by-step setup guide */}
        {showFirebaseGuideModal && (
          <div className="mt-3 p-4 bg-background/90 border border-border/80 rounded-2xl text-xs space-y-2 text-text-secondary leading-relaxed animate-fade-in">
            <h4 className="font-bold text-text-primary text-xs flex items-center gap-1.5">
              <span>🚀 1 Dakikada Ücretsiz Firebase Realtime Database Kurulum Adımları:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-text-secondary text-xs">
              <li>Google tarayıcınızda <strong className="text-text-primary">https://console.firebase.google.com</strong> adresine gidin.</li>
              <li>"Proje Ekle" butonuna basıp projenize isim verin (Örn: <code className="bg-surface-card px-1.5 py-0.5 rounded border border-border text-primary font-mono">ozel-ders-takip</code>).</li>
              <li>Sol menüden <strong className="text-text-primary">Build &gt; Realtime Database</strong> sekmesine tıklayın.</li>
              <li>"Veritabanı Oluştur" butonuna basın, konum olarak <strong className="text-text-primary">Europe West</strong> (veya US) seçin.</li>
              <li>Güvenlik Kuralları sekmesine gelin ve kuralları şu şekilde güncelleyin: <br />
                <code className="bg-surface-card px-2 py-1 rounded border border-border text-amber-400 font-mono text-[11px] block my-1">
                  {`{ "rules": { ".read": true, ".write": true } }`}
                </code>
              </li>
              <li>Veritabanı ana ekranındaki kopyaladığınız URL adresini (örn: <code className="text-primary font-mono">https://...firebaseio.com/</code> veya <code className="text-primary font-mono">https://...firebasedatabase.app/</code>) yukarıdaki kutuya yapıştırın ve <strong>Kaydet</strong> butonuna basın.</li>
              <li>Artık EXE (Masaüstü), Mobil APK ve Web Siteniz bu adresi kullanarak 100% eşitlenecektir!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card p-5 rounded-2xl border border-border/80 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Toplam Kayıtlı Öğretmen</p>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">{teachers.length} Öğretmen</h3>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-border/80 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Toplam Kayıtlı Öğrenci</p>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">{allStudents.length} Öğrenci</h3>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-border/80 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CalendarIcon size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Sistemdeki Ders Sayısı</p>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">{lessons.length} Ders Saat</h3>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-2 gap-4">
        <div className="flex items-center gap-2 p-1 bg-surface-card border border-border rounded-2xl">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-primary text-black shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users size={16} />
            <span>Öğretmen Hesapları ({teachers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-primary text-black shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={16} />
            <span>Öğrenci Kayıtları ({allStudents.length})</span>
          </button>
        </div>

        {activeTab === 'teachers' && (
          <button
            onClick={() => setShowAddTeacherModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Yeni Öğretmen Ekle</span>
          </button>
        )}
      </div>

      {/* TAB 1: TEACHERS MANAGEMENT */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          {/* Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-card/40 p-4 border border-border/80 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="İsim, e-posta veya branş ara..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachers.map((teacher) => {
              const isSelf = teacher.id === activeTeacherId;
              const teacherStudentsCount = allStudents.filter(s => s.teacherId === teacher.id).length;
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
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-lg">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-text-primary">{teacher.name}</h3>
                            {(teacher.name.toLowerCase().includes('yasin') || teacher.email.toLowerCase().includes('yasinalacahan')) && (
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
                          <span>Seçili Hesaptasınız</span>
                        </span>
                      )}
                    </div>

                    {/* Information Box */}
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
                            {showPass ? (teacher.password || '123456') : '••••••••'}
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
                    </div>

                    {/* Stats */}
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

                  {/* Actions */}
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

                    <button
                      onClick={() => handleOpenEditTeacherModal(teacher)}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all cursor-pointer"
                      title="Öğretmen Bilgilerini Düzenle"
                    >
                      <Edit3 size={15} />
                    </button>

                    {teachers.length > 1 && teacher.id !== 'teacher-yasin-1' && (
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
        </div>
      )}

      {/* TAB 2: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Search & Teacher Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-card/40 p-4 border border-border/80 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Öğrenci adı, telefon veya sınıf ara..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-surface-card border border-border text-text-primary text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-text-secondary whitespace-nowrap font-medium">Öğretmen Filtresi:</span>
              <select
                value={studentTeacherFilter}
                onChange={(e) => setStudentTeacherFilter(e.target.value)}
                className="bg-surface-card border border-border text-text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer w-full sm:w-56"
              >
                <option value="all">Tüm Öğretmenlerin Öğrencileri ({allStudents.length})</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject}) - {allStudents.filter(s => s.teacherId === t.id).length} Öğrenci
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const assignedTeacher = teachers.find(t => t.id === student.teacherId);
                return (
                  <div 
                    key={student.id}
                    className="bg-surface-card border border-border/70 rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Student Identity */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-text-primary text-base">{student.name}</h4>
                          <span className="bg-surface-hover text-text-secondary text-xs px-2.5 py-0.5 rounded-lg border border-border">
                            {student.grade}
                          </span>
                          {assignedTeacher && (
                            <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <UserCheck size={12} />
                              <span>Öğretmen: {assignedTeacher.name}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap pt-0.5">
                          <span className="flex items-center gap-1.5">
                            <Phone size={13} className="text-text-muted" />
                            {student.phone}
                          </span>
                          {student.parentPhone && (
                            <span className="flex items-center gap-1.5 text-text-muted">
                              Veli ({student.parentName || 'Veli'}): {student.parentPhone}
                            </span>
                          )}
                          <span className="font-semibold text-primary">
                            Ders Ücreti: {formatCurrency(student.hourlyRate)}/Saat
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Student Admin Actions */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                      <a
                        href={getWhatsAppLink(student.phone, `Merhaba ${student.name},`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all"
                        title="WhatsApp İletişim"
                      >
                        <Phone size={15} />
                      </a>

                      <button
                        onClick={() => handleOpenEditStudentModal(student)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        title="Öğrenciyi Düzenle veya Öğretmenini Değiştir"
                      >
                        <Edit3 size={15} />
                        <span>Düzenle / Öğretmen Değiştir</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`${student.name} isimli öğrenciyi silmek istediğinize emin misiniz?`)) {
                            deleteStudent(student.id);
                          }
                        }}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                        title="Öğrenciyi Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-card border border-border rounded-2xl p-12 text-center">
                <AlertCircle className="mx-auto text-text-muted w-10 h-10 mb-3" />
                <h3 className="text-base font-bold text-text-primary">Kayıtlı Öğrenci Bulunamadı</h3>
                <p className="text-xs text-text-secondary mt-1">Arama veya öğretmen filtresine uyan öğrenci bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add Teacher */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                <span>Yeni Öğretmen Hesabı Ekle</span>
              </h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            {addTeacherError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{addTeacherError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">AD SOYAD</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">BRANŞ</label>
                <select
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
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

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">E-POSTA ADRESİ</label>
                <input
                  type="email"
                  required
                  placeholder="ahmet@ogretmen.com"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">GİRİŞ ŞİFRESİ</label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-xl shadow-md"
                >
                  Öğretmeni Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Teacher */}
      {showEditTeacherModal && editingTeacher && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Edit3 size={18} className="text-primary" />
                <span>Öğretmen Bilgilerini Düzenle</span>
              </h3>
              <button onClick={() => setShowEditTeacherModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditTeacherSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">AD SOYAD</label>
                <input
                  type="text"
                  required
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">BRANŞ</label>
                <select
                  value={editTeacherSubject}
                  onChange={(e) => setEditTeacherSubject(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
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

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">E-POSTA ADRESİ</label>
                <input
                  type="email"
                  required
                  value={editTeacherEmail}
                  onChange={(e) => setEditTeacherEmail(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">GİRİŞ ŞİFRESİ</label>
                <input
                  type="text"
                  required
                  value={editTeacherPassword}
                  onChange={(e) => setEditTeacherPassword(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditTeacherModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-xl shadow-md"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Student & Reassign Teacher */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Edit3 size={18} className="text-primary" />
                <span>Öğrenciyi Düzenle & Öğretmenini Değiştir</span>
              </h3>
              <button onClick={() => setShowEditStudentModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} className="space-y-3.5">
              {/* Teacher Reassignment Box */}
              <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl space-y-1.5">
                <label className="text-[11px] text-primary font-bold uppercase flex items-center gap-1.5">
                  <ArrowRightLeft size={14} />
                  <span>ATANAN ÖĞRETMENİ DEĞİŞTİR</span>
                </label>
                <select
                  value={editStudentTeacherId}
                  onChange={(e) => setEditStudentTeacherId(e.target.value)}
                  className="w-full bg-background border border-primary/30 text-text-primary text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-bold cursor-pointer"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject}) - {t.email}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-muted">
                  Bu öğrencinin bağlı olduğu öğretmeni değiştirebilir ve başka öğretmene atayabilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">AD SOYAD</label>
                  <input
                    type="text"
                    required
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">TELEFON</label>
                  <input
                    type="text"
                    required
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">SINIF</label>
                  <select
                    value={editStudentGrade}
                    onChange={(e) => setEditStudentGrade(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  >
                    <option value="5. Sınıf">5. Sınıf</option>
                    <option value="6. Sınıf">6. Sınıf</option>
                    <option value="7. Sınıf">7. Sınıf</option>
                    <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                    <option value="9. Sınıf">9. Sınıf</option>
                    <option value="10. Sınıf">10. Sınıf</option>
                    <option value="11. Sınıf">11. Sınıf</option>
                    <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                    <option value="Mezun">Mezun</option>
                    <option value="İlkokul">İlkokul</option>
                    <option value="Üniversite / Yetişkin">Üniversite / Yetişkin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">SAAT ÜCRETİ (TL)</label>
                  <input
                    type="number"
                    required
                    value={editStudentHourlyRate}
                    onChange={(e) => setEditStudentHourlyRate(Number(e.target.value))}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">AYLIK HEDEF SAAT</label>
                  <input
                    type="number"
                    value={editStudentMonthlyHours}
                    onChange={(e) => setEditStudentMonthlyHours(Number(e.target.value))}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">VELİ ADI SOYADI</label>
                  <input
                    type="text"
                    placeholder="İsteğe bağlı"
                    value={editStudentParentName}
                    onChange={(e) => setEditStudentParentName(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary font-bold uppercase">VELİ TELEFONU</label>
                  <input
                    type="text"
                    placeholder="İsteğe bağlı"
                    value={editStudentParentPhone}
                    onChange={(e) => setEditStudentParentPhone(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3.5 py-2.5 mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase">NOTLAR</label>
                <textarea
                  rows={2}
                  value={editStudentNotes}
                  onChange={(e) => setEditStudentNotes(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary text-xs rounded-xl p-3 mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditStudentModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-xl shadow-md"
                >
                  Öğrenciyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
