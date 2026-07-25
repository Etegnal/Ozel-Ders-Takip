import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lesson } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';


export const CalendarPage: React.FC = () => {
  const { 
    lessons, 
    students, 
    addLesson, 
    updateLesson, 
    deleteLesson 
  } = useApp();

  // Calendar states
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Lesson form states
  const [studentId, setStudentId] = useState('');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonTime, setLessonTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');

  // Generate week dates based on currentDate
  const getWeekDates = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      dates.push(nextDay);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleOpenAddModal = (dateStr?: string) => {
    setStudentId(students[0]?.id || '');
    setLessonDate(dateStr || new Date().toISOString().split('T')[0]);
    setLessonTime('18:00');
    setDurationMinutes(60);
    setNotes('');
    setShowAddModal(true);
  };

  const handleAddLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    addLesson({
      studentId: student.id,
      studentName: student.name,
      date: lessonDate,
      startTime: lessonTime,
      durationMinutes,
      rate: student.hourlyRate,
      status: 'scheduled',
      notes
    });
    setShowAddModal(false);
  };

  const handleCompleteLesson = (lesson: Lesson) => {
    updateLesson(lesson.id, { status: 'completed' });
  };

  const handleCancelLesson = (lesson: Lesson) => {
    updateLesson(lesson.id, { status: 'cancelled' });
  };

  // Get lessons matching a specific date string
  const getLessonsForDate = (dateStr: string) => {
    return lessons.filter(l => l.date === dateStr);
  };

  // Render status badge inside lists
  const getLessonStatusLabel = (status: Lesson['status']) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Tamamlandı</span>;
      case 'cancelled':
        return <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">İptal Edildi</span>;
      case 'scheduled':
        return <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Planlandı</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card/40 p-4 border border-border/80 rounded-2xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevWeek}
            className="p-2 bg-surface-card border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleToday}
            className="px-4 py-2 bg-surface-card border border-border text-xs rounded-xl font-bold text-text-secondary hover:text-text-primary transition-all"
          >
            Bugün
          </button>
          <button 
            onClick={handleNextWeek}
            className="p-2 bg-surface-card border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all"
          >
            <ChevronRight size={16} />
          </button>

          <span className="font-bold text-sm text-text-primary ml-2">
            {weekDates[0].toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <button 
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/10 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={14} />
          <span>Yeni Ders Planla</span>
        </button>
      </div>

      {/* Week Grid Layout (Desktop View) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date) => {
          const dateStr = formatDateString(date);
          const dayLessons = getLessonsForDate(dateStr);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div 
              key={dateStr}
              className={`bg-surface-card border rounded-2xl p-4 min-h-[300px] flex flex-col justify-between transition-all ${
                isToday 
                  ? 'border-primary/50 bg-surface-card/70 shadow-lg shadow-primary/5' 
                  : 'border-border/60 hover:border-border'
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-border/50 pb-2.5 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">
                    {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                  </span>
                  <span className={`text-base font-bold font-sans ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                    {date.getDate()}
                  </span>
                </div>

                <button 
                  onClick={() => handleOpenAddModal(dateStr)}
                  className="p-1 hover:bg-surface-hover text-text-muted hover:text-text-primary rounded-lg transition-all"
                  title="Ders Ekle"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Day's Lessons Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-0.5">
                {dayLessons.length > 0 ? (
                  dayLessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between relative group ${
                        lesson.status === 'completed'
                          ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20'
                          : lesson.status === 'cancelled'
                          ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/20'
                          : 'bg-surface-hover/40 border-border/80 hover:border-primary/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-text-primary truncate block">
                            {lesson.studentName}
                          </span>
                          <span className="text-[9px] text-text-muted font-bold flex items-center gap-0.5 flex-shrink-0">
                            <Clock size={8} />
                            {lesson.startTime}
                          </span>
                        </div>
                        {lesson.notes && (
                          <p className="text-[10px] text-text-secondary line-clamp-1 italic">
                            {lesson.notes}
                          </p>
                        )}
                      </div>

                      {/* Action status tags or click actions */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-border/20 pt-2">
                        {getLessonStatusLabel(lesson.status)}

                        {/* Complete/Cancel controls shown on hover/active for scheduled items */}
                        {lesson.status === 'scheduled' && (
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleCompleteLesson(lesson)}
                              className="p-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md transition-all"
                              title="Tamamlandı"
                            >
                              <Check size={11} />
                            </button>
                            <button 
                              onClick={() => handleCancelLesson(lesson)}
                              className="p-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md transition-all"
                              title="İptal Et"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        )}

                        {/* Completed or Cancelled delete option */}
                        {lesson.status !== 'scheduled' && (
                          <button 
                            onClick={() => {
                              if (confirm('Bu ders kaydını programdan kaldırmak istiyor musunuz?')) {
                                deleteLesson(lesson.id);
                              }
                            }}
                            className="text-[9px] text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Kaldır
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[10px] text-text-muted italic bg-surface/10 rounded-xl border border-border/30">
                    Ders yok
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily list details view for selected day */}
      <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <BookOpen className="text-primary w-4.5 h-4.5" />
          <span>Haftalık Genel Ders Dağılımı</span>
        </h3>
        <p className="text-xs text-text-secondary">
          Derslerinizi tamamlandığında yeşil çek işaretine tıklayarak onaylayın. Bu işlem, öğrenci bakiyesine ders ücretini otomatik olarak yansıtacaktır.
        </p>
      </div>

      {/* --- ADD LESSON SCHEDULE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <CalendarIcon className="text-primary w-5 h-5" />
                <span>Yeni Ders Planla</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddLessonSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ SEÇİN</label>
                <select 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                  ))}
                </select>
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

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">DERS SÜRESİ (DAKİKA)</label>
                <select 
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                >
                  <option value={40}>40 dakika</option>
                  <option value={60}>60 dakika (1 Saat)</option>
                  <option value={80}>80 dakika</option>
                  <option value={90}>90 dakika (1.5 Saat)</option>
                  <option value={120}>120 dakika (2 Saat)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">KONU / DETAY</label>
                <input 
                  type="text"
                  placeholder="İşlenecek konu veya ders açıklaması..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Dersi Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
