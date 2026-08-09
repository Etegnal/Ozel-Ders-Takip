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
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, getWhatsAppLink } from '../utils/helpers';
import { Link } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const { 
    activeTeacher, 
    students, 
    lessons, 
    transactions,
    homeworks,
    updateLesson,
    setActiveModal
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

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
      <div className="bg-surface-card/90 border border-primary/30 p-6 md:p-8 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                <Sparkles size={14} />
                <span>Öğretmen Portalı</span>
              </span>
              <span className="text-xs text-text-muted">
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Hoş Geldiniz, <span className="text-primary">{activeTeacher?.name || 'Değerli Öğretmenimiz'}</span> 👋
            </h1>

            <p className="text-xs md:text-sm text-text-secondary max-w-xl">
              Branşınız: <strong className="text-text-primary">{activeTeacher?.subject || 'Özel Ders'}</strong> · Bugünkü derslerinizi, öğrencilerinizi ve kazancınızı buradan takip edebilirsiniz.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveModal('student')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Plus size={16} />
              <span>Yeni Öğrenci</span>
            </button>

            <button
              onClick={() => setActiveModal('lesson')}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-card border border-border hover:border-primary/40 text-text-primary text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <CalendarIcon size={16} className="text-primary" />
              <span>Ders Planla</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <Link to="/students" className="bg-surface-card p-5 rounded-2xl border border-border/80 hover:border-primary/40 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={22} />
            </div>
            <ArrowUpRight size={18} className="text-text-muted group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Aktif Öğrencilerim</p>
            <h3 className="text-2xl font-black text-text-primary mt-1">{activeStudentsCount} <span className="text-sm font-normal text-text-secondary">Öğrenci</span></h3>
          </div>
        </Link>

        {/* Card 2: Lesson Hours */}
        <Link to="/calendar" className="bg-surface-card p-5 rounded-2xl border border-border/80 hover:border-blue-500/40 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock size={22} />
            </div>
            <ArrowUpRight size={18} className="text-text-muted group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Toplam Ders Saati</p>
            <h3 className="text-2xl font-black text-text-primary mt-1">{totalLessonHours} <span className="text-sm font-normal text-text-secondary">Saat</span></h3>
          </div>
        </Link>

        {/* Card 3: Total Revenue */}
        <Link to="/finance" className="bg-surface-card p-5 rounded-2xl border border-border/80 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp size={22} />
            </div>
            <ArrowUpRight size={18} className="text-text-muted group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Kazanılan Toplam Meblağ</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalEarnedRevenue)}</h3>
          </div>
        </Link>

        {/* Card 4: Homeworks */}
        <Link to="/homeworks" className="bg-surface-card p-5 rounded-2xl border border-border/80 hover:border-amber-500/40 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen size={22} />
            </div>
            <ArrowUpRight size={18} className="text-text-muted group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Bekleyen Ödevler</p>
            <h3 className="text-2xl font-black text-text-primary mt-1">{pendingHomeworks.length} <span className="text-sm font-normal text-text-secondary">Ödev</span></h3>
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
                onClick={() => setActiveModal('student')}
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
