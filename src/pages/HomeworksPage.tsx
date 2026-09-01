import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Homework } from '../types';
import { 
  BookOpen, 
  Plus, 
  Copy, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  MessageSquare,
  X,
  Clock,
  Award
} from 'lucide-react';
import { formatReadableDate, getWhatsAppLink, getHomeworkTemplate, getTodayDateString } from '../utils/helpers';

export const HomeworksPage: React.FC = () => {
  const { 
    homeworks, 
    students, 
    addHomework, 
    updateHomework, 
    deleteHomework,
    activeModal,
    setActiveModal,
    activeTeacher
  } = useApp();

  // Page level states
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'evaluated'>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'sent' | 'library'>('sent');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // Detect Topbar "+" click (via Context activeModal)
  useEffect(() => {
    if (activeModal === 'homework') {
      handleOpenAddModal();
    }
  }, [activeModal]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  
  // Evaluation state
  const [evaluationText, setEvaluationText] = useState('Yetersiz AI');

  const handleOpenAddModal = () => {
    setStudentId(students[0]?.id || '');
    setTitle('');
    setDescription('');
    setDueDate(getTodayDateString());
    setDueTime('23:59');
    setAttachmentUrl('');
    setAttachmentName('');
    setShowAddModal(true);
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 600;
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX) {
            h *= MAX / w;
            w = MAX;
          } else if (h > MAX) {
            w *= MAX / h;
            h = MAX;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          setAttachmentUrl(canvas.toDataURL('image/jpeg', 0.5));
        };
      } else {
        setAttachmentUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === studentId);
    if (!student || !title.trim()) return;

    addHomework({
      studentId: student.id,
      studentName: student.name,
      title,
      description,
      dueDate,
      dueTime,
      status: 'pending',
      attachmentUrl,
      attachmentName
    });

    setShowAddModal(false);
    setActiveModal(null);
  };

  const handleOpenEvalModal = (hw: Homework) => {
    setSelectedHomework(hw);
    setEvaluationText(hw.evaluation || 'Yetersiz AI');
    setShowEvalModal(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomework) return;
    updateHomework(selectedHomework.id, {
      status: 'evaluated',
      evaluation: evaluationText
    });
    setShowEvalModal(false);
  };

  const handleCopyText = (hw: Homework) => {
    const teacherName = activeTeacher ? activeTeacher.name : 'Coach';
    const text = getHomeworkTemplate(hw.studentName, hw.title, hw.dueDate, hw.dueTime, teacherName);
    navigator.clipboard.writeText(text);
    alert('Ödev mesaj şablonu kopyalandı!');
  };

  const getWhatsAppHref = (hw: Homework) => {
    const student = students.find(s => s.id === hw.studentId);
    const phone = student ? student.phone : '';
    const teacherName = activeTeacher ? activeTeacher.name : 'Coach';
    const text = getHomeworkTemplate(hw.studentName, hw.title, hw.dueDate, hw.dueTime, teacherName);
    return getWhatsAppLink(phone, text);
  };

  // Filter logic
  const filteredHomeworks = homeworks.filter(hw => {
    const matchesStudent = selectedStudentFilter === 'all' || hw.studentId === selectedStudentFilter;
    const matchesTab = activeTab === 'all' || hw.status === activeTab;
    return matchesStudent && matchesTab;
  });

  const getStatusBadge = (status: Homework['status'], evaluation?: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"><Clock size={12} /><span>Bekliyor</span></span>;
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"><CheckCircle size={12} /><span>Teslim Edildi</span></span>;
      case 'overdue':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"><AlertCircle size={12} /><span>Gecikmiş</span></span>;
      case 'evaluated':
        return (
          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
            😒 <span>{evaluation || 'Değerlendirildi'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card/30 p-4 border border-border/80 rounded-2xl">
        {/* Toggle Mode Sent/Library */}
        <div className="bg-surface-card border border-border p-1 rounded-xl flex items-center gap-1 self-start">
          <button
            onClick={() => setViewMode('sent')}
            className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'sent'
                ? 'bg-primary text-black shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Send size={13} />
            <span>Gönderilenler</span>
          </button>
          <button
            onClick={() => setViewMode('library')}
            className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'library'
                ? 'bg-primary text-black shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={13} />
            <span>Kütüphane</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="bg-surface-card border border-border p-1 rounded-xl flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
            {(['all', 'pending', 'completed', 'overdue', 'evaluated'] as const).map(tab => {
              const tabLabels = {
                all: 'Tümü',
                pending: 'Bekliyor',
                completed: 'Teslim Edildi',
                overdue: 'Gecikmiş',
                evaluated: 'Değerlendirildi'
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize flex-shrink-0 whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-surface-hover text-text-primary font-semibold border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>

          {/* Student Filter dropdown */}
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="bg-surface-card border border-border rounded-xl text-xs px-3 py-2 focus:outline-none text-text-primary"
          >
            <option value="all">Tüm Öğrenciler</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Create Homework */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            <Plus size={14} />
            <span>Yeni Ödev</span>
          </button>
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-4">
        {filteredHomeworks.length > 0 ? (
          filteredHomeworks.map((hw) => (
            <div 
              key={hw.id}
              className="bg-surface-card border border-border/60 rounded-2xl p-5 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group border-l-4 border-l-primary"
            >
              <div className="flex items-start gap-4">
                {/* Initials circle */}
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary border border-primary/20 flex-shrink-0 text-sm">
                  {hw.studentName.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">{hw.studentName}</span>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                      Optik Test
                    </span>
                  </div>
                  
                  {/* Title & Description */}
                  <h4 className="text-base font-bold text-text-primary">{hw.title}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2 max-w-xl">{hw.description}</p>
                  
                  {hw.attachmentUrl && (
                    <div className="pt-1">
                      {hw.attachmentUrl.startsWith('data:image/') ? (
                        <a href={hw.attachmentUrl} target="_blank" rel="noreferrer" className="inline-block">
                          <img src={hw.attachmentUrl} alt="Ödev Görseli" className="h-16 w-24 object-cover rounded-lg border border-border/80 hover:scale-105 transition-transform" />
                        </a>
                      ) : (
                        <a href={hw.attachmentUrl} download={hw.attachmentName || 'odev-dosyasi'} className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                          📎 {hw.attachmentName || 'Ödev Dosyasını İndir'}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Due Date details */}
                  <div className="text-xs text-text-muted flex items-center gap-1.5 pt-1">
                    <Clock size={12} />
                    <span>Teslim Tarihi: {formatReadableDate(hw.dueDate)}, {hw.dueTime}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Status */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                {/* Static Status indicator badge */}
                <div>
                  {getStatusBadge(hw.status, hw.evaluation)}
                </div>

                {/* Quick actions row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp Action Button */}
                  <a 
                    href={getWhatsAppHref(hw)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-2 shadow-md shadow-emerald-900/30 hover:shadow-emerald-600/20"
                    title="WhatsApp Web Üzerinden Ödevi Mesaj At"
                  >
                    <MessageSquare size={15} />
                    <span>WhatsApp'a Gönder</span>
                  </a>

                  {/* Copy WhatsApp template text */}
                  <button 
                    onClick={() => handleCopyText(hw)}
                    className="px-3 py-2 bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border/80 rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5"
                    title="Mesaj Şablonunu Kopyala"
                  >
                    <Copy size={14} />
                    <span className="hidden sm:inline">Kopyala</span>
                  </button>

                  {/* Evaluate trigger */}
                  <button 
                    onClick={() => handleOpenEvalModal(hw)}
                    className="px-3 py-2 bg-surface hover:bg-purple-500/20 text-purple-300 border border-border/80 hover:border-purple-500/40 rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5"
                    title="Ödevi Değerlendir"
                  >
                    <Award size={14} />
                    <span className="hidden sm:inline">Değerlendir</span>
                  </button>

                  {/* Delete homework */}
                  <button 
                    onClick={() => {
                      if (confirm('Bu ödevi silmek istiyor musunuz?')) {
                        deleteHomework(hw.id);
                      }
                    }}
                    className="p-2 bg-surface hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-border/80 hover:border-red-500/30 rounded-xl transition-all"
                    title="Ödevi Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface-card border border-border border-dashed rounded-2xl text-text-secondary space-y-2">
            <BookOpen className="mx-auto w-10 h-10 text-text-muted" />
            <p className="font-semibold text-sm">Gönderilen ödev bulunamadı</p>
            <p className="text-xs text-text-muted">Aramayı veya filtreleri değiştirerek yeniden deneyebilirsiniz.</p>
          </div>
        )}
      </div>

      {/* --- ADD HOMEWORK MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setActiveModal(null); }} />
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <BookOpen className="text-primary w-5 h-5" />
                <span>Yeni Ödev Tanımla</span>
              </h3>
              <button onClick={() => { setShowAddModal(false); setActiveModal(null); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddHomework} className="p-6 space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖDEV BAŞLIĞI</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: test veya Matematik Sayfa 20"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖDEV AÇIKLAMASI</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Yapılması gereken adımlar, soru sayısı ve notlar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">TESLİM TARİHİ</label>
                  <input 
                    type="date" 
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-semibold">TESLİM SAATİ</label>
                  <input 
                    type="time" 
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-semibold">ÖDEV GÖRSELİ / DOSYASI (OPSİYONEL)</label>
                <div className="border border-dashed border-border rounded-xl p-3 bg-surface-card text-center relative cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileAttachment}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {attachmentName ? (
                    <span className="text-xs font-bold text-primary truncate block">
                      📎 {attachmentName}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">
                      📷 Fotoğraf Çek veya PDF Ekle
                    </span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Ödev Gönder & WhatsApp Mesajı Aç
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EVALUATE HOMEWORK MODAL --- */}
      {showEvalModal && selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowEvalModal(false)} />
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Award className="text-primary w-5 h-5" />
                <span>Ödev Değerlendirme</span>
              </h3>
              <button onClick={() => setShowEvalModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEvaluation} className="p-6 space-y-4">
              <div className="text-center p-3 bg-surface-card rounded-xl border border-border">
                <span className="text-xs text-text-muted block font-semibold mb-0.5">ÖĞRENCİ VE ÖDEV</span>
                <span className="font-bold text-sm text-text-primary block">{selectedHomework.studentName}</span>
                <span className="text-xs text-text-secondary block font-mono">{selectedHomework.title}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary font-semibold">DEĞERLENDİRME DURUMU / EMOJİ ETİKETİ</label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setEvaluationText('Yetersiz AI')}
                    className={`py-2 px-3 text-xs border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      evaluationText === 'Yetersiz AI' 
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500' 
                        : 'bg-surface-card border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    😒 <span>Yetersiz AI</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEvaluationText('Eksik / Geliştirilmeli')}
                    className={`py-2 px-3 text-xs border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      evaluationText === 'Eksik / Geliştirilmeli' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500' 
                        : 'bg-surface-card border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    ✍️ <span>Geliştirilmeli</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEvaluationText('Tamamlandı')}
                    className={`py-2 px-3 text-xs border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      evaluationText === 'Tamamlandı' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' 
                        : 'bg-surface-card border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    ✅ <span>Tamamlandı</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEvaluationText('Pek İyi / Kusursuz')}
                    className={`py-2 px-3 text-xs border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      evaluationText === 'Pek İyi / Kusursuz' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500' 
                        : 'bg-surface-card border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    🏆 <span>Kusursuz</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs text-text-secondary font-semibold">ÖZEL ETİKET YAZIN</label>
                  <input 
                    type="text" 
                    value={evaluationText}
                    onChange={(e) => setEvaluationText(e.target.value)}
                    className="w-full bg-surface-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-text-primary"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/10 mt-2"
              >
                Değerlendirmeyi Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
