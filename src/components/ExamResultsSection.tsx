import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectScore } from '../types';
import { 
  Award, 
  Plus, 
  Trash2, 
  TrendingUp, 
  BarChart2, 
  Calendar, 
  X
} from 'lucide-react';

interface ExamResultsSectionProps {
  studentId?: string;
  isStudentView?: boolean;
}

const DEFAULT_SUBJECTS_TYT = ['Türkçe', 'Sosyal Bilgiler', 'Temel Matematik', 'Fen Bilimleri'];
const DEFAULT_SUBJECTS_AYT = ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat'];
const DEFAULT_SUBJECTS_LGS = ['Türkçe', 'Matematik', 'Fen Bilimleri', 'TC İnkılap', 'Din Kültürü', 'Yabancı Dil'];

export const ExamResultsSection: React.FC<ExamResultsSectionProps> = ({ studentId }) => {
  const { 
    examResults = [], 
    students = [], 
    activeStudent, 
    addExamResult, 
    deleteExamResult 
  } = useApp();

  const targetStudentId = studentId || activeStudent?.id;
  const filteredResults = targetStudentId 
    ? examResults.filter(e => e.studentId === targetStudentId)
    : examResults;

  // Filter state
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<'TYT' | 'AYT' | 'LGS' | 'Diğer'>('TYT');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentId, setSelectedStudentId] = useState(targetStudentId || '');
  const [notes, setNotes] = useState('');

  // Subject Scores Input
  const [subjectInputs, setSubjectInputs] = useState<{ subject: string; correct: string; incorrect: string }[]>([
    { subject: 'Matematik', correct: '0', incorrect: '0' },
    { subject: 'Fizik', correct: '0', incorrect: '0' },
    { subject: 'Kimya', correct: '0', incorrect: '0' }
  ]);

  const displayedResults = (selectedExamType === 'all' 
    ? filteredResults 
    : filteredResults.filter(e => e.examType === selectedExamType)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleTypeChange = (type: 'TYT' | 'AYT' | 'LGS' | 'Diğer') => {
    setExamType(type);
    let defaults = DEFAULT_SUBJECTS_TYT;
    if (type === 'AYT') defaults = DEFAULT_SUBJECTS_AYT;
    if (type === 'LGS') defaults = DEFAULT_SUBJECTS_LGS;

    setSubjectInputs(defaults.map(s => ({ subject: s, correct: '0', incorrect: '0' })));
  };

  const handleAddSubjectRow = () => {
    setSubjectInputs(prev => [...prev, { subject: '', correct: '0', incorrect: '0' }]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    setSubjectInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentObj = students.find(s => s.id === selectedStudentId) || activeStudent;
    if (!studentObj) {
      alert('Lütfen bir öğrenci seçin.');
      return;
    }

    const calculatedScores: SubjectScore[] = subjectInputs.map(inp => {
      const c = Number(inp.correct) || 0;
      const inc = Number(inp.incorrect) || 0;
      const net = Math.max(0, Number((c - inc / 4).toFixed(2)));
      return {
        subject: inp.subject.trim() || 'Genel',
        correct: c,
        incorrect: inc,
        net
      };
    });

    const totalNet = Math.max(0, Number(calculatedScores.reduce((sum, s) => sum + s.net, 0).toFixed(2)));

    addExamResult({
      studentId: studentObj.id,
      studentName: studentObj.name,
      examTitle: examTitle.trim(),
      examType,
      date: examDate,
      scores: calculatedScores,
      totalNet,
      notes: notes.trim()
    });

    setShowAddModal(false);
    setExamTitle('');
    setNotes('');
  };

  // Compute SVG Trend points
  const maxNet = Math.max(...displayedResults.map(r => r.totalNet), 40);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="text-primary w-5 h-5" />
            <span>Deneme Sınavı Net Takibi & Gelişim</span>
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            TYT, AYT ve LGS deneme sınavı netlerinizi kaydedin ve grafiksel gelişimini izleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Exam Type Filter */}
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="bg-surface-card border border-border text-text-primary text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">Tüm Sınav Türleri</option>
            <option value="TYT">TYT Denemeleri</option>
            <option value="AYT">AYT Denemeleri</option>
            <option value="LGS">LGS Denemeleri</option>
            <option value="Diğer">Diğer</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary-hover text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Deneme Sınavı Ekle</span>
          </button>
        </div>
      </div>

      {/* Progress Chart Visualization */}
      {displayedResults.length > 1 && (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} />
              <span>GELİŞİM GRAFİĞİ (TOPLAM NET)</span>
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Son Net: {displayedResults[displayedResults.length - 1]?.totalNet} Net
            </span>
          </div>

          <div className="h-40 w-full pt-4 flex items-end justify-between gap-2 border-b border-border/60 pb-2 relative">
            {displayedResults.map((res) => {
              const heightPercent = Math.min(100, Math.max(15, (res.totalNet / maxNet) * 100));
              return (
                <div key={res.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                    {res.examTitle}: {res.totalNet} Net ({res.date})
                  </div>
                  <span className="text-[10px] font-bold text-primary">{res.totalNet}</span>
                  <div 
                    className="w-full max-w-10 bg-gradient-to-t from-primary/40 to-primary rounded-t-lg transition-all hover:brightness-125"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] text-text-muted truncate max-w-12">{res.examTitle}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exam Results List */}
      {displayedResults.length === 0 ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-8 text-center space-y-3">
          <Award size={36} className="text-text-muted mx-auto" />
          <h4 className="text-sm font-bold text-text-primary">Henüz Girilmiş Deneme Sınavı Yok</h4>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Yukarıdaki "+ Deneme Sınavı Ekle" butonuna basarak öğrencinizin ilk deneme sınavı netlerini girebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedResults.map((exam) => (
            <div key={exam.id} className="bg-surface-card border border-border/80 rounded-2xl p-4 space-y-3 relative group hover:border-primary/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 text-[10px] font-extrabold rounded-md uppercase">
                      {exam.examType}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary">{exam.examTitle}</h4>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(exam.date).toLocaleDateString('tr-TR')}</span>
                    {!targetStudentId && <span>· {exam.studentName}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-text-muted block text-[10px]">Toplam Net</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{exam.totalNet}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Bu deneme sınavı sonucunu silmek istediğinizden emin misiniz?')) {
                        deleteExamResult(exam.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg cursor-pointer ml-1"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="bg-background/60 border border-border/50 rounded-xl p-2.5 space-y-1.5 text-xs">
                <div className="grid grid-cols-4 text-[10px] font-bold text-text-muted uppercase border-b border-border/40 pb-1">
                  <span>DERS</span>
                  <span className="text-center text-emerald-400">DOĞRU</span>
                  <span className="text-center text-red-400">YANLIŞ</span>
                  <span className="text-right text-primary">NET</span>
                </div>
                {exam.scores.map((sc: SubjectScore, i: number) => (
                  <div key={i} className="grid grid-cols-4 text-[11px] items-center">
                    <span className="font-semibold text-text-primary truncate">{sc.subject}</span>
                    <span className="text-center font-mono text-emerald-400">{sc.correct}</span>
                    <span className="text-center font-mono text-red-400">{sc.incorrect}</span>
                    <span className="text-right font-mono font-bold text-primary">{sc.net}</span>
                  </div>
                ))}
              </div>

              {exam.notes && (
                <p className="text-[11px] text-text-secondary italic border-t border-border/40 pt-2">
                  "{exam.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- ADD EXAM RESULT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card flex-shrink-0">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Award className="text-primary w-5 h-5" />
                <span>Deneme Sınavı Neti Ekle</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {!targetStudentId && (
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">ÖĞRENCİ SEÇİN</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none"
                  >
                    <option value="">-- Öğrenci Seçin --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SINAV ADI</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Özdebir TYT-3"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">SINAV TÜRÜ</label>
                  <select
                    value={examType}
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
                  >
                    <option value="TYT">TYT</option>
                    <option value="AYT">AYT</option>
                    <option value="LGS">LGS</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">SINAV TARİHİ</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
                />
              </div>

              {/* Subject Scores Entry */}
              <div className="space-y-2 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary uppercase">DERS VE NET DAĞILIMI</label>
                  <button
                    type="button"
                    onClick={handleAddSubjectRow}
                    className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Ders Ekle</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subjectInputs.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-surface-card p-2 rounded-xl border border-border/60">
                      <input
                        type="text"
                        placeholder="Ders Adı"
                        value={row.subject}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjectInputs(prev => prev.map((item, i) => i === idx ? { ...item, subject: val } : item));
                        }}
                        className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-[10px] font-bold text-emerald-400">D:</span>
                        <input
                          type="number"
                          min="0"
                          value={row.correct}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjectInputs(prev => prev.map((item, i) => i === idx ? { ...item, correct: val } : item));
                          }}
                          className="w-full bg-background border border-border rounded-lg px-1.5 py-1 text-xs text-emerald-400 font-mono font-bold text-center focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-[10px] font-bold text-red-400">Y:</span>
                        <input
                          type="number"
                          min="0"
                          value={row.incorrect}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjectInputs(prev => prev.map((item, i) => i === idx ? { ...item, incorrect: val } : item));
                          }}
                          className="w-full bg-background border border-border rounded-lg px-1.5 py-1 text-xs text-red-400 font-mono font-bold text-center focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectRow(idx)}
                        className="text-text-muted hover:text-red-400 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">NOTLAR (OPSİYONEL)</label>
                <textarea
                  placeholder="Örn: Süre yetiştirmekte zorlandım..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                Deneme Sonucunu Kaydet 🏆
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
