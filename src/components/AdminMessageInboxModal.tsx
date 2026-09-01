import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Trash2, X, Inbox } from 'lucide-react';

interface AdminMessageInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMessageInboxModal: React.FC<AdminMessageInboxModalProps> = ({ isOpen, onClose }) => {
  const { adminMessages, markAdminMessageRead, deleteAdminMessage } = useApp();
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  if (!isOpen) return null;

  const unreadCount = adminMessages.filter(m => !m.read).length;
  const selectedMsg = adminMessages.find(m => m.id === selectedMsgId);

  const handleSelect = (id: string) => {
    setSelectedMsgId(id);
    markAdminMessageRead(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-surface-card to-surface-card border-b border-border/60 p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center flex-shrink-0 font-bold">
              <Inbox size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>📩 Admin İletişim Kutusu</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount} Okunmamış
                  </span>
                )}
              </h3>
              <p className="text-xs text-text-secondary">
                Öğretmen ve öğrencilerden doğrudan gelen tüm mesajlar
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

        {/* Content Body (Split view on sm screens) */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-[350px]">
          {/* Messages List */}
          <div className={`w-full sm:w-1/2 border-r border-border/60 overflow-y-auto divide-y divide-border/40 p-2 space-y-1.5 ${selectedMsgId ? 'hidden sm:block' : 'block'}`}>
            {adminMessages.length > 0 ? (
              adminMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleSelect(msg.id)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer border relative group ${
                    selectedMsgId === msg.id 
                      ? 'bg-primary/15 border-primary/40 shadow-sm' 
                      : msg.read 
                        ? 'bg-surface-card/40 border-border/30 hover:bg-surface-hover/50' 
                        : 'bg-surface-card border-primary/30 shadow-inner font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      msg.senderRole === 'student'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {msg.senderRole === 'student' ? '👨‍🎓 Öğrenci' : '👨‍Öğretmen'}
                    </span>

                    <span className="text-[10px] text-text-muted">
                      {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className={`text-xs truncate ${msg.read ? 'text-text-primary' : 'text-primary font-bold'}`}>
                    {msg.subject}
                  </h4>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">{msg.senderName}: {msg.message}</p>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-2 text-text-muted">
                <Mail className="mx-auto w-10 h-10 opacity-40" />
                <p className="text-xs font-semibold">Henüz Admin Mesajı Bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Message Detail View */}
          <div className={`w-full sm:w-1/2 p-5 overflow-y-auto flex flex-col justify-between ${!selectedMsgId ? 'hidden sm:flex' : 'flex'}`}>
            {selectedMsg ? (
              <div className="space-y-4 flex-1">
                <button
                  onClick={() => setSelectedMsgId(null)}
                  className="sm:hidden text-xs font-bold text-primary flex items-center gap-1 mb-2"
                >
                  ← Listeye Dön
                </button>

                <div className="border-b border-border/60 pb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {selectedMsg.senderRole === 'student' ? '👨‍🎓 Öğrenci Mesajı' : '👨‍Öğretmen Mesajı'}
                    </span>
                    <button
                      onClick={() => {
                        deleteAdminMessage(selectedMsg.id);
                        setSelectedMsgId(null);
                      }}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      title="Mesajı Sil"
                    >
                      <Trash2 size={13} />
                      <span>Sil</span>
                    </button>
                  </div>
                  <h3 className="text-sm font-extrabold text-text-primary leading-snug">
                    {selectedMsg.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted pt-1">
                    <span className="font-bold text-text-primary">{selectedMsg.senderName}</span>
                    {selectedMsg.senderContact && <span>({selectedMsg.senderContact})</span>}
                  </div>
                </div>

                <div className="bg-surface-card/60 border border-border/60 rounded-2xl p-4 text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>

                <div className="text-[10px] text-text-muted text-right">
                  Gönderilme Tarihi: {new Date(selectedMsg.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
            ) : (
              <div className="m-auto text-center space-y-2 text-text-muted py-12">
                <Inbox className="mx-auto w-12 h-12 opacity-30 text-primary" />
                <p className="text-xs font-semibold text-text-secondary">Detaylarını görmek için soldaki mesajlardan birini seçin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
