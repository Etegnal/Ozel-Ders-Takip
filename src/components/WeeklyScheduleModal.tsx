import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  BookOpen, 
  Clock, 
  Bot
} from 'lucide-react';


interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyScheduleModal: React.FC<WeeklyScheduleModalProps> = ({ isOpen, onClose }) => {
  const { 
    lessons, 
    homeworks, 
    userRole, 
    activeStudent, 
    activeTeacher 
  } = useApp();

  if (!isOpen) return null;

  // Date Range Calculation (Next 7 days: Today to Today+6)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const formatISO = (d: Date) => d.toISOString().split('T')[0];

  // Filter lessons & homeworks inside this week
  const filteredLessons = lessons.filter(l => {
    const lDate = new Date(l.date);
    const dateStr = formatISO(lDate);
    const todayStr = formatISO(today);
    const endStr = formatISO(sevenDaysLater);
    
    // Match range
    const inRange = dateStr >= todayStr && dateStr < endStr;
    const isScheduled = l.status === 'scheduled';
    const isForUser = userRole === 'student' ? l.studentId === activeStudent?.id : true;
    return inRange && isScheduled && isForUser;
  }).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const filteredHomeworks = homeworks.filter(h => {
    const hDate = new Date(h.dueDate);
    const dateStr = formatISO(hDate);
    const todayStr = formatISO(today);
    const endStr = formatISO(sevenDaysLater);
    
    const inRange = dateStr >= todayStr && dateStr < endStr;
    const isPending = h.status === 'pending';
    const isForUser = userRole === 'student' ? h.studentId === activeStudent?.id : true;
    return inRange && isPending && isForUser;
  }).sort((a, b) => {
    const dateCompare = a.dueDate.localeCompare(b.dueDate);
    if (dateCompare !== 0) return dateCompare;
    return a.dueTime.localeCompare(b.dueTime);
  });

  // Group weekly plan by day name
  const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const planByDay: { [key: string]: { lessons: typeof lessons; homeworks: typeof homeworks } } = {};

  // Initialize next 7 days in order
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dateStr = formatISO(targetDate);
    planByDay[dateStr] = { lessons: [], homeworks: [] };
  }

  // Populate
  filteredLessons.forEach(l => {
    if (planByDay[l.date]) {
      planByDay[l.date].lessons.push(l);
    }
  });

  filteredHomeworks.forEach(h => {
    if (planByDay[h.dueDate]) {
      planByDay[h.dueDate].homeworks.push(h);
    }
  });

  // Coach Bot Text Generators
  const generateTeacherCoachText = () => {
    if (filteredLessons.length === 0 && filteredHomeworks.length === 0) {
      return `Merhaba Öğretmenim! 🤖 Bu hafta planınızda kayıtlı herhangi bir özel ders veya bekleyen ödev bulunmuyor. Kendinize zaman ayırabilir veya öğrencilerinize yeni dersler planlayabilirsiniz. Keyifli bir hafta geçirmeniz dileğiyle!`;
    }

    const lessonCount = filteredLessons.length;
    const homeworkCount = filteredHomeworks.length;
    
    // Group lessons by day to find busiest day
    const dayCounts: { [key: string]: number } = {};
    filteredLessons.forEach(l => {
      const dayName = daysOfWeek[new Date(l.date).getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    let busiestDay = '';
    let maxLessons = 0;
    Object.keys(dayCounts).forEach(day => {
      if (dayCounts[day] > maxLessons) {
        maxLessons = dayCounts[day];
        busiestDay = day;
      }
    });

    let text = `Merhaba ${activeTeacher?.name || 'Öğretmenim'}! 🤖 Bu hafta planınızda **${lessonCount} ders** ve teslim tarihi yaklaşan **${homeworkCount} ödev** bulunuyor. `;
    
    if (busiestDay) {
      text += `Haftanın en yoğun günü **${busiestDay}** günü görünüyor (toplam ${maxLessons} ders). `;
    }

    const uniqueStudents = Array.from(new Set(filteredLessons.map(l => l.studentName)));
    if (uniqueStudents.length > 0) {
      text += `Bu hafta sırasıyla **${uniqueStudents.slice(0, 3).join(', ')}** ${uniqueStudents.length > 3 ? 've diğer' : ''} öğrencilerinizle dersleriniz var. `;
    }

    if (homeworkCount > 0) {
      text += `Ödevlerin takibini yapmayı ve zamanı geldiğinde değerlendirmeyi unutmayın. `;
    }

    text += `Çalışmalarınızda kolaylıklar ve başarılar dilerim, harika bir hafta geçirin! ✨`;
    return text;
  };

  const generateStudentCoachText = () => {
    if (filteredLessons.length === 0 && filteredHomeworks.length === 0) {
      return `Merhaba ${activeStudent?.name || 'Öğrencim'}! 🤖 Bu hafta senin için planlanmış herhangi bir özel ders saati veya teslim etmen gereken ödev bulunmuyor. Konuları tekrar etmek ve eksiklerini kapatmak için harika bir fırsat! Başarılar dilerim.`;
    }

    const lessonCount = filteredLessons.length;
    const homeworkCount = filteredHomeworks.length;

    let text = `Merhaba ${activeStudent?.name || 'Öğrencim'}! 🤖 Bu hafta senin için **${lessonCount} ders saati** planlanmış ve yapılması gereken **${homeworkCount} ödevin** bulunuyor. `;

    if (lessonCount > 0) {
      const nextL = filteredLessons[0];
      const dayName = daysOfWeek[new Date(nextL.date).getDay()];
      text += `İlk dersin **${dayName} günü (${nextL.startTime})** başlayacak, hazırlıklı olmayı unutma! `;
    }

    if (homeworkCount > 0) {
      const nextH = filteredHomeworks[0];
      text += `Teslim etmen gereken ilk ödev: **"${nextH.title}"**. Ödevlerini son teslim tarihlerinden önce tamamlayarak öğretmenine göndermeye gayret et. `;
    }

    text += `Planlı ve düzenli çalışarak bu haftayı çok verimli geçirebilirsin. Başarılar dilerim! 🚀`;
    return text;
  };

  const coachBotText = userRole === 'student' ? generateStudentCoachText() : generateTeacherCoachText();

  // Render markdown-like bold inside the paragraph
  const formatCoachText = (rawText: string) => {
    const parts = rawText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-primary">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Wrapper */}
      <div className="bg-surface border border-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card flex-shrink-0">
          <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
            <Calendar className="text-primary w-5 h-5" />
            <span>Haftalık Program Takip Paneli</span>
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Coach Bot AI Summary */}
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-36 h-36 bg-primary/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                <Bot size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                  <span>Coach Yapay Zeka Danışmanı</span>
                  <span className="bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">BOT</span>
                </h4>
                <p className="text-[10px] text-text-muted">Haftalık Durum Analiz Raporu</p>
              </div>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              {formatCoachText(coachBotText)}
            </p>
          </div>

          {/* Weekly Day-by-Day Schedule List */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} />
              <span>7 Günlük Takvim Detayı</span>
            </h4>
            
            <div className="space-y-3">
              {Object.keys(planByDay).map(dateStr => {
                const dayPlan = planByDay[dateStr];
                const dayLabel = Object.keys(planByDay).indexOf(dateStr) === 0 ? 'Bugün' :
                                Object.keys(planByDay).indexOf(dateStr) === 1 ? 'Yarın' : null;

                const hasLessons = dayPlan.lessons.length > 0;
                const hasHomeworks = dayPlan.homeworks.length > 0;

                const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                const dayName = days[new Date(dateStr).getDay()];

                return (
                  <div 
                    key={dateStr}
                    className={`border border-border/50 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                      hasLessons || hasHomeworks 
                        ? 'bg-surface-card border-l-4 border-l-primary' 
                        : 'bg-surface-card/30 opacity-70'
                    }`}
                  >
                    {/* Day Title */}
                    <div className="sm:w-1/4 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-text-primary">
                          {new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-xs text-text-secondary font-semibold">
                          {dayName}
                        </span>
                      </div>
                      {dayLabel && (
                        <span className="inline-block bg-primary/20 text-primary border border-primary/20 text-[9px] px-1.5 py-0.5 rounded font-bold mt-1">
                          {dayLabel.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Day Contents */}
                    <div className="flex-1 space-y-3">
                      {/* Lessons List */}
                      {hasLessons && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={10} />
                            <span>Özel Dersler ({dayPlan.lessons.length})</span>
                          </p>
                          <div className="space-y-1.5">
                            {dayPlan.lessons.map(l => (
                              <div key={l.id} className="bg-background/80 border border-border/40 p-2.5 rounded-lg text-xs flex items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-text-primary flex items-center gap-1.5">
                                    <span>{l.studentName}</span>
                                    <span className="text-text-muted font-normal">({l.startTime})</span>
                                  </div>
                                  <p className="text-[10px] text-text-secondary">Branş Dersi · {l.durationMinutes} Dakika</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Homeworks List */}
                      {hasHomeworks && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen size={10} />
                            <span>Ödev Teslimleri ({dayPlan.homeworks.length})</span>
                          </p>
                          <div className="space-y-1.5">
                            {dayPlan.homeworks.map(h => (
                              <div key={h.id} className="bg-background/80 border border-border/40 p-2.5 rounded-lg text-xs flex flex-col gap-0.5">
                                <div className="font-bold text-text-primary flex items-center justify-between">
                                  <span>{h.title}</span>
                                  <span className="text-[10px] text-text-muted font-normal">({h.dueTime})</span>
                                </div>
                                <p className="text-[10px] text-text-secondary truncate">Öğrenci: {h.studentName} · {h.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasLessons && !hasHomeworks && (
                        <span className="text-xs text-text-muted italic block pt-1">
                          Bugün için planlanmış ders veya ödev bulunmuyor.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
