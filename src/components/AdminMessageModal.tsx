import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Send, X, CheckCircle } from 'lucide-react';

interface AdminMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMessageModal: React.FC<AdminMessageModalProps> = ({ isOpen, onClose }) => {
  const { sendAdminMessage, activeTeacher, activeStudent, userRole } = useApp();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const senderName = userRole === 'student' ? activeStudent?.name : activeTeacher?.name;
  const senderRoleText = userRole === 'student' ? 'Öğrenci' : 'Öğretmen';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await sendAdminMessage(subject, message);
    setIsSubmitting(false);
    setIsSent(true);

    setTimeout(() => {
      setIsSent(false);
      setSubject('');
      setMessage('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-surface-card to-surface-card border-b border-border/60 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center flex-shrink-0 font-bold">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>📩 Admine Mesaj Gönder</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Öneri, talep veya bildirimlerinizi doğrudan yönetime iletin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSent ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-base font-bold text-text-primary">Mesajınız Admine İletildi! 🎉</h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                Geri bildiriminiz için teşekkür ederiz. Admin mesajınızı en kısa sürede inceleyecektir.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sender Info Badge */}
              <div className="bg-surface-card/60 border border-border/60 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium">Gönderen:</span>
                <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                  {senderName || 'Kullanıcı'} ({senderRoleText})
                </span>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  KONU BAŞLIĞI <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yeni özellik önerisi, Ders takvimi hakkında..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-border/80 focus:border-primary/60 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none transition-all"
                />
              </div>

              {/* Message Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  MESAJINIZ / DETAYLAR <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Mesajınızı, düşüncelerinizi veya talebinizi detaylıca buraya yazabilirsiniz..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-background border border-border/80 focus:border-primary/60 rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-surface-card border border-border hover:bg-surface-hover text-text-secondary font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !message.trim()}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Gönderiliyor...' : 'Admine Gönder'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
