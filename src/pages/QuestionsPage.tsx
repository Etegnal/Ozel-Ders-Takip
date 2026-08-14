import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Search, 
  Upload, 
  X, 
  Trash2, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';
import { formatReadableDate } from '../utils/helpers';
import { StudentQuestion } from '../types';

export const QuestionsPage: React.FC = () => {
  const { 
    questions = [], 
    students = [], 
    addSolution, 
    deleteQuestion 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solved'>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedQuestion, setSelectedQuestion] = useState<StudentQuestion | null>(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  
  // Solution Form state
  const [solutionText, setSolutionText] = useState('');
  const [solutionImage, setSolutionImage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Compress solution image using Canvas
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
        setSolutionImage(dataUrl);
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

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesStudent = studentFilter === 'all' || q.studentId === studentFilter;
    const matchesSearch = 
      q.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.lessonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.questionText || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesStudent && matchesSearch;
  });

  const pendingQuestionsCount = questions.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* --- HEADER TITLE --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <HelpCircle className="text-primary" />
            <span>Soru & Çözüm Havuzu</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Öğrencilerinizin yüklediği soruları görün, çözümlerini paylaşın ve anlama geri bildirimlerini takip edin.
          </p>
        </div>

        {pendingQuestionsCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <Clock size={14} className="animate-spin" />
            <span>{pendingQuestionsCount} Soru Çözüm Bekliyor</span>
          </div>
        )}
      </div>

      {/* --- FILTER CONTROL BAR --- */}
      <div className="bg-surface-card border border-border/80 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Öğrenci, ders veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/60 hover:border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary"
            />
          </div>

          {/* Student Filter */}
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="bg-background border border-border/60 hover:border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary cursor-pointer"
          >
            <option value="all">Tüm Öğrenciler</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-background border border-border/60 hover:border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary cursor-pointer"
          >
            <option value="all">Tüm Çözüm Durumları</option>
            <option value="pending">Çözüm Bekleyenler</option>
            <option value="solved">Çözülenler</option>
          </select>
        </div>
      </div>

      {/* --- QUESTIONS GRID --- */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-surface-card/40 border border-border/50 rounded-3xl p-12 text-center space-y-3">
          <HelpCircle size={44} className="text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Gösterilecek Soru Bulunamadı</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Filtrelere veya aramanıza uygun herhangi bir soru kaydı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className="bg-surface-card border border-border/60 hover:border-primary/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-2.5 py-0.5 rounded-md font-semibold">
                    {q.lessonName}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    q.status === 'solved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {q.status === 'solved' ? 'Çözüldü' : 'Çözüm Bekliyor'}
                  </span>
                </div>

                {/* Soru Thumbnail */}
                <div className="w-full h-36 bg-background border border-border/50 rounded-xl overflow-hidden relative">
                  <img src={q.questionImage} className="w-full h-full object-cover" alt="Soru Resmi" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                    <User size={10} />
                    <span>{q.studentName}</span>
                  </p>
                  <h4 className="font-bold text-sm text-text-primary truncate">{q.topicName}</h4>
                  {q.questionText && (
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{q.questionText}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-text-muted">
                <span>{formatReadableDate(q.createdAt.split('T')[0])}</span>
                
                {q.status === 'solved' && (
                  <span className="flex items-center gap-1">
                    {q.feedback === 'understood' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle size={10} /> Öğrenci Anladı
                      </span>
                    ) : q.feedback === 'not_understood' ? (
                      <span className="text-red-400 font-bold flex items-center gap-0.5">
                        <XCircle size={10} /> Öğrenci Anlamadı
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

      {/* --- QUESTION DETAIL MODAL (TEACHER) --- */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !showSolutionModal && setSelectedQuestion(null)} />
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-text-secondary uppercase tracking-wider">SORULAN SORU</h4>
                    <button
                      onClick={() => {
                        if (confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
                          deleteQuestion(selectedQuestion.id);
                          setSelectedQuestion(null);
                        }
                      }}
                      className="p-1 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      title="Soruyu Sil"
                    >
                      <Trash2 size={13} />
                      <span className="text-[10px] font-bold">Soruyu Sil</span>
                    </button>
                  </div>
                  
                  <div className="border border-border rounded-2xl overflow-hidden bg-background max-h-64 flex items-center justify-center p-2">
                    <img src={selectedQuestion.questionImage} className="max-h-60 object-contain rounded-xl" alt="Soru Resmi" />
                  </div>
                  <div className="bg-surface-card border border-border/60 p-3 rounded-xl space-y-1">
                    <p className="text-[10px] text-text-muted uppercase">ÖĞRENCİ</p>
                    <p className="text-xs font-bold text-text-primary">{selectedQuestion.studentName}</p>
                    {selectedQuestion.questionText && (
                      <p className="text-xs text-text-secondary leading-normal pt-1 border-t border-border/40 mt-1">{selectedQuestion.questionText}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted">Sorulma Tarihi: {new Date(selectedQuestion.createdAt).toLocaleString('tr-TR')}</p>
                </div>

                {/* Solution Section */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">ÇÖZÜMÜM VE DURUM</h4>
                  
                  {selectedQuestion.status === 'solved' ? (
                    <div className="space-y-4">
                      {selectedQuestion.solutionImage && (
                        <div className="border border-border rounded-2xl overflow-hidden bg-background max-h-64 flex items-center justify-center p-2">
                          <img src={selectedQuestion.solutionImage} className="max-h-60 object-contain rounded-xl" alt="Çözüm Resmi" />
                        </div>
                      )}
                      
                      {selectedQuestion.solutionText && (
                        <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-xl text-xs text-text-primary leading-relaxed">
                          <strong>Çözüm Açıklaması:</strong> {selectedQuestion.solutionText}
                        </div>
                      )}

                      {selectedQuestion.solvedAt && (
                        <p className="text-[10px] text-text-muted">Çözülme Tarihi: {new Date(selectedQuestion.solvedAt).toLocaleString('tr-TR')}</p>
                      )}

                      {/* Display Feedback */}
                      <div className="border-t border-border/60 pt-4 space-y-2">
                        <h5 className="font-bold text-xs text-text-secondary">Öğrenci Geri Bildirimi</h5>
                        
                        {selectedQuestion.feedback ? (
                          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                            selectedQuestion.feedback === 'understood'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {selectedQuestion.feedback === 'understood' ? (
                              <>
                                <CheckCircle size={16} />
                                <span>Öğrenci çözümü anladığını belirtti. ✅</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} />
                                <span>Öğrenci çözümü ANLAMADIĞINI belirtti. ❌</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="bg-surface-card/60 border border-border/50 p-3.5 rounded-xl text-xs text-text-muted italic flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>Öğrenci henüz geri bildirimde bulunmadı.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Bu soru henüz çözülmemiştir. Aşağıdaki butona basarak çözüm ekleyin.</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSolutionText('');
                          setSolutionImage('');
                          setShowSolutionModal(true);
                        }}
                        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 transition-colors"
                      >
                        <MessageSquare size={15} />
                        <span>Çözüm Ekle / Soru Çöz</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SOLUTION FORM MODAL --- */}
      {showSolutionModal && selectedQuestion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => !isCompressing && setShowSolutionModal(false)} />
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-20">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <MessageSquare className="text-primary w-5 h-5" />
                <span>Çözüm Ekle</span>
              </h3>
              <button 
                onClick={() => !isCompressing && setShowSolutionModal(false)} 
                disabled={isCompressing}
                className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!solutionText && !solutionImage) {
                  alert('Lütfen çözüm açıklaması yazın veya çözümün fotoğrafını yükleyin.');
                  return;
                }
                addSolution(selectedQuestion.id, solutionImage || undefined, solutionText || undefined);
                
                // Update local selectedQuestion object state for display in detail modal
                setSelectedQuestion(prev => prev ? {
                  ...prev,
                  status: 'solved',
                  solutionImage: solutionImage || undefined,
                  solutionText: solutionText || undefined,
                  solvedAt: new Date().toISOString()
                } : null);
                
                setShowSolutionModal(false);
              }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1">
                <p className="text-[10px] text-text-muted uppercase">SORULAN KONU</p>
                <p className="text-xs font-bold text-text-primary">{selectedQuestion.lessonName} - {selectedQuestion.topicName}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÇÖZÜM FOTOĞRAFI (OPSİYONEL)</label>
                <div className="border border-dashed border-border/80 rounded-xl p-4 text-center bg-surface-card/30 flex flex-col items-center justify-center min-h-36 relative">
                  {solutionImage ? (
                    <div className="w-full h-full max-h-48 relative overflow-hidden rounded-lg border border-border">
                      <img src={solutionImage} className="w-full h-full object-contain" alt="Çözüm Fotoğrafı" />
                      <button
                        type="button"
                        onClick={() => setSolutionImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black text-text-primary rounded-full transition-all border border-border/20 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center space-y-2 p-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Upload size={16} />
                      </div>
                      <div className="text-xs font-bold text-text-primary">
                        {isCompressing ? 'Görsel İşleniyor...' : 'Çözüm Fotoğrafı Çek / Yükle'}
                      </div>
                      <p className="text-[10px] text-text-muted">Kamera veya Galeri (PNG, JPG)</p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        disabled={isCompressing}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÇÖZÜM AÇIKLAMASI (OPSİYONEL)</label>
                <textarea 
                  placeholder="Çözüm adımlarını veya açıklamayı buraya yazabilirsiniz..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 text-text-primary resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isCompressing || (!solutionText && !solutionImage)}
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCompressing ? 'Görsel Hazırlanıyor...' : 'Çözümü Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
