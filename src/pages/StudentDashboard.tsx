import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  LogOut, 
  User, 
  Award,
  Mail, 
  AlertCircle,
  School,
  HelpCircle,
  Plus,
  X,
  Phone,
  Lock,
  Save,
  Check,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { formatReadableDate, normalizeGrade } from '../utils/helpers';
import { StudentQuestion } from '../types';
import { WeeklyScheduleModal } from '../components/WeeklyScheduleModal';
import { AdminMessageModal } from '../components/AdminMessageModal';
import { normalizePhone } from '../services/storage';

import { ExamResultsSection } from '../components/ExamResultsSection';

export const StudentDashboard: React.FC = () => {
  const { 
    activeStudent, 
    activeTeacher, 
    teachers = [],
    allStudents = [],
    homeworks, 
    lessons, 
    questions = [],
    addQuestion,
    giveQuestionFeedback,
    toggleStudentHomeworkStatus, 
    logoutStudent,
    updateStudent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'homeworks' | 'schedule' | 'teacher' | 'questions' | 'exams' | 'profile'>('homeworks');
  const [showAdminMsgModal, setShowAdminMsgModal] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(activeStudent?.name || '');
  const [profilePhone, setProfilePhone] = useState(activeStudent?.phone || '');
  const [profileGrade, setProfileGrade] = useState(normalizeGrade(activeStudent?.grade));
  const [profileEmail, setProfileEmail] = useState(activeStudent?.email || '');
  const [profilePassword, setProfilePassword] = useState(activeStudent?.password || '');
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (activeStudent) {
      setProfileName(activeStudent.name || '');
      setProfilePhone(activeStudent.phone || '');
      setProfileGrade(normalizeGrade(activeStudent.grade));
      setProfileEmail(activeStudent.email || '');
      setProfilePassword(activeStudent.password || '');
    }
  }, [activeStudent]);

  // Q&A State
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<StudentQuestion | null>(null);
  
  const [lessonName, setLessonName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Weekly Schedule State
  const [showWeeklyScheduleModal, setShowWeeklyScheduleModal] = useState(false);

  // Lightbox & Copy States
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const copyImageToClipboard = async (base64Data: string) => {
    try {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert('Resim panoya kopyalandı! ✅');
    } catch (err) {
      console.error(err);
      try {
        await navigator.clipboard.writeText(base64Data);
        alert('Resim linki panoya kopyalandı! 📋');
      } catch (e) {
        alert('Resim kopyalanamadı.');
      }
    }
  };

  const openImageInNewTab = (base64Data: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="${base64Data}" style="max-width:100%; height:auto;" />`);
      newWindow.document.title = "Soru Görseli";
      newWindow.document.close();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
        setQuestionImage(dataUrl);
        setIsCompressing(false);
      };
      img.onerror = () => {
        alert('Resim yüklenirken hata oluştu.');
        setIsCompressing(false);
      };
    };
    reader.onerror = () => {
      alert('Dosya okunurken hata oluştu.');
      setIsCompressing(false);
    };
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    if (!profileName.trim() || !profilePhone.trim()) {
      setProfileMsg('Lütfen ad soyad ve telefon numarası alanlarını doldurun.');
      return;
    }
    updateStudent(activeStudent.id, {
      name: profileName.trim(),
      phone: profilePhone.trim(),
      grade: profileGrade,
      email: profileEmail.trim(),
      password: profilePassword.trim()
    });
    setProfileMsg('Profil bilgileriniz başarıyla güncellendi! ✅');
    setTimeout(() => setProfileMsg(''), 3500);
  };

  if (!activeStudent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={48} className="text-primary mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-text-primary">Öğrenci Oturumu Bulunamadı</h2>
        <p className="text-sm text-text-secondary mt-1 mb-6">Lütfen öğrenci girişi yapmak için tekrar deneyin.</p>
        <button
          onClick={logoutStudent}
          className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-xl font-bold transition-all"
        >
          Giriş Ekranına Dön
        </button>
      </div>
    );
  }

  // Match all student records that share the same normalized phone number
  const studentPhoneNorm = normalizePhone(activeStudent.phone || activeStudent.parentPhone);
  const matchedStudentRecords = (allStudents || []).filter(s => {
    const p1 = normalizePhone(s.phone);
    const p2 = normalizePhone(s.parentPhone);
    return s.id === activeStudent.id || (studentPhoneNorm && (p1 === studentPhoneNorm || p2 === studentPhoneNorm));
  });
  const matchedStudentIds = matchedStudentRecords.map(s => s.id);

  // Extract all teachers associated with these records
  const myTeachers = (teachers || []).filter(t => 
    matchedStudentRecords.some(s => s.teacherId === t.id)
  );

  // Filter student-specific data across all matched teacher records
  const myHomeworks = homeworks.filter(h => matchedStudentIds.includes(h.studentId));
  const myLessons = lessons.filter(l => matchedStudentIds.includes(l.studentId));
  const myQuestions = (questions || []).filter(q => matchedStudentIds.includes(q.studentId));

  const completedHomeworksCount = myHomeworks.filter(h => h.status === 'completed' || h.status === 'evaluated').length;
  const pendingHomeworksCount = myHomeworks.filter(h => h.status === 'pending').length;

  const nextLesson = myLessons
    .filter(l => l.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col w-full max-w-full overflow-x-hidden">
      {/* --- TOP HEADER --- */}
      <header className="bg-surface-card border-b border-border/80 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src={`${(import.meta as any).env.BASE_URL}logo.png`} className="w-full h-full object-cover" alt="Coach Logo" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base flex items-center gap-1.5 leading-tight truncate">
                <span>KOÇ</span>
                <span className="bg-primary/10 text-primary text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md font-semibold border border-primary/20">
                  ÖĞRENCİ PORTAL
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-text-secondary truncate">
                Merhaba, <span className="font-semibold text-text-primary">{activeStudent.name}</span> 👋 ({activeStudent.grade})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowAdminMsgModal(true)}
              className="flex items-center gap-1.5 bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary border border-border/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Admine Doğrudan Mesaj İlet"
            >
              <Mail size={14} className="text-primary" />
              <span className="hidden sm:inline">Admine Yaz</span>
            </button>

            <button
              onClick={() => setShowWeeklyScheduleModal(true)}
              className="flex items-center gap-1.5 bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary border border-border/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Haftalık Program"
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">Haftalık Program</span>
            </button>

            <button
              onClick={logoutStudent}
              className="flex items-center gap-1.5 bg-surface hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-border/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 flex-1 space-y-5 sm:space-y-6">

        {/* OVERVIEW STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Completed Homeworks */}
          <div className="bg-surface-card border border-border/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-text-secondary font-semibold">Tamamlanan Ödevler</p>
              <h3 className="text-base sm:text-lg font-bold text-text-primary">
                {completedHomeworksCount} <span className="text-xs text-text-muted font-normal">/ {myHomeworks.length}</span>
              </h3>
            </div>
          </div>

          {/* Pending Homeworks */}
          <div className="bg-surface-card border border-border/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-text-secondary font-semibold">Bekleyen Ödevler</p>
              <h3 className="text-base sm:text-lg font-bold text-text-primary">
                {pendingHomeworksCount} <span className="text-xs text-text-muted font-normal">ödev</span>
              </h3>
            </div>
          </div>

          {/* Next Scheduled Lesson */}
          <div className="bg-surface-card border border-border/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-text-secondary font-semibold">Sıradaki Ders</p>
              <h3 className="text-xs font-bold text-text-primary truncate">
                {nextLesson ? `${formatReadableDate(nextLesson.date)} (${nextLesson.startTime})` : 'Planlanmış ders yok'}
              </h3>
            </div>
          </div>
        </div>

        {/* RESPONSIVE NAVIGATION TABS BAR */}
        <div className="flex border-b border-border/80 gap-1.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth whitespace-nowrap">
          <button
            onClick={() => setActiveTab('homeworks')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'homeworks'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={15} />
            <span>Ödevlerim ({myHomeworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar size={15} />
            <span>Ders Takvimim ({myLessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'questions'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <HelpCircle size={15} />
            <span>Soru Çözüm ({myQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'teacher'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <User size={15} />
            <span>Öğretmenim ({myTeachers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'exams'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Award size={15} />
            <span>Deneme Netlerim</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <User size={15} className="text-primary" />
            <span>Profilim</span>
          </button>
        </div>

        {/* --- TAB CONTENT: EXAMS --- */}
        {activeTab === 'exams' && (
          <ExamResultsSection isStudentView />
        )}

        {/* --- TAB CONTENT: HOMEWORKS --- */}
        {activeTab === 'homeworks' && (
          <div className="space-y-4">
            {myHomeworks.length === 0 ? (
              <div className="bg-surface-card/40 border border-border/50 rounded-2xl p-8 sm:p-10 text-center space-y-3">
                <BookOpen size={36} className="text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-text-primary">Henüz Tanımlanmış Ödeviniz Yok</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Öğretmeniniz size yeni bir ödev verdiğinde burada listelenecektir.
                </p>
              </div>
            ) : (
              myHomeworks.map((hw) => {
                const isCompleted = hw.status === 'completed' || hw.status === 'evaluated';

                return (
                  <div 
                    key={hw.id} 
                    className={`bg-surface-card border rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                      isCompleted ? 'border-border/60 border-l-emerald-500' : 'border-border/60 border-l-primary'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-primary/10 text-primary border-primary/30'
                        }`}>
                          {isCompleted ? 'Tamamlandı' : 'Bekliyor'}
                        </span>

                        {hw.evaluation && (
                          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Award size={12} />
                            Değerlendirme: {hw.evaluation}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text-primary">{hw.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">{hw.description}</p>

                      <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                        <Clock size={13} className="text-primary" />
                        <span>Son Teslim Tarihi: <strong className="text-text-primary">{formatReadableDate(hw.dueDate)} ({hw.dueTime})</strong></span>
                      </div>
                    </div>

                    <div className="pt-2 md:pt-0 border-t md:border-t-0 border-border/50 flex items-center justify-end">
                      <button
                        onClick={() => !isCompleted && toggleStudentHomeworkStatus(hw.id)}
                        disabled={isCompleted}
                        className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-not-allowed opacity-90'
                            : 'bg-primary hover:bg-primary-hover text-black border-transparent shadow-md shadow-primary/10 cursor-pointer'
                        }`}
                      >
                        <CheckCircle size={15} />
                        <span>{isCompleted ? 'Yapıldı Olarak İşaretlendi' : 'Tamamladım Olarak İşaretle'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- TAB CONTENT: LESSON SCHEDULE --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {myLessons.length === 0 ? (
              <div className="bg-surface-card/40 border border-border/50 rounded-2xl p-8 sm:p-10 text-center space-y-3">
                <Calendar size={36} className="text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-text-primary">Planlanmış Özel Dersiniz Yok</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Öğretmeniniz yeni özel ders saati eklediğinde takviminizde görünecektir.
                </p>
              </div>
            ) : (
              myLessons.map((l) => (
                <div 
                  key={l.id} 
                  className="bg-surface-card border border-border/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 border-l-4 border-l-blue-500"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">{formatReadableDate(l.date)}</span>
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                        {l.startTime}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">Süre: {l.durationMinutes} Dakika Özel Ders</p>
                    {l.notes && <p className="text-xs text-text-muted italic pt-0.5">Not: {l.notes}</p>}
                  </div>

                  <span className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-xl border ${
                    l.status === 'completed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : l.status === 'cancelled'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {l.status === 'completed' ? 'Tamamlandı' : l.status === 'cancelled' ? 'İptal Edildi' : 'Planlandı'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- TAB CONTENT: MY TEACHER --- */}
        {activeTab === 'teacher' && (
          <div className="space-y-4 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <User className="text-primary w-4 h-4" />
                <span>ÖĞRETMENİM VE DERSLERİM</span>
              </h2>
            </div>

            {myTeachers.length === 0 ? (
              <div className="bg-surface-card border border-border/80 rounded-2xl p-8 text-center space-y-3">
                <School size={36} className="text-text-muted mx-auto" />
                <h3 className="text-sm font-bold text-text-primary">Henüz Bağlı Öğretmeniniz Bulunmuyor</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Öğretmeniniz sizi kendi panelinden eklediğinde öğretmeninizin ve derslerinizin bilgileri otomatik olarak burada görüntülenecektir.
                </p>
              </div>
            ) : (
              myTeachers.map(teacher => {
                const studentRec = matchedStudentRecords.find(s => s.teacherId === teacher.id);
                return (
                  <div key={teacher.id} className="bg-surface-card border border-border/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">{teacher.name}</h2>
                        <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                          {teacher.subject} Öğretmeni
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-background border border-border/60 p-3 rounded-xl flex items-center gap-3">
                        <Mail size={16} className="text-text-muted flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-text-muted font-semibold">E-POSTA</p>
                          <p className="text-xs font-bold text-text-primary truncate">{teacher.email || '-'}</p>
                        </div>
                      </div>

                      <div className="bg-background border border-border/60 p-3 rounded-xl flex items-center gap-3">
                        <Award size={16} className="text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-text-muted font-semibold">EŞLEŞME KODU</p>
                          <p className="text-xs font-bold text-emerald-400">{teacher.code || 'KOC-1001'}</p>
                        </div>
                      </div>
                    </div>

                    {studentRec && (
                      <div className="border-t border-border/40 pt-3 flex items-center justify-between text-xs text-text-secondary">
                        <span>Sınıf/Seviye: <strong className="text-text-primary">{studentRec.grade}</strong></span>
                        {studentRec.hourlyRate > 0 && (
                          <span>Saatlik Ücret: <strong className="text-primary">{studentRec.hourlyRate} ₺</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- TAB CONTENT: QUESTIONS (Q&A) --- */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-text-primary">Sorduğum Sorular ({myQuestions.length})</h3>
              <button
                onClick={() => {
                  setLessonName(activeTeacher ? activeTeacher.subject.split('/')[0].trim() : 'Matematik');
                  setTopicName('');
                  setQuestionImage('');
                  setQuestionText('');
                  setShowAddQuestionModal(true);
                }}
                className="bg-primary hover:bg-primary-hover text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
              >
                <Plus size={14} />
                <span>Yeni Soru Sor</span>
              </button>
            </div>

            {myQuestions.length === 0 ? (
              <div className="bg-surface-card/40 border border-border/50 rounded-2xl p-8 sm:p-10 text-center space-y-3">
                <HelpCircle size={36} className="text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-text-primary">Henüz Soru Sormadınız</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Çözemediğiniz soruların fotoğrafını çekip yükleyerek öğretmeninizden yardım isteyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="bg-surface-card border border-border/60 hover:border-primary/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          {q.lessonName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          q.status === 'solved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {q.status === 'solved' ? 'Çözüldü' : 'Bekliyor'}
                        </span>
                      </div>
                      
                      {/* Image Thumbnail */}
                      <div className="w-full h-32 bg-background border border-border/50 rounded-xl overflow-hidden relative">
                        <img src={q.questionImage} className="w-full h-full object-cover" alt="Soru" />
                      </div>
                      
                      <h4 className="font-bold text-sm text-text-primary truncate">{q.topicName}</h4>
                      {q.questionText && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{q.questionText}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-text-muted">
                      <span>{new Date(q.createdAt).toLocaleDateString('tr-TR')}</span>
                      
                      {q.status === 'solved' && (
                        <span className="flex items-center gap-1">
                          {q.feedback === 'understood' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCircle size={10} /> Anladım
                            </span>
                          ) : q.feedback === 'not_understood' ? (
                            <span className="text-red-400 font-bold flex items-center gap-0.5">
                              <X size={10} /> Anlamadım
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold">Geri Bildirim Bekliyor</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: PROFILE / ACCOUNT EDIT PAGE --- */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-surface-card border border-border/80 rounded-3xl p-5 sm:p-7 space-y-6 shadow-md">
            <div className="border-b border-border/60 pb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-text-primary">Profil ve Hesap Ayarlarım</h3>
                <p className="text-xs text-text-secondary">Kişisel bilgilerinizi, sınıf seviyenizi ve şifrenizi buradan güncelleyebilirsiniz.</p>
              </div>
            </div>

            {profileMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2 font-bold animate-pulse-subtle">
                <Check size={16} />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">AD SOYAD</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">TELEFON NUMARASI</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">SINIF / SEVİYE</label>
                  <select
                    value={normalizeGrade(profileGrade)}
                    onChange={(e) => setProfileGrade(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-xs rounded-xl px-3 py-3 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
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
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">E-POSTA ADRESİ (OPSİYONEL)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                      type="email"
                      value={profileEmail}
                      placeholder="Örn: ogrenci@ornek.com"
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-background border border-border text-text-primary text-xs rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">ŞİFRE</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                  <input
                    type="text"
                    required
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Save size={16} />
                  <span>Profil Bilgilerimi Güncelle</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>



      {/* --- ADD QUESTION MODAL --- */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !isCompressing && setShowAddQuestionModal(false)} />
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <HelpCircle className="text-primary w-5 h-5" />
                <span>Yeni Soru Sor</span>
              </h3>
              <button 
                onClick={() => !isCompressing && setShowAddQuestionModal(false)} 
                disabled={isCompressing}
                className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!questionImage) {
                  alert('Lütfen sorunun bir fotoğrafını yükleyin.');
                  return;
                }
                addQuestion(lessonName, topicName, questionImage, questionText);
                setShowAddQuestionModal(false);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">DERS</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Matematik"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">KONU</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Türev"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">SORU FOTOĞRAFI</label>
                <div className="border border-dashed border-border/80 rounded-xl p-4 text-center bg-surface-card/30 flex flex-col items-center justify-center min-h-36 relative">
                  {questionImage ? (
                    <div className="w-full h-full max-h-48 relative overflow-hidden rounded-lg border border-border">
                      <img src={questionImage} className="w-full h-full object-contain" alt="Yüklenen Soru" />
                      <button
                        type="button"
                        onClick={() => setQuestionImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black text-text-primary rounded-full transition-all border border-border/20 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full p-2">
                      {/* Option 1: Live Camera Capture */}
                      <label className="flex-1 w-full border border-primary/30 hover:border-primary/60 bg-primary/10 hover:bg-primary/20 rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 group">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform">
                          <Camera size={16} />
                        </div>
                        <span className="text-xs font-bold text-text-primary">Anında Kamera İle Çek 📸</span>
                        <span className="text-[10px] text-text-muted">Kamerayı açarak yeni fotoğraf çekin</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          disabled={isCompressing}
                          className="hidden"
                        />
                      </label>

                      {/* Option 2: Gallery / Files Selection */}
                      <label className="flex-1 w-full border border-border hover:border-text-muted bg-surface-card hover:bg-surface-hover rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 group">
                        <div className="w-8 h-8 rounded-full bg-surface-hover text-text-primary flex items-center justify-center border border-border group-hover:scale-105 transition-transform">
                          <ImageIcon size={16} />
                        </div>
                        <span className="text-xs font-bold text-text-primary">Galeriden / Dosyalardan Seç 🖼️</span>
                        <span className="text-[10px] text-text-muted">Önceden çekilmiş fotoğrafı yükleyin</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isCompressing}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">SORU AÇIKLAMASI (OPSİYONEL)</label>
                <textarea 
                  placeholder="Soruda anlamadığınız kısmı veya ek açıklamayı buraya yazabilirsiniz..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 text-text-primary resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isCompressing || !questionImage}
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCompressing ? 'Görsel Hazırlanıyor...' : 'Soruyu Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- QUESTION DETAIL MODAL --- */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedQuestion(null)} />
          <div className="bg-surface border border-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card flex-shrink-0">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <span>Soru Detayı</span>
                  <span className="text-primary">·</span>
                  <span className="text-xs font-semibold text-text-secondary">{selectedQuestion.lessonName} - {selectedQuestion.topicName}</span>
                </h3>
              </div>
              <button onClick={() => setSelectedQuestion(null)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-text-secondary uppercase tracking-wider">SORULAN SORU</h4>
                  <div className="relative group border border-border rounded-2xl overflow-hidden bg-background max-h-64 flex items-center justify-center p-2">
                    <img src={selectedQuestion.questionImage} className="max-h-60 object-contain rounded-xl" alt="Soru Resmi" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoomImage(selectedQuestion.questionImage)}
                        className="bg-surface hover:bg-primary/20 border border-border hover:border-primary/40 text-text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Büyüt
                      </button>
                      <button
                        type="button"
                        onClick={() => copyImageToClipboard(selectedQuestion.questionImage)}
                        className="bg-surface hover:bg-primary/20 border border-border hover:border-primary/40 text-text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>
                  {selectedQuestion.questionText && (
                    <div className="bg-surface-card border border-border/60 p-3.5 rounded-xl text-xs text-text-primary leading-relaxed">
                      {selectedQuestion.questionText}
                    </div>
                  )}
                  <p className="text-[10px] text-text-muted">Sorulma Tarihi: {new Date(selectedQuestion.createdAt).toLocaleString('tr-TR')}</p>
                </div>

                {/* Solution Section */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">ÖĞRETMENİN ÇÖZÜMÜ</h4>
                  
                  {selectedQuestion.status === 'solved' ? (
                    <div className="space-y-4">
                      {selectedQuestion.solutionImage && (
                        <div className="relative group border border-border rounded-2xl overflow-hidden bg-background max-h-64 flex items-center justify-center p-2">
                          <img src={selectedQuestion.solutionImage} className="max-h-60 object-contain rounded-xl" alt="Çözüm Resmi" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setZoomImage(selectedQuestion.solutionImage!)}
                              className="bg-surface hover:bg-primary/20 border border-border hover:border-primary/40 text-text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Büyüt
                            </button>
                            <button
                              type="button"
                              onClick={() => copyImageToClipboard(selectedQuestion.solutionImage!)}
                              className="bg-surface hover:bg-primary/20 border border-border hover:border-primary/40 text-text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Kopyala
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {selectedQuestion.solutionText && (
                        <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-xl text-xs text-text-primary leading-relaxed">
                          <strong>Açıklama:</strong> {selectedQuestion.solutionText}
                        </div>
                      )}

                      {selectedQuestion.solvedAt && (
                        <p className="text-[10px] text-text-muted">Çözülme Tarihi: {new Date(selectedQuestion.solvedAt).toLocaleString('tr-TR')}</p>
                      )}

                      {/* Feedback Action or Display */}
                      <div className="border-t border-border/60 pt-4 space-y-3">
                        <h5 className="font-bold text-xs text-text-secondary">Çözümü Anladınız mı?</h5>
                        
                        {selectedQuestion.feedback ? (
                          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                            selectedQuestion.feedback === 'understood'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {selectedQuestion.feedback === 'understood' ? (
                              <>
                                <CheckCircle size={16} />
                                <span>Çözümü anladığınızı belirttiniz. ✅</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} />
                                <span>Çözümü anlamadığınızı belirttiniz. ❌</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                giveQuestionFeedback(selectedQuestion.id, 'understood');
                                setSelectedQuestion(prev => prev ? { ...prev, feedback: 'understood' } : null);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/15"
                            >
                              <CheckCircle size={14} />
                              <span>Evet, Anladım</span>
                            </button>
                            <button
                              onClick={() => {
                                giveQuestionFeedback(selectedQuestion.id, 'not_understood');
                                setSelectedQuestion(prev => prev ? { ...prev, feedback: 'not_understood' } : null);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-500/15"
                            >
                              <X size={14} />
                              <span>Hayır, Anlamadım</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-card/60 border border-border/50 rounded-2xl p-6 text-center space-y-2">
                      <Clock size={24} className="text-amber-400 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-text-primary">Çözüm Bekleniyor</p>
                      <p className="text-[10px] text-text-secondary leading-normal">
                        Öğretmeniniz sorunuzu inceledikten sonra buraya çözümü yükleyecektir.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Weekly Schedule Modal */}
      <WeeklyScheduleModal
        isOpen={showWeeklyScheduleModal}
        onClose={() => setShowWeeklyScheduleModal(false)}
      />

      {/* --- LIGHTBOX (GÖRSEL BÜYÜTÜCÜ) --- */}
      {zoomImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setZoomImage(null)} />
          <div className="relative z-10 max-w-4xl max-h-[90vh] flex flex-col items-center justify-center gap-4">
            <button 
              onClick={() => setZoomImage(null)}
              className="absolute top-[-40px] right-0 text-text-primary hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold bg-surface-card px-3 py-1.5 rounded-xl border border-border/80 cursor-pointer"
            >
              <X size={14} /> Kapat
            </button>
            
            <div className="border border-border/60 rounded-2xl overflow-hidden bg-background p-2">
              <img src={zoomImage} className="max-h-[75vh] max-w-full object-contain rounded-lg" alt="Büyütülmüş Görsel" />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => copyImageToClipboard(zoomImage)}
                className="bg-surface-card border border-border hover:border-primary/30 text-text-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                Görseli Panoya Kopyala
              </button>
              <button
                type="button"
                onClick={() => openImageInNewTab(zoomImage)}
                className="bg-primary hover:bg-primary-hover text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/10"
              >
                Yeni Sekmede Aç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Message Modal */}
      <AdminMessageModal 
        isOpen={showAdminMsgModal} 
        onClose={() => setShowAdminMsgModal(false)} 
      />
    </div>
  );
};
