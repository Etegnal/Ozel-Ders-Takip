import React, { useState } from 'react';
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
  School
} from 'lucide-react';
import { formatReadableDate } from '../utils/helpers';

export const StudentDashboard: React.FC = () => {
  const { 
    activeStudent, 
    activeTeacher, 
    homeworks, 
    lessons, 
    toggleStudentHomeworkStatus, 
    logoutStudent 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'homeworks' | 'schedule' | 'teacher'>('homeworks');

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

  // Filter student-specific data
  const myHomeworks = homeworks.filter(h => h.studentId === activeStudent.id);
  const myLessons = lessons.filter(l => l.studentId === activeStudent.id);

  const completedHomeworksCount = myHomeworks.filter(h => h.status === 'completed' || h.status === 'evaluated').length;
  const pendingHomeworksCount = myHomeworks.filter(h => h.status === 'pending').length;

  const nextLesson = myLessons
    .filter(l => l.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* --- TOP HEADER --- */}
      <header className="bg-surface-card border-b border-border/80 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={`${(import.meta as any).env.BASE_URL}logo.png`} className="w-full h-full object-cover" alt="Coach Logo" />
            </div>
            <div>
              <h1 className="font-bold text-base flex items-center gap-1.5 leading-tight">
                <span>Coach</span>
                <span className="text-primary">.</span>
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-md font-semibold border border-primary/20 ml-1">
                  ÖĞRENCİ PORTAL
                </span>
              </h1>
              <p className="text-xs text-text-secondary truncate">
                Merhaba, <span className="font-semibold text-text-primary">{activeStudent.name}</span> 👋 ({activeStudent.grade})
              </p>
            </div>
          </div>

          <button
            onClick={logoutStudent}
            className="flex items-center gap-2 bg-surface hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-border/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            title="Çıkış Yap"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Çıkış Yap</span>
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1 space-y-6">

        {/* OVERVIEW STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Completed Homeworks */}
          <div className="bg-surface-card border border-border/60 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center font-bold">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-semibold">Tamamlanan Ödevler</p>
              <h3 className="text-lg font-bold text-text-primary">
                {completedHomeworksCount} <span className="text-xs text-text-muted font-normal">/ {myHomeworks.length}</span>
              </h3>
            </div>
          </div>

          {/* Pending Homeworks */}
          <div className="bg-surface-card border border-border/60 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-semibold">Bekleyen Ödevler</p>
              <h3 className="text-lg font-bold text-text-primary">
                {pendingHomeworksCount} <span className="text-xs text-text-muted font-normal">ödev</span>
              </h3>
            </div>
          </div>

          {/* Next Scheduled Lesson */}
          <div className="bg-surface-card border border-border/60 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary font-semibold">Sıradaki Ders</p>
              <h3 className="text-xs font-bold text-text-primary truncate">
                {nextLesson ? `${formatReadableDate(nextLesson.date)} (${nextLesson.startTime})` : 'Planlanmış ders yok'}
              </h3>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-border/80 gap-6">
          <button
            onClick={() => setActiveTab('homeworks')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'homeworks'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={16} />
            <span>Ödevlerim ({myHomeworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'schedule'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar size={16} />
            <span>Ders Takvimim ({myLessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'teacher'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <User size={16} />
            <span>Öğretmenim</span>
          </button>
        </div>

        {/* --- TAB CONTENT: HOMEWORKS --- */}
        {activeTab === 'homeworks' && (
          <div className="space-y-4">
            {myHomeworks.length === 0 ? (
              <div className="bg-surface-card/40 border border-border/50 rounded-2xl p-10 text-center space-y-3">
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
                    className={`bg-surface-card border rounded-2xl p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
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

                      <h3 className="text-base font-bold text-text-primary">{hw.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">{hw.description}</p>

                      <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                        <Clock size={13} className="text-primary" />
                        <span>Son Teslim Tarihi: <strong className="text-text-primary">{formatReadableDate(hw.dueDate)} ({hw.dueTime})</strong></span>
                      </div>
                    </div>

                    {/* Toggle Homework Status Button */}
                    <div className="pt-2 md:pt-0 border-t md:border-t-0 border-border/50 flex items-center justify-end">
                      <button
                        onClick={() => toggleStudentHomeworkStatus(hw.id)}
                        className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                          isCompleted
                            ? 'bg-surface hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-primary hover:bg-primary-hover text-black border-transparent shadow-md shadow-primary/10'
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
              <div className="bg-surface-card/40 border border-border/50 rounded-2xl p-10 text-center space-y-3">
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
                  className="bg-surface-card border border-border/60 rounded-2xl p-5 flex items-center justify-between gap-4 border-l-4 border-l-blue-500"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">{formatReadableDate(l.date)}</span>
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                        {l.startTime}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">Süre: {l.durationMinutes} Dakika Özel Ders</p>
                    {l.notes && <p className="text-xs text-text-muted italic pt-0.5">Not: {l.notes}</p>}
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
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
          <div className="bg-surface-card border border-border/80 rounded-3xl p-6 space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-2xl">
                {activeTeacher ? activeTeacher.name.charAt(0) : 'Ö'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">{activeTeacher ? activeTeacher.name : 'Öğretmeniniz'}</h2>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                  {activeTeacher ? activeTeacher.subject : 'Branş'} Öğretmeni
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-background border border-border/60 p-3.5 rounded-xl flex items-center gap-3">
                <Mail size={18} className="text-text-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-semibold">E-POSTA</p>
                  <p className="text-xs font-bold text-text-primary truncate">{activeTeacher ? activeTeacher.email : '-'}</p>
                </div>
              </div>

              <div className="bg-background border border-border/60 p-3.5 rounded-xl flex items-center gap-3">
                <School size={18} className="text-text-muted flex-shrink-0" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-semibold">DERS BRANŞI</p>
                  <p className="text-xs font-bold text-text-primary">{activeTeacher ? activeTeacher.subject : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
