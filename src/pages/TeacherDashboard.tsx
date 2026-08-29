import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Phone, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { formatCurrency, getWhatsAppLink, getTodayDateString } from '../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeTeacher, 
    students, 
    lessons, 
    transactions,
    homeworks,
    updateLesson,
    setActiveModal
  } = useApp();

  const todayStr = getTodayDateString();

  // Calculated Metrics
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  
  // Total Lesson Hours
  const totalLessonMinutes = lessons.reduce((acc, l) => acc + (l.durationMinutes || 60), 0);
  const totalLessonHours = Math.round(totalLessonMinutes / 60);

  // Total Earnings / Income Meblağ
  const lessonIncome = lessons
    .filter(l => l.status === 'completed')
    .reduce((acc, l) => acc + (l.rate || 0), 0);

  const directTransactionsIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  // Take the maximum of lesson income or transactions income, or total completed lessons
  const totalEarnedRevenue = Math.max(lessonIncome, directTransactionsIncome);

  // Today & Upcoming Lessons
  const upcomingLessons = lessons.filter(l => l.date >= todayStr).slice(0, 5);

  // Pending Homeworks
  const pendingHomeworks = homeworks.filter(h => h.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-br from-surface-card via-surface-card to-surface-card/80 border border-primary/40 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-primary/25 border border-primary/40 text-primary font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/10">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <span>Öğretmen Portalı</span>
              </span>
              <span className="text-xs text-text-primary font-medium bg-surface-hover/80 px-2.5 py-1 rounded-xl border border-border/80 shadow-xs">
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
              </span>

              {activeTeacher?.code && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeTeacher.code || '');
                    alert(`Öğretmen Eşleşme Kodunuz (${activeTeacher.code}) panoya kopyalandı! 📋`);
                  }}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-md"
                  title="Öğrencinize vermek için tıklayıp kodu kopyalayın"
                >
                  <Award size={14} />
                  <span>Eşleşme Kodunuz: <strong className="underline tracking-wider">{activeTeacher.code}</strong> 📋</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight leading-snug">
              Hoş Geldiniz, <span className="text-primary underline decoration-primary/30 underline-offset-4">{activeTeacher?.name || 'Değerli Öğretmenimiz'}</span> 👋
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary font-medium max-w-xl leading-relaxed">
              Branşınız: <strong className="text-primary font-bold">{activeTeacher?.subject || 'Özel Ders'}</strong> · Bugünkü derslerinizi, öğrencilerinizi ve kazancınızı buradan kolayca takip edebilirsiniz.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <button
              onClick={() => {
                setActiveModal('student');
                navigate('/students');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-black text-xs font-black rounded-2xl transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] cursor-pointer"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Yeni Öğrenci</span>
            </button>

            <button
              onClick={() => {
                setActiveModal('lesson');
                navigate('/calendar');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-surface-card border-2 border-border hover:border-primary/50 text-text-primary text-xs font-bold rounded-2xl transition-all hover:bg-surface-hover cursor-pointer"
            >
              <CalendarIcon size={18} className="text-primary" />
              <span>Ders Planla</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <Link to="/students" className="bg-surface-card p-5 rounded-2xl border-2 border-border/90 hover:border-primary/50 transition-all shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Users size={24} />
            </div>
            <div className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/20 transition-all">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Aktif Öğrencilerim</p>
            <h3 className="text-2xl font-black text-text-primary flex items-baseline gap-1.5">
              {activeStudentsCount} 
              <span className="text-xs font-semibold text-text-secondary">Öğrenci</span>
            </h3>
          </div>
        </Link>

        {/* Card 2: Lesson Hours */}
        <Link to="/calendar" className="bg-surface-card p-5 rounded-2xl border-2 border-border/90 hover:border-blue-500/50 transition-all shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Clock size={24} />
            </div>
            <div className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-text-secondary group-hover:text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Toplam Ders Saati</p>
            <h3 className="text-2xl font-black text-text-primary flex items-baseline gap-1.5">
              {totalLessonHours} 
              <span className="text-xs font-semibold text-text-secondary">Saat</span>
            </h3>
          </div>
        </Link>

        {/* Card 3: Total Revenue */}
        <Link to="/finance" className="bg-surface-card p-5 rounded-2xl border-2 border-border/90 hover:border-emerald-500/50 transition-all shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <TrendingUp size={24} />
            </div>
            <div className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-text-secondary group-hover:text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Kazanılan Toplam Meblağ</p>
            <h3 className="text-2xl font-black text-emerald-400">
              {formatCurrency(totalEarnedRevenue)}
            </h3>
          </div>
        </Link>

        {/* Card 4: Homeworks */}
        <Link to="/homeworks" className="bg-surface-card p-5 rounded-2xl border-2 border-border/90 hover:border-amber-500/50 transition-all shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <BookOpen size={24} />
            </div>
            <div className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-text-secondary group-hover:text-amber-400 group-hover:bg-amber-500/20 transition-all">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Bekleyen Ödevler</p>
            <h3 className="text-2xl font-black text-text-primary flex items-baseline gap-1.5">
              {pendingHomeworks.length} 
              <span className="text-xs font-semibold text-text-secondary">Ödev</span>
            </h3>
          </div>
        </Link>
      </div>

      {/* Grid: Students List & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Students Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <span>Öğrencileriniz & Ders Durumları</span>
            </h3>
            <Link to="/students" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span>Tümünü Gör ({students.length})</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => {
                const studentLessons = lessons.filter(l => l.studentId === student.id);
                const studentCompletedHours = Math.round(
                  studentLessons.filter(l => l.status === 'completed').reduce((acc, l) => acc + (l.durationMinutes || 60), 0) / 60
                );

                return (
                  <div key={student.id} className="bg-surface-card border border-border/80 rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col justify-between space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center font-bold text-base">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-sm">{student.name}</h4>
                          <span className="text-[11px] text-text-secondary bg-surface-hover px-2 py-0.5 rounded-md inline-block mt-0.5 border border-border">
                            {student.grade}
                          </span>
                        </div>
                      </div>

                      <a
                        href={getWhatsAppLink(student.phone, `Merhaba ${student.name},`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                        title="WhatsApp Mesaj Gönder"
                      >
                        <Phone size={14} />
                      </a>
                    </div>

                    {/* Stats bar */}
                    <div className="bg-background/60 p-3 rounded-xl border border-border/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-text-muted block">Saat Ücreti</span>
                        <span className="font-bold text-primary">{formatCurrency(student.hourlyRate)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Tamamlanan Ders</span>
                        <span className="font-bold text-text-primary">{studentCompletedHours} / {student.monthlyHours || 8} Saat</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-card border border-border rounded-2xl p-8 text-center space-y-3">
              <Users className="mx-auto text-text-muted w-10 h-10" />
              <h4 className="text-sm font-bold text-text-primary">Henüz Öğrenci Eklenmedi</h4>
              <p className="text-xs text-text-secondary">İlk öğrencinizi eklemek için aşağıdaki butona tıklayabilirsiniz.</p>
              <button
                onClick={() => {
                  setActiveModal('student');
                  navigate('/students');
                }}
                className="px-4 py-2 bg-primary text-black font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Öğrenci Ekle
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Today & Upcoming Lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <CalendarIcon size={20} className="text-blue-400" />
              <span>Ders Akışı</span>
            </h3>
            <Link to="/calendar" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
              <span>Takvim ({lessons.length})</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border pb-2">
              Yaklaşan Dersler
            </h4>

            {upcomingLessons.length > 0 ? (
              <div className="space-y-3">
                {upcomingLessons.map((lesson) => {
                  const isCompleted = lesson.status === 'completed';
                  return (
                    <div key={lesson.id} className="p-3 bg-background/60 border border-border/60 rounded-xl flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <h5 className="font-bold text-xs text-text-primary truncate">{lesson.studentName}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {lesson.startTime} ({lesson.durationMinutes} dk)
                          </span>
                          <span>· {lesson.date}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => updateLesson(lesson.id, { status: isCompleted ? 'scheduled' : 'completed' })}
                        className={`p-2 rounded-xl transition-all flex-shrink-0 cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-surface-hover text-text-muted hover:text-text-primary border border-border'
                        }`}
                        title={isCompleted ? 'Tamamlandı' : 'Tamamlandı İşaretle'}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-text-muted text-xs">
                Planlanmış yakın ders bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
