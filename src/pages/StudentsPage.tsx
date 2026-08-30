import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { 
  Phone, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Archive, 
  UserPlus,
  Calendar as CalendarIcon,
  MessageSquare,
  X,
  User,
  Lock
} from 'lucide-react';
import { formatCurrency, getWhatsAppLink, getTodayDateString, normalizeGrade } from '../utils/helpers';
import { ExamResultsSection } from '../components/ExamResultsSection';

export const StudentsPage: React.FC = () => {
  const { 
    students, 
    allStudents,
    teachers,
    isAdmin,
    searchQuery, 
    statusFilter, 
    addStudent, 
    updateStudent, 
    deleteStudent,
    addLesson,
    activeModal,
    setActiveModal
  } = useApp();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState<string>('all');

  // Detect Topbar "+" click (via Context activeModal)
  useEffect(() => {
    if (activeModal === 'student') {
      handleOpenAddModal();
    }
  }, [activeModal]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showScheduleLessonModal, setShowScheduleLessonModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('8. Sınıf');
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [monthlyHours, setMonthlyHours] = useState(8);
  const [notes, setNotes] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [password, setPassword] = useState('');

  // Quick lesson states
  const [lessonDate, setLessonDate] = useState(getTodayDateString());
  const [lessonTime, setLessonTime] = useState('18:00');
  const [lessonDuration, setLessonDuration] = useState(60);
  const [lessonNotes, setLessonNotes] = useState('');

  // Dropdown states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setName('');
    setPhone('');
    setGrade('8. Sınıf');
    setHourlyRate(1000);
    setMonthlyHours(8);
    setNotes('');
    setShowAddModal(true);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    addStudent({
      name: name.trim(),
      phone: phone.trim(),
      grade,
      hourlyRate: Number(hourlyRate),
      monthlyHours: monthlyHours ? Number(monthlyHours) : undefined,
      status: 'active',
      notes
    });
    alert(`Öğrenci "${name.trim()}" başarıyla eklendi! 🎉`);
    setShowAddModal(false);
    setActiveModal(null);
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setName(student.name);
    setPhone(student.phone);
    setGrade(student.grade);
    setPassword(student.password || '');
    setHourlyRate(student.hourlyRate);
    setMonthlyHours(student.monthlyHours || 0);
    setNotes(student.notes || '');
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    updateStudent(selectedStudent.id, {
      name,
      phone,
      grade,
      password: password.trim() || selectedStudent.password,
      hourlyRate: Number(hourlyRate),
      monthlyHours: monthlyHours ? Number(monthlyHours) : undefined,
      notes
    });
    setShowEditModal(false);
  };

  const handleOpenParentModal = (student: Student) => {
    setSelectedStudent(student);
    setParentName(student.parentName || '');
    setParentPhone(student.parentPhone || '');
    setShowParentModal(true);
    setActiveMenuId(null);
  };

  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    updateStudent(selectedStudent.id, {
      parentName,
      parentPhone
    });
    setShowParentModal(false);
  };

  const handleOpenScheduleModal = (student: Student) => {
    setSelectedStudent(student);
    setLessonDate(getTodayDateString());
    setLessonTime('18:00');
    setLessonDuration(60);
    setLessonNotes('');
    setShowScheduleLessonModal(true);
    setActiveMenuId(null);
  };

  const handleScheduleLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    addLesson({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      date: lessonDate,
      startTime: lessonTime,
      durationMinutes: Number(lessonDuration),
      rate: Number(selectedStudent.hourlyRate * (lessonDuration / 60)),
      status: 'scheduled',
      notes: lessonNotes
    });
    setShowScheduleLessonModal(false);
  };

  const toggleArchive = (student: Student) => {
    updateStudent(student.id, {
      status: student.status === 'active' ? 'archive' : 'active'
    });
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu öğrenciyi silmek istediğinize emin misiniz? İlgili tüm ders ve ödev verileri de silinecektir.')) {
      deleteStudent(id);
    }
    setActiveMenuId(null);
  };

  // Filter students based on status, teacher (for Admin), and search query
  const studentListToUse = isAdmin ? allStudents : students;
  const filteredStudents = studentListToUse.filter(student => {
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesTeacher = !isAdmin || teacherFilter === 'all' || student.teacherId === teacherFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.phone.includes(searchQuery) ||
                          (student.grade && student.grade.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesTeacher && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Admin Teacher Filter Bar */}
      {isAdmin && (
        <div className="bg-surface-card/60 border border-primary/20 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">👑 Super Admin Öğretmen Filtresi:</span>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="bg-background border border-border text-text-primary text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="all">Tüm Öğretmenlerin Öğrencileri ({allStudents.length})</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subject}) - {allStudents.filter(s => s.teacherId === t.id).length} Öğrenci
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-text-muted">
            Gösterilen: <strong className="text-text-primary">{filteredStudents.length}</strong> öğrenci
          </span>
        </div>
      )}

      {/* Student List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div 
              key={student.id} 
              className="bg-surface-card border border-border/60 rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Column: Student Base Info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-lg text-primary border border-primary/20">
                    {student.name.charAt(0)}
                  </div>
                  {/* Active/Inactive Status Dot */}
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface-card ${
                    student.status === 'active' ? 'bg-emerald-500 glow-green' : 'bg-text-muted'
                  }`} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary text-base">{student.name}</span>
                    <span className="bg-surface-hover text-text-secondary text-[11px] px-2 py-0.5 rounded-md border border-border">
                      {student.grade}
                    </span>
                    {isAdmin && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 shadow-sm" title="Super Admin Özel Yetkisi: Öğrenci Giriş Şifresi">
                        <Lock size={12} />
                        <span>Şifre: <strong className="underline tracking-wider">{student.password || 'Şifresiz'}</strong></span>
                      </span>
                    )}
                  </div>
                  
                  {/* Phone with WhatsApp Link */}
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Phone size={14} className="text-text-muted" />
                    <span>{student.phone}</span>
                    <a 
                      href={getWhatsAppLink(student.phone, `Merhaba ${student.name},`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:text-emerald-400 p-0.5 hover:bg-emerald-500/10 rounded-md transition-colors"
                      title="WhatsApp Mesaj Gönder"
                    >
                      <MessageSquare size={14} />
                    </a>
                  </div>

                  {/* Quick Add Resource */}
                  <button className="text-xs text-text-muted hover:text-text-primary bg-surface-hover/50 hover:bg-surface-hover border border-border px-2 py-1 rounded-lg mt-1 transition-all flex items-center gap-1">
                    <Plus size={11} />
                    <span>Kaynak Ekle</span>
                  </button>
                </div>
              </div>

              {/* Middle Section: Lesson Planner Shortcut */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleOpenScheduleModal(student)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/25 rounded-xl text-xs font-semibold transition-all"
                >
                  <CalendarIcon size={14} />
                  <span>Ders Planla</span>
                </button>
              </div>

              {/* Right Section: Finance details & options */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                <div className="text-right space-y-0.5">
                  <div className="text-sm font-medium text-text-primary">
                    {formatCurrency(student.hourlyRate)}<span className="text-text-muted text-xs">/60dk</span>
                  </div>
                  {student.monthlyHours && (
                    <div className="text-xs text-amber-500 font-medium">
                      {student.monthlyHours} Saat/ay
                    </div>
                  )}
                </div>

                <div className="text-right space-y-0.5 min-w-[70px]">
                  <div className="text-xs text-text-muted">Bakiye</div>
                  <div className={`text-sm font-bold ${
                    student.balance > 0 ? 'text-red-500' : student.balance < 0 ? 'text-emerald-500' : 'text-text-secondary'
                  }`}>
                    {formatCurrency(Math.abs(student.balance))} {student.balance > 0 ? 'Borç' : student.balance < 0 ? 'Fazla' : '₺0'}
                  </div>
                </div>

                {/* Parent Info */}
                <div className="flex items-center">
                  {student.parentName ? (
                    <button 
                      onClick={() => handleOpenParentModal(student)}
                      className="text-xs bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl font-semibold transition-all"
                    >
                      Veli: {student.parentName}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenParentModal(student)}
                      className="text-xs bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl font-semibold transition-all"
                    >
                      + Veli Ekle
                    </button>
                  )}
                </div>

                {/* Options Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                    className="p-2 hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-xl transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeMenuId === student.id && (
                    <>
                      <div 
                        onClick={() => setActiveMenuId(null)}
                        className="fixed inset-0 z-10"
                      />
                      <div className="absolute right-0 mt-1 w-44 bg-surface-card border border-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                        <button 
                          onClick={() => handleOpenEditModal(student)}
                          className="w-full text-left px-4 py-2 hover:bg-surface-hover text-xs flex items-center gap-2 text-text-primary transition-colors"
                        >
                          Düzenle
                        </button>
                        <button 
                          onClick={() => toggleArchive(student)}
                          className="w-full text-left px-4 py-2 hover:bg-surface-hover text-xs flex items-center gap-2 text-text-primary transition-colors"
                        >
                          <Archive size={14} className="text-text-muted" />
                          <span>{student.status === 'active' ? 'Arşivle' : 'Aktifleştir'}</span>
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-xs flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Öğrenciyi Sil</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface-card border border-border border-dashed rounded-2xl text-text-secondary space-y-2">
            <User className="mx-auto w-10 h-10 text-text-muted" />
            <p className="font-semibold text-sm">Hiç öğrenci bulunamadı</p>
            <p className="text-xs text-text-muted">Aramayı değiştirebilir veya yeni bir öğrenci ekleyebilirsiniz.</p>
          </div>
        )}

        {/* Add Student dashed button */}
        <button 
          onClick={handleOpenAddModal}
          className="w-full py-4 border border-dashed border-border hover:border-primary/50 hover:bg-surface-card/30 rounded-2xl text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
        >
          <UserPlus size={16} />
          <span>+ Yeni Öğrenci Ekle</span>
        </button>

        {/* Exam Results Section */}
        <div className="pt-6 border-t border-border/60">
          <ExamResultsSection />
        </div>
      </div>

      {/* --- ADD STUDENT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setActiveModal(null); }} />
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <UserPlus className="text-primary w-5 h-5" />
                <span>Yeni Öğrenci Ekle</span>
              </h3>
              <button onClick={() => { setShowAddModal(false); setActiveModal(null); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4 overflow-y-auto flex-1">

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ ADI SOYADI</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Eren Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">TELEFON NUMARASI</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Örn: 5435269142"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SINIF / SEVİYE</label>
                  <select 
                    value={normalizeGrade(grade)}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary cursor-pointer"
                  >
                    <option value="5. Sınıf">5. Sınıf</option>
                    <option value="6. Sınıf">6. Sınıf</option>
                    <option value="7. Sınıf">7. Sınıf</option>
                    <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                    <option value="9. Sınıf">9. Sınıf</option>
                    <option value="10. Sınıf">10. Sınıf</option>
                    <option value="11. Sınıf">11. Sınıf</option>
                    <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                    <option value="Mezun (YKS)">Mezun (YKS)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SAATLİK DERS ÜCRETİ</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₺</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full bg-surface-card border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold flex items-center justify-between">
                  <span>AYLIK HEDEF DERS SAATİ (OPSİYONEL)</span>
                  <span className="text-[10px] text-text-muted">Boş bırakılırsa 0 kabul edilir</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Örn: 8"
                    value={monthlyHours || ''}
                    onChange={(e) => setMonthlyHours(Number(e.target.value))}
                    className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ NOTU / DETAY</label>
                <textarea 
                  rows={3}
                  placeholder="Seviyesi, hedefleri ve dikkat edilmesi gerekenler..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10 mt-2"
              >
                Öğrenci Ekle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT MODAL --- */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary">
                Öğrenci Bilgilerini Düzenle
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditStudent} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ ADI SOYADI</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">TELEFON NUMARASI</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Örn: 5435269142"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Password field for Admin */}
              <div className="space-y-1.5">
                <label className="text-xs text-amber-400 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock size={13} />
                    <span>ÖĞRENCİ GİRİŞ ŞİFRESİ {isAdmin && '(👑 SUPER ADMIN)'}</span>
                  </span>
                </label>
                <input 
                  type="text" 
                  placeholder="Örn: murat123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-card border border-amber-500/40 text-amber-300 font-mono font-bold rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SINIF / SEVİYE</label>
                  <select 
                    value={normalizeGrade(grade)}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary cursor-pointer"
                  >
                    <option value="5. Sınıf">5. Sınıf</option>
                    <option value="6. Sınıf">6. Sınıf</option>
                    <option value="7. Sınıf">7. Sınıf</option>
                    <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                    <option value="9. Sınıf">9. Sınıf</option>
                    <option value="10. Sınıf">10. Sınıf</option>
                    <option value="11. Sınıf">11. Sınıf</option>
                    <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                    <option value="Mezun (YKS)">Mezun (YKS)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SAATLİK DERS ÜCRETİ</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₺</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full bg-surface-card border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">AYLIK HEDEF DERS SAATİ</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Örn: 8"
                    value={monthlyHours || ''}
                    onChange={(e) => setMonthlyHours(Number(e.target.value))}
                    className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ NOTU / DETAY</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Değişiklikleri Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PARENT INFO MODAL --- */}
      {showParentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowParentModal(false)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <User className="text-primary w-5 h-5" />
                <span>Veli Bilgisi Ekle / Düzenle</span>
              </h3>
              <button onClick={() => setShowParentModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveParent} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">VELİ ADI SOYADI</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Rahmi KOÇ (Baba)"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">VELİ TELEFON NUMARASI</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Örn: 5435269142"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                {selectedStudent.parentName && (
                  <button 
                    type="button"
                    onClick={() => {
                      updateStudent(selectedStudent.id, { parentName: '', parentPhone: '' });
                      setShowParentModal(false);
                    }}
                    className="flex-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Bilgileri Kaldır
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary-hover text-black font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-primary/10"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUICK LESSON SCHEDULER MODAL --- */}
      {showScheduleLessonModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowScheduleLessonModal(false)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <CalendarIcon className="text-primary w-5 h-5" />
                <span>Yeni Ders Programla</span>
              </h3>
              <button onClick={() => setShowScheduleLessonModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleLesson} className="p-6 space-y-4">
              <div className="p-3 bg-surface-card rounded-xl border border-border text-center">
                <span className="text-xs text-text-muted block uppercase font-bold mb-0.5">ÖĞRENCİ</span>
                <span className="font-bold text-sm text-text-primary">{selectedStudent.name} ({selectedStudent.grade})</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">TARIH</label>
                  <input 
                    type="date" 
                    required
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SAAT</label>
                  <input 
                    type="time" 
                    required
                    value={lessonTime}
                    onChange={(e) => setLessonTime(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SÜRE (DAKİKA)</label>
                  <select 
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  >
                    <option value={40}>40 dk</option>
                    <option value={60}>60 dk</option>
                    <option value={80}>80 dk</option>
                    <option value={90}>90 dk</option>
                    <option value={120}>120 dk</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">DERS ÜCRETİ</label>
                  <div className="bg-surface-card border border-border rounded-xl px-3 py-2 text-sm text-text-secondary font-semibold">
                    {formatCurrency(selectedStudent.hourlyRate)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">KONU / NOTLAR</label>
                <input 
                  type="text"
                  placeholder="Örn: Denklem Çözümü"
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Ders Programına Ekle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
