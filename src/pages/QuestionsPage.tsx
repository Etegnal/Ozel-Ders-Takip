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
  AlertCircle,
  RotateCcw,
  ZoomIn,
  Maximize2,
  Minimize2
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

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solved' | 'understood' | 'not_understood'>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedQuestion, setSelectedQuestion] = useState<StudentQuestion | null>(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(true);
  
  // Solution Form state
  const [solutionText, setSolutionText] = useState('');
  const [solutionImage, setSolutionImage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Lightbox & Copy States
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Drawing Canvas States
  const [solutionMethod, setSolutionMethod] = useState<'draw' | 'upload'>('draw');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [lineWidth, setLineWidth] = useState(4);
  const [drawingHistory, setDrawingHistory] = useState<string[]>([]);

  // Helpers for copy & new tab
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

  // Drawing Canvas logic
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedQuestion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = selectedQuestion.questionImage;
    img.onload = () => {
      const MAX_W = 1000;
      const MAX_H = 1000;
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > MAX_W) {
          h *= MAX_W / w;
          w = MAX_W;
        }
      } else {
        if (h > MAX_H) {
          w *= MAX_H / h;
          h = MAX_H;
        }
      }

      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setDrawingHistory([canvas.toDataURL()]);
    };
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, 
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches) {
      const touch = e.touches[0] || (e as any).changedTouches?.[0];
      if (!touch) return { x: 0, y: 0 };
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      const mouseEv = e as React.MouseEvent<HTMLCanvasElement>;
      clientX = mouseEv.clientX;
      clientY = mouseEv.clientY;
    }

    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);

    const coords = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = drawColor;

    const rect = canvas.getBoundingClientRect();
    const scaleRatio = rect.width ? canvas.width / rect.width : 1;
    ctx.lineWidth = lineWidth * scaleRatio;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawingHistory(prev => [...prev, canvas.toDataURL()]);
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawingHistory.length <= 1) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...drawingHistory];
    newHistory.pop();
    setDrawingHistory(newHistory);

    const prevState = newHistory[newHistory.length - 1];
    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const handleClear = () => {
    initCanvas();
  };

  React.useEffect(() => {
    if (showSolutionModal && solutionMethod === 'draw') {
      const timer = setTimeout(() => {
        initCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSolutionModal, solutionMethod, selectedQuestion]);

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
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = q.status === 'pending';
    else if (statusFilter === 'solved') matchesStatus = q.status === 'solved';
    else if (statusFilter === 'understood') matchesStatus = q.status === 'solved' && q.feedback === 'understood';
    else if (statusFilter === 'not_understood') matchesStatus = q.status === 'solved' && q.feedback === 'not_understood';

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

          {/* Status & Feedback Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-background border border-border/60 hover:border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary cursor-pointer font-medium"
          >
            <option value="all">Tüm Çözüm Durumları</option>
            <option value="pending">⏳ Çözüm Bekleyenler</option>
            <option value="solved">✅ Çözülenler (Tümü)</option>
            <option value="understood">😊 Öğrenci Anladı (Anlaşılanlar)</option>
            <option value="not_understood">❌ Öğrenci Anlamadı (Tekrar Çözülecekler)</option>
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
                          <strong>Çözüm Açıklaması:</strong> {selectedQuestion.solutionText}
                        </div>
                      )}

                      {selectedQuestion.solvedAt && (
                        <p className="text-[10px] text-text-muted">Çözülme Tarihi: {new Date(selectedQuestion.solvedAt).toLocaleString('tr-TR')}</p>
                      )}

                      {/* Display Feedback & Re-Solve option */}
                      <div className="border-t border-border/60 pt-4 space-y-3">
                        <h5 className="font-bold text-xs text-text-secondary">Öğrenci Geri Bildirimi & İşlemler</h5>
                        
                        {selectedQuestion.feedback ? (
                          <div className="space-y-3">
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

                            {selectedQuestion.feedback === 'not_understood' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSolutionText(selectedQuestion.solutionText || '');
                                  setSolutionImage('');
                                  setShowSolutionModal(true);
                                }}
                                className="w-full bg-primary hover:bg-primary-hover text-black text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 cursor-pointer"
                              >
                                <RotateCcw size={15} />
                                <span>Yeniden Çözüm Gönder (2. Şans) 🔄</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-surface-card/60 border border-border/50 p-3.5 rounded-xl text-xs text-text-muted italic flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>Öğrenci henüz geri bildirimde bulunmadı.</span>
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSolutionText(selectedQuestion.solutionText || '');
                                  setSolutionImage('');
                                  setShowSolutionModal(true);
                                }}
                                className="bg-surface-hover hover:bg-surface-border text-text-primary text-xs font-bold px-3.5 py-2 rounded-xl border border-border transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw size={13} />
                                <span>Çözümü Güncelle / Yeniden Gönder</span>
                              </button>
                            </div>
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => !isCompressing && setShowSolutionModal(false)} />
          <div className={`bg-surface border border-border w-full rounded-2xl overflow-hidden shadow-2xl relative z-30 transition-all duration-300 ${
            isCanvasExpanded ? 'max-w-4xl max-h-[95vh] overflow-y-auto' : 'max-w-md'
          }`}>
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
                
                let finalSolutionImage = solutionImage;
                if (solutionMethod === 'draw' && canvasRef.current) {
                  const srcCanvas = canvasRef.current;
                  const tempCanvas = document.createElement('canvas');
                  const MAX_DIM = 500;
                  let w = srcCanvas.width;
                  let h = srcCanvas.height;
                  if (w > h) {
                    if (w > MAX_DIM) {
                      h = Math.round((h * MAX_DIM) / w);
                      w = MAX_DIM;
                    }
                  } else {
                    if (h > MAX_DIM) {
                      w = Math.round((w * MAX_DIM) / h);
                      h = MAX_DIM;
                    }
                  }
                  tempCanvas.width = w;
                  tempCanvas.height = h;
                  const ctx = tempCanvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(srcCanvas, 0, 0, w, h);
                    finalSolutionImage = tempCanvas.toDataURL('image/jpeg', 0.4);
                  } else {
                    finalSolutionImage = srcCanvas.toDataURL('image/jpeg', 0.4);
                  }
                }

                if (!solutionText && !finalSolutionImage) {
                  alert('Lütfen çözüm açıklaması yazın veya çözüm resmi ekleyin.');
                  return;
                }
                
                addSolution(selectedQuestion.id, finalSolutionImage || undefined, solutionText || undefined);
                
                // Update local selectedQuestion object state for display in detail modal
                setSelectedQuestion(prev => prev ? {
                  ...prev,
                  status: 'solved',
                  solutionImage: finalSolutionImage || undefined,
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

              {/* Toggle Draw / Upload methods */}
              <div className="grid grid-cols-2 p-1.5 bg-background border border-border/70 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setSolutionMethod('draw')}
                  className={`py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    solutionMethod === 'draw'
                      ? 'bg-primary text-black shadow-md'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Soru Üzerine Çizim Yap
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionMethod('upload')}
                  className={`py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    solutionMethod === 'upload'
                      ? 'bg-primary text-black shadow-md'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Çözüm Görseli Yükle
                </button>
              </div>

              {solutionMethod === 'draw' ? (
                /* DRAWING CANVAS SECTION */
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs text-text-secondary font-semibold">ÇİZİM TAHTASI</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setZoomImage(selectedQuestion.questionImage)}
                        className="text-[10px] font-bold bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Soruyu Tam Ekran Gör / Büyüt"
                      >
                        <ZoomIn size={12} />
                        <span>Soruyu Büyüt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCanvasExpanded(!isCanvasExpanded)}
                        className="text-[10px] font-bold bg-surface-card border border-border hover:border-primary/40 px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-text-secondary hover:text-text-primary"
                        title={isCanvasExpanded ? "Normale Dön" : "Geniş Ekran Çizim Modu"}
                      >
                        {isCanvasExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                        <span>{isCanvasExpanded ? "Daralt" : "Ekranı Büyüt"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={drawingHistory.length <= 1}
                        className="text-[10px] font-bold bg-surface-card border border-border hover:border-primary/40 disabled:opacity-50 px-2 py-1 rounded-md transition-all cursor-pointer"
                      >
                        Geri Al
                      </button>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="text-[10px] font-bold bg-surface-card border border-border hover:border-red-400/40 text-text-secondary hover:text-red-400 px-2 py-1 rounded-md transition-all cursor-pointer"
                      >
                        Temizle
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-surface-card/50 p-2.5 rounded-xl border border-border/55">
                    <div className="flex items-center gap-1.5">
                      {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDrawColor(color)}
                          className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                            drawColor === color ? 'border-primary scale-110 shadow-sm' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-secondary font-bold">BOYUT:</span>
                      <input
                        type="range"
                        min="2"
                        max="15"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-20 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className={`border border-border/85 rounded-xl overflow-hidden bg-background/90 flex items-center justify-center p-2 transition-all w-full ${
                    isCanvasExpanded ? 'min-h-[480px]' : 'min-h-[300px]'
                  }`}>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{ touchAction: 'none' }}
                      className="cursor-crosshair bg-white w-full h-auto max-h-[580px] object-contain rounded-lg shadow-md border border-border/40"
                    />
                  </div>
                </div>
              ) : (
                /* FILE UPLOAD SECTION */
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">ÇÖZÜM FOTOĞRAFI</label>
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
                          {isCompressing ? 'Görsel Sıkıştırılıyor...' : 'Çözüm Fotoğrafı Yükle'}
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
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÇÖZÜM AÇIKLAMASI (OPSİYONEL)</label>
                <textarea 
                  placeholder="Çözüm adımlarını veya açıklamayı buraya yazabilirsiniz..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 text-text-primary resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isCompressing || (solutionMethod === 'upload' && !solutionText && !solutionImage)}
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCompressing ? 'Görsel Hazırlanıyor...' : 'Çözümü Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}
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
    </div>
  );
};
