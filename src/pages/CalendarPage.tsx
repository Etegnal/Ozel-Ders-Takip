import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatReadableDate } from '../utils/helpers';

export const CalendarPage: React.FC = () => {
  const { 
    lessons, 
    students, 
    addLesson, 
    updateLesson, 
    deleteLesson,
    activeModal,
    setActiveModal
  } = useApp();

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 25)); // Initialize around July 2026 to show mock data

  // Local state for view/edit popover
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Lesson form state
  const [studentId, setStudentId] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [lessonTime, setLessonTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');

  // Detect Topbar "+" click (via Context activeModal)
  useEffect(() => {
    if (activeModal === 'lesson') {
      handleOpenAddModal();
    }
  }, [activeModal]);

  const handleOpenAddModal = (dateStr?: string) => {
    setStudentId(students[0]?.id || '');
    setLessonDate(dateStr || new Date().toISOString().split('T')[0]);
    setLessonTime('18:00');
    setDurationMinutes(60);
    setNotes('');
    setActiveModal('lesson');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
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
    handleCloseModal();
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate grid days: 42 cells (previous month pad + current month + next month pad)
  const getMonthDays = (date: Date): { date: Date; isCurrentMonth: boolean }[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of current month
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Day of the week of first day (Monday start adjust: Mon=0, Tue=1 ... Sun=6)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6; // Sunday becomes 6

    // Previous month total days
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    // Current month total days
    const currentMonthLastDate = new Date(year, month + 1, 0).getDate();

    const days = [];

    // 1. Padding from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // 2. Days of current month
    for (let i = 1; i <= currentMonthLastDate; i++) {
      const currDate = new Date(year, month, i);
      days.push({ date: currDate, isCurrentMonth: true });
    }

    // 3. Padding from next month (fill up to multiples of 7, usually 35 or 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = getMonthDays(currentDate);
  const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getLessonsForDate = (dateStr: string) => {
    return lessons.filter(l => l.date === dateStr);
  };

  const formatDateString = (d: Date): string => {
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  const handleLessonBubbleClick = (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation(); // Avoid triggering day cell click
    setSelectedLesson(lesson);
  };

  return (
    <div className="space-y-6">
      {/* Month Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card/40 p-4 border border-border/80 rounded-2xl">
        <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={prevMonth}
              className="p-2 bg-surface-card border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleToday}
              className="px-3 py-2 bg-surface-card border border-border text-xs rounded-xl font-bold text-text-secondary hover:text-text-primary transition-all"
            >
              Bugün
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 bg-surface-card border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="font-bold text-sm md:text-base text-text-primary uppercase tracking-wide">
            {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <button 
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/10 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={14} />
          <span>Yeni Ders Planla</span>
        </button>
      </div>

      {/* 30-Day Monthly Calendar Grid */}
      <div className="bg-surface-card border border-border/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border bg-surface/50">
          {weekdays.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-text-secondary border-r border-border/30 last:border-r-0 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-border/40 bg-surface-card">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dateStr = formatDateString(date);
            const dayLessons = getLessonsForDate(dateStr);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div 
                key={`${dateStr}-${index}`}
                onClick={() => handleOpenAddModal(dateStr)}
                className={`min-h-[105px] p-2 flex flex-col justify-between transition-all group relative cursor-pointer hover:bg-surface-hover/30 border-r border-b border-border/20 ${
                  !isCurrentMonth ? 'bg-surface/10 opacity-40' : ''
                } ${isToday ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                {/* Cell Header: Day Number */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold font-sans rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday 
                      ? 'bg-primary text-black font-bold glow-primary' 
                      : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                  }`}>
                    {date.getDate()}
                  </span>
                  
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-muted hover:text-text-primary">
                    + Ekle
                  </span>
                </div>

                {/* Cell Content: Day's Lessons */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[70px] pr-0.5 scrollbar-thin">
                  {dayLessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      onClick={(e) => handleLessonBubbleClick(e, lesson)}
                      className={`px-2 py-0.5 rounded-lg border text-[9px] font-medium truncate flex items-center justify-between transition-all hover:scale-[1.02] ${
                        lesson.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : lesson.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      <span className="truncate flex-1 font-semibold">{lesson.studentName}</span>
                      <span className="text-[8px] opacity-70 ml-1 flex-shrink-0">{lesson.startTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <BookOpen className="text-primary w-4.5 h-4.5" />
          <span>Aylık Ders Yönetim Rehberi</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Takvimdeki ders kutucuklarına tıklayarak detayları görebilir, tamamlandı ya da iptal durumunu güncelleyebilirsiniz. Ders tamamlandığında ücret otomatik olarak öğrencinin borç bakiyesine eklenir. Boş gün kutucuklarına tıklayarak doğrudan o güne ders programlayabilirsiniz.
        </p>
      </div>

      {/* --- LESSON DETAIL POPOVER MODAL --- */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedLesson(null)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Clock className="text-primary w-5 h-5" />
                <span>Ders Detayları</span>
              </h3>
              <button onClick={() => setSelectedLesson(null)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-text-secondary">Öğrenci</span>
                  <span className="text-sm font-bold text-text-primary">{selectedLesson.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-text-secondary">Tarih / Saat</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {formatReadableDate(selectedLesson.date)}, {selectedLesson.startTime}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-text-secondary">Süre</span>
                  <span className="text-sm font-semibold text-text-primary">{selectedLesson.durationMinutes} dakika</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-text-secondary">Ders Ücreti</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(selectedLesson.rate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-text-secondary">Durum</span>
                  <span className="text-sm font-bold">
                    {selectedLesson.status === 'completed' && <span className="text-emerald-400">Tamamlandı</span>}
                    {selectedLesson.status === 'cancelled' && <span className="text-red-400">İptal Edildi</span>}
                    {selectedLesson.status === 'scheduled' && <span className="text-amber-400">Planlandı</span>}
                  </span>
                </div>
                {selectedLesson.notes && (
                  <div className="bg-surface-card p-3 rounded-xl border border-border text-xs text-text-secondary italic">
                    {selectedLesson.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {selectedLesson.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => {
                        updateLesson(selectedLesson.id, { status: 'completed' });
                        setSelectedLesson(null);
                      }}
                      className="flex-1 py-2.5 bg-emerald-500 text-black hover:bg-emerald-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                    >
                      <Check size={14} />
                      <span>Tamamla</span>
                    </button>
                    <button 
                      onClick={() => {
                        updateLesson(selectedLesson.id, { status: 'cancelled' });
                        setSelectedLesson(null);
                      }}
                      className="flex-1 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <X size={14} />
                      <span>İptal Et</span>
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => {
                    if (confirm('Bu ders planını silmek istiyor musunuz?')) {
                      deleteLesson(selectedLesson.id);
                      setSelectedLesson(null);
                    }
                  }}
                  className="py-2.5 px-3 bg-surface-card border border-border text-text-muted hover:text-red-400 rounded-xl transition-all"
                  title="Dersi Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD LESSON SCHEDULE MODAL (Triggered by Local or Global Topbar) --- */}
      {activeModal === 'lesson' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <CalendarIcon className="text-primary w-5 h-5" />
                <span>Yeni Ders Planla</span>
              </h3>
              <button onClick={handleCloseModal} className="text-text-muted hover:text-text-primary transition-colors">
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
